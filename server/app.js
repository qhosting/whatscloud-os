import './config/env.js'; // LOAD ENV FIRST
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';

// Import Database & Auth
import { sequelize, connectMongo, connectRedis } from './config/database.js';
import { login, register } from './controllers/authController.js';
import { verifyToken } from './middleware/authMiddleware.js';

// Import Integration Controllers
import { handleIncomingMessage } from './controllers/whatsappController.js';
import { initiateCall, createVoiceCampaign } from './controllers/voipController.js';
import { deductCredits } from './controllers/creditsController.js';
import { scraperQueue } from './queues/scraperQueue.js';
import { getLeads, getLeadDetail, deleteLead, exportLeads } from './controllers/leadController.js';
import { requestRecharge, uploadReceipt, approvePayment } from './controllers/paymentController.js';
import { handleAgentChat } from './controllers/agentController.js';
import { getBotConfig, updateBotConfig } from './controllers/botController.js';
import { createSmsCampaign } from './controllers/smsController.js';
import { getStats } from './controllers/dashboardController.js';
import cron from 'node-cron';
import { performBackup } from './services/backupService.js';
import { validate } from './middleware/validate.js';
import { registerSchema, loginSchema, scrapeSchema, callSchema, deductionsSchema } from './validations/schemas.js';
import client from 'prom-client';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// Create a Registry which registers the metrics
const registerMetrics = new client.Registry();
client.collectDefaultMetrics({ register: registerMetrics });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});
registerMetrics.registerMetric(httpRequestDurationMicroseconds);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlwares
app.use(helmet());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  if (process.env.NODE_ENV !== 'test') {
    logger.info(`Incoming ${req.method} request to ${req.originalUrl}`);
  }
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registerMetrics.contentType);
  res.end(await registerMetrics.metrics());
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate Limiter configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', globalLimiter);
}

// Restrictive CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://whatscloud.mx',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// --- STRIPE WEBHOOK (Must be before express.json()) ---
import { handleStripeWebhook } from './services/stripeService.js';
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event = req.body;
  // In production, verify signature with stripe.webhooks.constructEvent
  try {
    await handleStripeWebhook(JSON.parse(event.toString()));
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());

// --- DATABASE CONNECTION ---
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('PostgreSQL Connected');
    } catch (e) { logger.error(`Postgres Connection Failed: ${e.message}`); }

    await connectMongo();
    await connectRedis();
  })();

  // --- CRON JOBS ---
  cron.schedule('0 3 * * *', () => {
    logger.info('Running Scheduled Backup...');
    performBackup();
  });
}

// --- QUEUE WORKERS ---
import { voiceQueue } from './queues/voiceQueue.js';

// --- AUTH ROUTES ---
app.post('/api/auth/register', validate(registerSchema), register);
app.post('/api/auth/login', validate(loginSchema), login);

import { handleN8nIncoming } from './services/webhookService.js';

// --- VOIP & CAMPAIGN ROUTES ---
app.post('/api/call', verifyToken, initiateCall);
app.post('/api/voice/campaign', verifyToken, createVoiceCampaign);

// --- SMS ROUTES ---
app.post('/api/sms/campaign', verifyToken, createSmsCampaign);

// --- PAYMENT ROUTES ---
app.post('/api/payments/recharge', verifyToken, requestRecharge);
app.post('/api/payments/receipt', verifyToken, uploadReceipt);
app.post('/api/payments/:paymentId/approve', verifyToken, approvePayment);

// --- AI AGENT ROUTES ---
app.post('/api/agent/chat', verifyToken, handleAgentChat);

// --- INTEGRATION ROUTES ---
app.post('/webhook/whatsapp', handleIncomingMessage);
app.post('/webhook/n8n', handleN8nIncoming); // Bidirectional integration
app.post('/api/call', verifyToken, validate(callSchema), initiateCall);

// --- CREDIT ROUTES ---
app.post('/api/credits/deduct', verifyToken, validate(deductionsSchema), deductCredits);

// API Routes
app.get('/api/health', async (req, res) => {
  const status = {
    service: 'WhatsCloud Scrapper API',
    uptime: process.uptime(),
    timestamp: new Date(),
    checks: {
      redis: 'unknown',
      postgres: 'unknown',
      browser_capability: 'unknown'
    }
  };

  try {
    const { redisClient } = await import('./config/database.js');
    if (redisClient.isOpen) status.checks.redis = 'ok';
    else status.checks.redis = 'disconnected';
  } catch (e) { status.checks.redis = 'error'; }

  try {
    const { sequelize } = await import('./config/database.js');
    await sequelize.authenticate();
    status.checks.postgres = 'ok';
  } catch (e) { status.checks.postgres = 'error'; }

  try {
    status.checks.browser_capability = 'ready';
  } catch (e) { status.checks.browser_capability = 'missing_libs'; }

  const statusCode = (status.checks.redis === 'error' || status.checks.postgres === 'error') ? 503 : 200;
  res.status(statusCode).json(status);
});

/**
 * @openapi
 * /api/scrape:
 *   post:
 *     summary: Initiate a scraping job for Google Maps leads
 *     tags: [Scraping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [niche, city]
 *             properties:
 *               niche:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               limit:
 *                 type: integer
 *                 default: 5
 *     responses:
 *       200:
 *         description: Scraping started successfully
 */
// PROTECTED ROUTE: SCRAPING (ASYNC QUEUE)
app.post('/api/scrape', verifyToken, validate(scrapeSchema), async (req, res) => {
  const { niche, city, country, limit = 5 } = req.body;
  const user = req.user;

  try {
    const job = await scraperQueue.add({
      niche,
      city,
      country,
      limit,
      userId: user.id,
      organizationId: user.organizationId
    });

    res.json({
      success: true,
      message: 'Scraping started in background',
      jobId: job.id
    });
  } catch (error) {
    logger.error(`[SCRAPER] Queue Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to queue job' });
  }
});

/**
 * @openapi
 * /api/scrape/{jobId}:
 *   get:
 *     summary: Check status of a scraping job
 *     tags: [Scraping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status and potentially results
 */
// JOB STATUS POLLING
app.get('/api/scrape/:jobId', verifyToken, async (req, res) => {
  const { jobId } = req.params;
  const job = await scraperQueue.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const state = await job.getState();
  const progress = job.progress();
  const result = job.returnvalue;
  const reason = job.failedReason;

  res.json({
    id: job.id,
    state,
    progress,
    result,
    error: reason
  });
});

// --- LEAD MANAGEMENT ---
app.get('/api/leads', verifyToken, getLeads);
app.get('/api/leads/export', verifyToken, exportLeads);
app.get('/api/leads/:id', verifyToken, getLeadDetail);
app.delete('/api/leads/:id', verifyToken, deleteLead);

// --- BOT MANAGEMENT ---
app.get('/api/bot/config', verifyToken, getBotConfig);
app.post('/api/bot/config', verifyToken, updateBotConfig);

// --- DASHBOARD ---
app.get('/api/dashboard/stats', verifyToken, getStats);

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(`Global Error: ${err.message}`, { stack: err.stack, path: req.originalUrl });
  }
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    }
  });
});

export default app;
