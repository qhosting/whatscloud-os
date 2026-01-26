import { PROD_CONFIG } from './config';

// Este servicio simula la interacción con la infraestructura real en el frontend
export const storageService = {
  // REDIS: Operaciones de alta velocidad (Caché/Queue)
  redis: {
    set: async (key: string, value: any, ttl?: number) => {
      console.log(`[REDIS PUSH] Key: ${key} to ${PROD_CONFIG.REDIS.URI}`);
      localStorage.setItem(`redis_${key}`, JSON.stringify({
        data: value,
        expiry: ttl ? Date.now() + ttl * 1000 : null
      }));
    },
    get: async (key: string) => {
      const item = localStorage.getItem(`redis_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(`redis_${key}`);
        return null;
      }
      return parsed.data;
    }
  },

  // POSTGRESQL 16: Persistencia robusta
  db: {
    query: async (table: string, action: 'select' | 'insert' | 'update', payload?: any) => {
      console.log(`[POSTGRES 16] ${action.toUpperCase()} on ${PROD_CONFIG.DATABASE.NAME}.${table}`);
      // Simulación de persistencia
      if (action === 'insert' || action === 'update') {
        const existing = localStorage.getItem(`db_${table}`) || '[]';
        const data = JSON.parse(existing);
        // Lógica de upsert simplificada
        const newData = action === 'insert' ? [...data, payload] : data.map((d: any) => d.id === payload.id ? payload : d);
        localStorage.setItem(`db_${table}`, JSON.stringify(newData));
      }
    }
  }
};