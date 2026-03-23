import app from './app.js';
import logger from './config/logger.js';
import { initCrons } from './services/cronService.js';
import { checkWahaHealth } from './controllers/wahaController.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    
    // CRM: Initialize automated tasks
    initCrons();

    // WAHA: Check service status on startup
    checkWahaHealth();
});
