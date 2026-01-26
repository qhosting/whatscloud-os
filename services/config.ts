export const PROD_CONFIG = {
  DOMAIN: 'WhatsCloud.MX',
  DATABASE: {
    NAME: 'whatscloud-os-db',
    VERSION: 'PostgreSQL 16',
    EXTENSIONS: ['pgvector', 'jsonb_ops'],
  },
  REDIS: {
    URI: 'redis://default:5faf81de3571e8b7146c@qhosting_redis:6379',
    PURPOSE: ['Session Cache', 'Message Queue (N8N)', 'Rate Limiting'],
  },
  PROTOCOLS: {
    PRIMARY: '519 7148',
    ABUNDANCE: '318 798',
    SECURITY: '8888'
  }
};