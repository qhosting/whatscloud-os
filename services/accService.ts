import { ACCProfile } from '../types';

// Simulación de respuesta del API de Aurum Control Center
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

export const accService = {
  // 1. Handshake / Validación bajo Protocolo de Éxito
  validateSubscription: async (): Promise<ACCProfile> => {
    return new Promise((resolve, reject) => {
      console.log("[ACC SYSTEM] Iniciando Handshake. Protocolo Activo: 519 7148 (Normalización de Eventos)");
      
      setTimeout(() => {
        // Simulamos una validación exitosa
        if (MOCK_PROFILE.subscriptionStatus === 'active') {
          console.log("[ACC SYSTEM] Handshake Autorizado. Singularity Operativa: ON.");
          resolve({ ...MOCK_PROFILE });
        } else {
          console.error("[ACC SYSTEM] Handshake Fallido. Protocolo de Protección 8888 Activado.");
          reject(new Error('Suscripción inactiva en Aurum Control Center'));
        }
      }, 800);
    });
  },

  // 4. Consumo de Créditos (Trigger al ACC)
  deductCredits: async (amount: number): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_PROFILE.credits = Math.max(0, MOCK_PROFILE.credits - amount);
        console.log(`[ACC TRANSACTION] Protocol 519 7148. Deducted ${amount} credits. Remaining: ${MOCK_PROFILE.credits}`);
        resolve(MOCK_PROFILE.credits);
      }, 500);
    });
  }
};