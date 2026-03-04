import dotenv from 'dotenv';
dotenv.config();
if (process.env.NODE_ENV !== 'test') {
    console.log('[ENV] Environment variables loaded');
}
