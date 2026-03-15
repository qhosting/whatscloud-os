import { GoogleGenAI } from "@google/genai";
import logger from '../config/logger.js';

let ai = null;

const getAI = () => {
    if (ai) return ai;
    const apiKey = process.env.API_KEY?.trim();
    if (apiKey && apiKey !== '' && apiKey !== 'undefined') {
        try {
            ai = new GoogleGenAI(apiKey);
        } catch (error) {
            logger.error(`[AI-SERVICE] Failed to initialize Gemini: ${error.message}`);
        }
    }
    return ai;
};

/**
 * Analyzes a lead's data and returns a score (1-100) and a brief summary.
 */
export const scoreLead = async (leadData) => {
  const aiInstance = getAI();
  if (!aiInstance) return { score: null, summary: "AI not configured" };

  try {
    const model = aiInstance.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Analyze this business lead and provide a quality score (1-100) and a "Sales Strategy" summary.
      
      Business Info:
      - Name: ${leadData.name}
      - Niche: ${leadData.niche}
      - City: ${leadData.city}
      - Rating: ${leadData.rating} (${leadData.reviews} reviews)
      - Website: ${leadData.website || 'N/A'}
      - Phone: ${leadData.phone || 'N/A'}
      - Socials Found: ${JSON.stringify(leadData.metadata?.socials || {})}

      Task:
      1. Score (1-100): High score if it has good reviews, website, and phone.
      2. Summary: Provide a 1-sentence sales pitch or recommendation on why this lead is valuable.

      Return ONLY a JSON object:
      {"score": number, "summary": "string"}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean JSON response (sometimes Gemini adds ```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    return {
      score: analysis.score || 50,
      summary: analysis.summary || "No justification provided."
    };
  } catch (error) {
    logger.error(`[AI-SERVICE] Scoring Error: ${error.message}`);
    return { score: null, summary: "Failed to analyze lead." };
  }
};
