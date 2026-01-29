import './config/env.js'; // LOAD ENV FIRST
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

// Import Database & Auth
import { sequelize, connectMongo, connectRedis } from './config/database.js';
import { login, register } from './controllers/authController.js';
import { verifyToken } from './middleware/authMiddleware.js';

// Import Integration Controllers
import { handleIncomingMessage } from './controllers/whatsappController.js';
import { initiateCall } from './controllers/voipController.js';
import { deductCredits } from './controllers/creditsController.js';
import { scraperQueue } from './queues/scraperQueue.js';
import cron from 'node-cron';
import { performBackup } from './services/backupService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CRON JOBS ---
// Run Backup daily at 3:00 AM
cron.schedule('0 3 * * *', () => {
    console.log('[CRON] Running Scheduled Backup...');
    performBackup();
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Auto-create tables (Dev Mode)
        console.log('[DB] PostgreSQL Connected & Synced');
    } catch (e) { console.error('[DB] Postgres Connection Failed', e.message); }

    await connectMongo();
    await connectRedis();
})();

// --- AUTH ROUTES ---
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// --- INTEGRATION ROUTES ---
app.post('/webhook/whatsapp', handleIncomingMessage); // WAHA Webhook
app.post('/api/call', verifyToken, initiateCall); // VoIP Action

// --- CREDIT ROUTES ---
app.post('/api/credits/deduct', verifyToken, deductCredits);

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

  // Check Redis
  try {
    const { redisClient } = await import('./config/database.js');
    if (redisClient.isOpen) status.checks.redis = 'ok';
    else status.checks.redis = 'disconnected';
  } catch (e) { status.checks.redis = 'error'; }

  // Check Postgres
  try {
    const { sequelize } = await import('./config/database.js');
    await sequelize.authenticate();
    status.checks.postgres = 'ok';
  } catch (e) { status.checks.postgres = 'error'; }

  // Check Browser (Puppeteer)
  // Only check if not overloaded, lightly
  try {
     const puppeteer = await import('puppeteer');
     // Just check if executable path is valid or libs present,
     // fully launching browser might be too heavy for a simple health check
     // if called frequently by orchestrator.
     // We'll trust if dependencies are installed.
     status.checks.browser_capability = 'ready';
  } catch (e) { status.checks.browser_capability = 'missing_libs'; }

  const statusCode = (status.checks.redis === 'error' || status.checks.postgres === 'error') ? 503 : 200;
  res.status(statusCode).json(status);
});

// PROTECTED ROUTE: SCRAPING (ASYNC QUEUE)
app.post('/api/scrape', verifyToken, async (req, res) => {
  const { niche, city, country, limit = 5 } = req.body;
  const user = req.user;

  console.log(`[SCRAPER] Queuing Job for User ${user.id}: ${niche} in ${city}`);

  if (!niche || !city) {
    return res.status(400).json({ error: 'Missing niche or city' });
  }

  try {
      // Add to Bull Queue
      const job = await scraperQueue.add({
          niche,
          city,
          country,
          limit,
          userId: user.id
      });

      res.json({
          success: true,
          message: 'Scraping started in background',
          jobId: job.id
      });

  } catch (error) {
      console.error('[SCRAPER] Queue Error:', error);
      res.status(500).json({ error: 'Failed to queue job' });
  }
});

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
        state,      // active, completed, failed, delayed, waiting
        progress,   // 0 to 100
        result,     // The leads (if completed)
        error: reason
    });
});

// Serve Static Files (Vite Build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
