// Re-export the shared logger from its canonical location.
// This shim exists to prevent ERR_MODULE_NOT_FOUND if any file
// imports logger from utils/ instead of config/.
export { default } from '../config/logger.js';
