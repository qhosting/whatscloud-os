import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchFilters, BotConfig, SmartAction, ChatMessage, LongTermMemory } from "../types";

// NOTE: Frontend AI client is kept for Chat Simulator but should use a proxy in production.
// For Scraper, we use the Backend API exclusively.
let ai: any = null;

const getAI = () => {
  if (ai) return ai;
  const apiKey = (process.env.API_KEY || '').trim();
  if (apiKey && apiKey !== '' && apiKey !== 'undefined') {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const geminiService = {
  // Motor de Scraping Real (Puppeteer en Servidor)
  scrapeLeads: async (filters: SearchFilters, onProgress?: (p: number) => void): Promise<Lead[]> => {
    try {
      console.log("[SCRAPER] Iniciando protocolo de extracción real...");

      const token = localStorage.getItem('wc_auth_token');
      if (!token) throw new Error("No Auth Token");

      // 1. Start Job
      const startResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niche: filters.niche,
          city: filters.city,
          country: filters.country,
          limit: filters.limit || 10 // Aumentamos el límite por defecto
        })
      });

      if (!startResponse.ok) throw new Error("Failed to start scraping job");

      const { jobId } = await startResponse.json();

      // 2. Poll for Results
      return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
              try {
                  const pollResponse = await fetch(`/api/scrape/${jobId}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const status = await pollResponse.json();

                  if (onProgress) onProgress(status.progress || 0);

                  if (status.state === 'completed') {
                      clearInterval(interval);
                      resolve(status.result);
                  } else if (status.state === 'failed') {
                      clearInterval(interval);
                      reject(new Error(status.error || "Scraping failed"));
                  }
              } catch (e) {
                  clearInterval(interval);
                  reject(e);
              }
          }, 1500); // Polling más rápido
      });

    } catch (error) {
      console.error("Error en scraping real:", error);
      throw error;
    }
  },

  // Simulador de Chat (Mantiene lógica local para rapidez, pero puede usar el backend)
  chatWithBot: async (history: ChatMessage[], newMessage: string, config: BotConfig, memory: LongTermMemory): Promise<{ text: string; actionTrigger?: string }> => {
     // ... (Local logic remains unchanged for legacy support)
     return { text: "Use chatWithAgentBackend for real neural memory", actionTrigger: undefined };
  },

  // MOTOR NEURAL REAL (BACKEND CON PERSISTENCIA POSTGRES)
  chatWithAgentBackend: async (message: string, contactId?: string): Promise<{ text: string; actionTriggered?: any }> => {
    try {
      const token = localStorage.getItem('wc_auth_token');
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, contactId })
      });

      if (!response.ok) throw new Error("Agent connection failed");
      const data = await response.json();
      return { 
          text: data.response, 
          actionTriggered: data.actionTriggered 
      };
    } catch (error) {
       console.error("[AGENT-BACKEND] Error:", error);
       return { 
           text: "Error de conexión con el núcleo neural.", 
           actionTriggered: undefined 
       };
    }
  },

  // THE HIPPOCAMPUS: Updates Long Term Memory based on new interaction
  // PROTOCOL: 719 31 (Eternal Memory / Retention)
  updateLongTermMemory: async (currentMemory: LongTermMemory, lastUserMessage: string, lastBotMessage: string): Promise<LongTermMemory> => {
    try {
        const prompt = `
            [SYSTEM: ACTIVATE PROTOCOL 719 31 - ETERNAL RETENTION]
            Analyze the following interaction and update the User Memory JSON.
            
            Current Memory:
            ${JSON.stringify(currentMemory)}

            Interaction:
            User: "${lastUserMessage}"
            Bot: "${lastBotMessage}"

            Instructions:
            1. Extract the user's name if mentioned.
            2. Add new preferences (likes, dislikes) to the list.
            3. Update sentiment based on user tone.
            4. Extract contact info (phone, email) if present.
            5. Add any other relevant fact to 'custom_facts'.
            6. Return the FULL updated JSON object. Do not remove existing data unless contradicted.
        `;

        const aiInstance = getAI();
        if (!aiInstance) return currentMemory;

        const response = await aiInstance.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        user_name: { type: Type.STRING },
                        user_preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
                        last_topic: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
                        contact_info: {
                            type: Type.OBJECT,
                            properties: {
                                phone: { type: Type.STRING },
                                email: { type: Type.STRING }
                            }
                        },
                        custom_facts: { type: Type.OBJECT, additionalProperties: true }
                    }
                }
            }
        });
        
        const updatedMemory = JSON.parse(response.text || '{}');
        return { ...currentMemory, ...updatedMemory };

    } catch (error) {
        console.error("Memory Update Failed:", error);
        return currentMemory;
    }
  },

  // Intelligence Singularity: Strategic Analysis via Backend
  analyzeLeadStrategy: async (lead: Lead): Promise<string> => {
    try {
        const token = localStorage.getItem('wc_auth_token');
        const response = await fetch(`/api/leads/${lead.id}/analyze`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Backend analysis failed");
        const data = await response.json();
        return data.strategy || "Análisis no disponible actualmente.";
    } catch (error) {
        console.error("Analysis Error:", error);
        return "Error al conectar con la IA de Estrategia.";
    }
  }
};