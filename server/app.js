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
import { sequelize, connectMongo, connectRedis, redisClient } from './config/database.js';
import { login, register } from './controllers/authController.js';
import { verifyToken } from './middleware/authMiddleware.js';

// Import Integration Controllers
import { 
  handleIncomingMessage, 
  getInboxConversations, 
  getConversationMessages, 
  sendManualMessage 
} from './controllers/whatsappController.js';
import { 
  getConnections, createConnection, updateConnectionStatus, deleteConnection,
  getAIPersonas, saveAIPersona, deleteAIPersona
} from './controllers/chatcenterController.js';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus
} from './controllers/commerceController.js';
import { initiateCall, createVoiceCampaign } from './controllers/voipController.js';
import { deductCredits } from './controllers/creditsController.js';
import { scraperQueue } from './queues/scraperQueue.js';
import { getLeads, getLeadDetail, deleteLead, exportLeads, analyzeLead, updateLead, createLead } from './controllers/leadController.js';
import { requestRecharge, uploadReceipt, approvePayment, getPayments } from './controllers/paymentController.js';
import { handleAgentChat } from './controllers/agentController.js';
import { getBotConfig, updateBotConfig } from './controllers/botController.js';
import { createSmsCampaign } from './controllers/smsController.js';
import { getStats } from './controllers/dashboardController.js';
import { verifySuperAdmin } from './middleware/adminMiddleware.js';
import { getAllOrganizations, getAllUsers, resetUserPassword, updateOrganization, adjustUserCredits, getGlobalSettings, updateGlobalSetting } from './controllers/superAdminController.js';
import { getDashboardMetrics, getMyAgenda, createTask, updateTask, getBusinessProfile, updateBusinessProfile } from './controllers/crmController.js';
import { 
    startWahaSession, getWahaSessionStatus, getWahaQr, stopWahaSession, 
    getAllWahaSessions, deleteWahaSessionAdmin 
} from './controllers/wahaController.js';
import { getAllPlans, createPlan, updatePlan, deletePlan } from './controllers/planController.js';
import cron from 'node-cron';
import { performBackup } from './services/backupService.js';
import { startNotificationCron } from './services/notificationCron.js';
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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://esm.sh", "https://static.cloudflareinsights.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://esm.sh", "https://generativelanguage.googleapis.com"],
      upgradeInsecureRequests: null,
    },
  },
}));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registerMetrics.contentType);
  res.end(await registerMetrics.metrics());
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  // Skip logging for health checks to reduce noise
  if (process.env.NODE_ENV !== 'test' && req.originalUrl !== '/api/health') {
    logger.info(`Incoming ${req.method} request to ${req.originalUrl}`);
  }
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate Limiter configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10000, // Increased threshold for polling UI
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
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

app.use(express.json());

// --- DATABASE CONNECTION ---
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      const dbHost = sequelize.options.host || 'unknown';
      logger.info(`PostgreSQL Connected to: ${dbHost}`);
    } catch (e) { logger.error(`Postgres Connection Failed: ${e.message}`); }

    await connectMongo();
    await connectRedis();
  })();

  // --- CRON JOBS ---
  cron.schedule('0 3 * * *', () => {
    logger.info('Running Scheduled Backup...');
    performBackup();
  });
  
  // Start CRM Tracker Overdue Notification Cron
  startNotificationCron();
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
app.get('/api/payments', verifyToken, getPayments);
app.post('/api/payments/recharge', verifyToken, requestRecharge);
app.post('/api/payments/receipt', verifyToken, uploadReceipt);
app.post('/api/payments/:paymentId/approve', verifyToken, approvePayment);

// --- AI AGENT ROUTES ---
app.post('/api/agent/chat', verifyToken, handleAgentChat);

// --- CHATCENTER / INBOX ROUTES ---
app.get('/api/inbox/conversations', verifyToken, getInboxConversations);
app.get('/api/inbox/conversations/:id/messages', verifyToken, getConversationMessages);
app.post('/api/inbox/conversations/:id/send', verifyToken, sendManualMessage);

app.get('/api/chatcenter/connections', verifyToken, getConnections);
app.post('/api/chatcenter/connections', verifyToken, createConnection);
app.put('/api/chatcenter/connections/:id', verifyToken, updateConnectionStatus);
app.delete('/api/chatcenter/connections/:id', verifyToken, deleteConnection);

app.get('/api/chatcenter/personas', verifyToken, getAIPersonas);
app.post('/api/chatcenter/personas', verifyToken, saveAIPersona);
app.delete('/api/chatcenter/personas/:id', verifyToken, deleteAIPersona);

// --- WAHA / WHATSAPP QR SESSIONS ---
app.post('/api/waha/start', verifyToken, startWahaSession);
app.get('/api/waha/status', verifyToken, getWahaSessionStatus);
app.get('/api/waha/qr', verifyToken, getWahaQr);
app.post('/api/waha/stop', verifyToken, stopWahaSession);

// --- COMMERCE ROUTES ---
app.get('/api/commerce/categories', verifyToken, getCategories);
app.post('/api/commerce/categories', verifyToken, createCategory);
app.put('/api/commerce/categories/:id', verifyToken, updateCategory);
app.delete('/api/commerce/categories/:id', verifyToken, deleteCategory);

app.get('/api/commerce/products', verifyToken, getProducts);
app.post('/api/commerce/products', verifyToken, createProduct);
app.put('/api/commerce/products/:id', verifyToken, updateProduct);
app.delete('/api/commerce/products/:id', verifyToken, deleteProduct);

app.get('/api/commerce/orders', verifyToken, getOrders);
app.put('/api/commerce/orders/:id/status', verifyToken, updateOrderStatus);

// --- INTEGRATION ROUTES ---
app.post('/webhook/whatsapp', handleIncomingMessage);
app.post('/webhook/n8n', handleN8nIncoming); // Bidirectional integration
app.post('/api/call', verifyToken, validate(callSchema), initiateCall);

// --- CREDIT ROUTES ---
app.post('/api/credits/deduct', verifyToken, validate(deductionsSchema), deductCredits);

// --- CRM TRACKER ROUTES ---
app.get('/api/leads', verifyToken, getLeads);
app.get('/api/leads/:id', verifyToken, getLeadDetail);
app.post('/api/leads', verifyToken, createLead);
app.put('/api/leads/:id', verifyToken, updateLead);
app.delete('/api/leads/:id', verifyToken, deleteLead);

app.get('/api/crm/organization-metrics', verifyToken, getDashboardMetrics);
app.get('/api/crm/my-agenda', verifyToken, getMyAgenda);
app.post('/api/crm/tasks', verifyToken, createTask);
app.put('/api/crm/tasks/:id', verifyToken, updateTask);

// Business Profile Routes
app.get('/api/crm/business-profile', verifyToken, getBusinessProfile);
app.put('/api/crm/business-profile', verifyToken, updateBusinessProfile);

// API Routes
app.get('/api/health', async (req, res) => {
  const status = {
    service: 'WhatsCloud Scrapper API',
    uptime: process.uptime(),
    timestamp: new Date(),
    checks: {
      redis: 'unknown',
      postgres: 'unknown',
      browser_capability: 'ready'
    }
  };

  try {
    status.checks.redis = (redisClient && redisClient.isOpen) ? 'ok' : 'disconnected';
  } catch (e) { status.checks.redis = 'error'; }

  try {
    await sequelize.authenticate();
    status.checks.postgres = 'ok';
  } catch (e) { 
    status.checks.postgres = 'error'; 
    logger.warn(`[HEALTH] Postgres check failed: ${e.message}`);
  }

  // We return 200 even if degraded to prevent Docker from killing the container 
  // unless the entire process is unresponsive.
  res.json(status);
});

// PUBLIC SETTINGS (For Landing Page)
app.get('/api/public/settings', async (req, res) => {
    try {
        const { GlobalSetting } = await import('./models/index.js');
        const settings = await GlobalSetting.findAll({
            where: {
                key: ['support_whatsapp', 'site_name', 'site_description']
            }
        });
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
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
app.post('/api/leads', verifyToken, createLead);
app.get('/api/leads', verifyToken, getLeads);
app.get('/api/leads/export', verifyToken, exportLeads);
app.get('/api/leads/:id', verifyToken, getLeadDetail);
app.put('/api/leads/:id', verifyToken, updateLead);
app.post('/api/leads/:id/analyze', verifyToken, analyzeLead);
app.delete('/api/leads/:id', verifyToken, deleteLead);

// --- BOT MANAGEMENT ---
app.get('/api/bot/config', verifyToken, getBotConfig);
app.post('/api/bot/config', verifyToken, updateBotConfig);

// --- ADMIN PANEL (TENANT MANAGEMENT) ---
// Super Admin Routes
app.get('/api/admin/organizations', verifyToken, verifySuperAdmin, getAllOrganizations);
app.put('/api/admin/organizations/:id', verifyToken, verifySuperAdmin, updateOrganization);
app.get('/api/admin/users', verifyToken, verifySuperAdmin, getAllUsers);
app.post('/api/admin/users/:id/password', verifyToken, verifySuperAdmin, resetUserPassword);
app.post('/api/admin/credits/adjust', verifyToken, verifySuperAdmin, adjustUserCredits);
app.get('/api/admin/settings', verifyToken, verifySuperAdmin, getGlobalSettings);
app.post('/api/admin/settings', verifyToken, verifySuperAdmin, updateGlobalSetting);

// Custom Plans Management (God Mode)
app.get('/api/admin/plans', verifyToken, verifySuperAdmin, getAllPlans);
app.post('/api/admin/plans', verifyToken, verifySuperAdmin, createPlan);
app.put('/api/admin/plans/:id', verifyToken, verifySuperAdmin, updatePlan);
app.delete('/api/admin/plans/:id', verifyToken, verifySuperAdmin, deletePlan);

// --- ADMIN WAHA MANAGEMENT ---
app.get('/api/admin/waha/sessions', verifyToken, verifySuperAdmin, getAllWahaSessions);
app.delete('/api/admin/waha/sessions/:session', verifyToken, verifySuperAdmin, deleteWahaSessionAdmin);

// --- DASHBOARD ---
app.get('/api/dashboard/stats', verifyToken, getStats);

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route for SPA
app.get(/.*/, (req, res, next) => {
  // If it's an API route or has an extension (likely a file that failed to load as static), don't serve index.html
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(`Global Error: ${err.message}`, { 
      stack: err.stack, 
      path: req.originalUrl,
      body: req.body 
    });
    console.error('FULL ERROR STACK:', err);
  }
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    }
  });
});

export default app;
