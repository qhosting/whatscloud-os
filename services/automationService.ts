
import { N8NPayload, Lead, SMSCampaignConfig, VoiceCampaignConfig, BotConfig } from '../types';
import { PROD_CONFIG } from './config';

// Endpoints reales de producción para WhatsCloud Ecosistema
const N8N_WEBHOOK_URL = 'https://n8n.whatscloud.mx/webhook/acc-orchestrator';

export const automationService = {
  /**
   * Ejecuta disparadores en el orquestador N8N de WhatsCloud.MX
   * Utiliza el Protocolo Grabovoi correspondiente a la acción.
   */
  trigger: async (payload: N8NPayload) => {
    console.debug(`[PROD_AUTH] Ejecutando acción: ${payload.action} en Cluster WhatsCloud`);
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-WhatsCloud-Auth': 'wc_prod_secure_bridge_v2'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Orquestador N8N respondió con error: ${response.status} - ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`[SYSTEM_CRITICAL] Fallo en protocolo ${payload.holding_identity.active_protocol}:`, error);
      
      // Persistencia de Logs de Error en PGSQL 16 (vía local log buffer)
      const errorLog = {
        id: `ERR_${Date.now()}`,
        type: 'ERROR',
        message: `Fallo en acción ${payload.action}: ${error instanceof Error ? error.message : 'Unknown Connection Error'}`,
        protocol: payload.holding_identity.active_protocol,
        timestamp: new Date().toISOString()
      };
      
      const currentLogs = JSON.parse(localStorage.getItem('db_system_logs') || '[]');
      localStorage.setItem('db_system_logs', JSON.stringify([errorLog, ...currentLogs.slice(0, 99)]));
      
      throw error;
    }
  },

  /**
   * Sincronización masiva de Leads con PostgreSQL 16
   */
  exportLeadsToDB: async (leads: Lead[], userId: string) => {
    return automationService.trigger({
      action: 'update_leads',
      userId,
      timestamp: new Date().toISOString(),
      module: 'LeadScrapper',
      role: 'ACCOUNT_OWNER',
      holding_identity: { 
        entity: 'Aurum Capital Holding', 
        engine: 'WhatsCloud Ecosistema', 
        active_protocol: 'ABUNDANCE_318_798' 
      },
      data: { leads, persistence_layer: 'whatscloud-os-db' }
    });
  }
};
