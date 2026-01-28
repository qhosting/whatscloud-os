import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchFilters, BotConfig, SmartAction, ChatMessage, LongTermMemory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Motor de Scraping Real (Puppeteer en Servidor)
  // PROTOCOLO: 318 798 (Abundancia Financiera y Flujo)
  scrapeLeads: async (filters: SearchFilters): Promise<Lead[]> => {
    try {
      console.log("[SCRAPER] Iniciando protocolo de extracción real...");

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          niche: filters.niche,
          city: filters.city,
          country: filters.country,
          limit: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const leads = await response.json();
      return leads;

    } catch (error) {
      console.error("Error en scraping real (Protocol 8888 Active):", error);
      alert("Error conectando con el servidor de scraping. Ver consola.");
      return [];
    }
  },

  // Simula el Chatbot con Memoria y Smart Actions
  // PROTOCOLO: 519 7148 (Éxito y Armonización)
  chatWithBot: async (history: ChatMessage[], newMessage: string, config: BotConfig, memory: LongTermMemory): Promise<{ text: string; actionTrigger?: string }> => {
    try {
      // 1. Construir Contexto de Acciones
      let actionsInstruction = "\n\n--- SMART ACTIONS AVAILABLE (TOOLS) ---\n";
      actionsInstruction += "If the user request matches one of these intents, output ONLY the trigger code inside curly braces. Do not add text before or after.\n";
      config.actions.forEach(action => {
        actionsInstruction += `- Action Name: "${action.name}". Trigger Code: "${action.triggerCode}". Type: ${action.type}\n`;
      });

      // 2. Construir Historial de Conversación (Memoria a Corto Plazo)
      const recentHistory = history.slice(-10).map(msg => {
        return `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.text}`;
      }).join('\n');

      // 3. Inject Long Term Memory (The Hippocampus)
      const memoryContext = `
      --- LONG TERM MEMORY (USER FACTS) ---
      User Name: ${memory.user_name || 'Unknown'}
      Preferences: ${memory.user_preferences?.join(', ') || 'None'}
      Sentiment: ${memory.sentiment || 'Neutral'}
      Contact Info: ${JSON.stringify(memory.contact_info || {})}
      Other Facts: ${JSON.stringify(memory.custom_facts || {})}
      `;

      // 4. Prompt Engineering final con Protocolo
      const fullPrompt = `
        [SYSTEM: ACTIVATE PROTOCOL 519 7148 - HARMONIOUS SUCCESS]
        ${config.systemPrompt}

        --- BUSINESS KNOWLEDGE BASE (FACTS & RULES) ---
        Use the following information to answer user questions accurately:
        ${config.knowledgeBase || "No specific knowledge base provided."}

        ${memoryContext}

        ${actionsInstruction} 
        
        --- CONVERSATION HISTORY ---
        ${recentHistory}
        User: ${newMessage}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
        config: {
          temperature: config.temperature,
        }
      });

      const responseText = response.text || "";
      
      // Detectar Trigger Code
      const triggerMatch = responseText.match(/{{ACTION_[A-Z0-9_]+}}/);
      
      if (triggerMatch) {
        return {
          text: "", 
          actionTrigger: triggerMatch[0]
        };
      }

      return {
        text: responseText,
        actionTrigger: undefined
      };

    } catch (error) {
      console.error("Error en chat simulation (Protocol 8888 Active):", error);
      return { text: "Error simulando respuesta de IA (Check Console).", actionTrigger: undefined };
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