import { ACCProfile } from '../types';

// Perfil base para usuarios normales
const MOCK_PROFILE: ACCProfile = {
  userId: 'wc_user_8821',
  name: 'Carlos Emprendedor',
  role: 'ACCOUNT_OWNER', 
  subscriptionStatus: 'active',
  credits: 150,
  defaultLocation: {
    country: 'México',
    state: 'CDMX',
    city: 'Benito Juárez',
    colonia: 'Narvarte Poniente'
  }
};

// Perfil Superadmin solicitado para producción
const SUPER_ADMIN_PROFILE: ACCProfile = {
  userId: 'wc_admin_god',
  name: 'QHosting SuperAdmin',
  role: 'SUPER_ADMIN',
  subscriptionStatus: 'active',
  credits: 999999,
  defaultLocation: {
    country: 'México',
    state: 'CDMX',
    city: 'Santa Fe',
    colonia: 'Corporativo Q'
  }
};

export const accService = {
  // Login de producción con credenciales específicas
  login: async (email: string, password: string): Promise<ACCProfile> => {
    return new Promise((resolve, reject) => {
      console.log(`[ACC AUTH] Intentando login para: ${email}. Protocolo: 519 7148`);
      
      setTimeout(() => {
        if (email === 'admin@qhosting.net' && password === 'x0420EZS*') {
          console.log("[ACC AUTH] Superadmin identificado. Acceso concedido (MODO DIOS).");
          resolve(SUPER_ADMIN_PROFILE);
        } else if (email === 'demo@whatscloud.mx') {
          resolve(MOCK_PROFILE);
        } else {
          console.error("[ACC AUTH] Credenciales inválidas. Protocolo 8888 (Protección).");
          reject(new Error('Credenciales incorrectas o cuenta no migrada al cluster whatscloud-os-db.'));
        }
      }, 1200);
    });
  },

  validateSubscription: async (): Promise<ACCProfile> => {
    return new Promise((resolve) => {
      console.log("[ACC SYSTEM] Validando sesión persistente...");
      setTimeout(() => resolve(MOCK_PROFILE), 500);
    });
  },

  deductCredits: async (amount: number): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // En una implementación real, esto consultaría la DB
        resolve(100); // Mock deduction
      }, 500);
    });
  }
};