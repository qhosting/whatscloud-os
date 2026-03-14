import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchFilters, BotConfig, SmartAction, ChatMessage, LongTermMemory } from "../types";

// NOTE: Frontend AI client is kept for Chat Simulator but should use a proxy in production.
// For Scraper, we use the Backend API exclusively.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  // Motor de Scraping Real (Puppeteer en Servidor)
  // PROTOCOLO: 318 798 (Abundancia Financiera y Flujo)
  scrapeLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    try {
      console.log("[SCRAPER] Iniciando protocolo de extracción real...");

      const token = localStorage.getItem('wc_auth_token');
      if (!token) {
        alert("Sesión expirada. Por favor recarga e inicia sesión.");
        throw new Error("No Auth Token");
      }

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
          limit: 5
        })
      });

      if (!startResponse.ok) throw new Error("Failed to start scraping job");

      const { jobId } = await startResponse.json();
      console.log(`[SCRAPER] Job Started: ${jobId}. Polling...`);

      // 2. Poll for Results
      return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
              try {
                  const pollResponse = await fetch(`/api/scrape/${jobId}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const status = await pollResponse.json();

                  console.log(`[SCRAPER] Job Status: ${status.state} (${status.progress}%)`);

                  if (status.state === 'completed') {
                      clearInterval(interval);
                      resolve(status.result);
                  } else if (status.state === 'failed') {
                      clearInterval(interval);
                      reject(new Error(status.error || "Scraping failed"));
                  }
                  // continue waiting if active/waiting/delayed
              } catch (e) {
                  clearInterval(interval);
                  reject(e);
              }
          }, 2000); // Check every 2s
      });

    } catch (error) {
      console.error("Error en scraping real (Protocol 8888 Active):", error);
      alert("Error conectando con el servidor de scraping. Ver consola.");
      return [];
    }
  },

  // Simulador de Chat (Mantiene lógica local para rapidez, pero puede usar el backend)
  chatWithBot: async (history: ChatMessage[], newMessage: string, config: BotConfig, memory: LongTermMemory): Promise<{ text: string; actionTrigger?: string }> => {
     // ... (Local logic remains unchanged for legacy support)
     return { text: "Use chatWithAgentBackend for real neural memory", actionTrigger: undefined };
  },

  // MOTOR NEURAL REAL (BACKEND CON PERSISTENCIA POSTGRES)
  chatWithAgentBackend: async (message: string, contactId?: string): Promise<string> => {
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
      return data.response;
    } catch (error) {
       console.error("[AGENT-BACKEND] Error:", error);
       return "Error de conexión con el núcleo neural.";
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

        const response = await ai.models.generateContent({
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

  // Intelligence Singularity: Análisis Estratégico
  // PROTOCOLO: 318 798 (Visión de Negocio)
  analyzeLeadStrategy: async (lead: Lead): Promise<string> => {
    try {
        const prompt = `
            [SYSTEM: ACTIVATE PROTOCOL 318 798 - STRATEGIC VISION]
            Analiza este negocio extraído de Google Maps y genera una "Estrategia de Entrada" de 1 frase corta para venderle un Chatbot IA.
            
            Negocio: ${lead.businessName}
            Rubro: ${lead.category}
            Rating: ${lead.rating} (${lead.reviews} reviews)

            Reglas:
            - Si tiene bajo rating: Enfócate en "Mejorar atención al cliente y reputación".
            - Si tiene muchas reviews: Enfócate en "Automatizar el alto volumen de pedidos".
            - Si es un rubro de citas (dentista, spa): Enfócate en "Agenda automática 24/7".
            - Tono: Profesional, directo y persuasivo.
            - Output: Solo la frase estratégica.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return response.text?.trim() || "Oportunidad de automatización general detectada.";
    } catch (error) {
        return "Análisis no disponible (Protocol 8888)";
    }
  }
};