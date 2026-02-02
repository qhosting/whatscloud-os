import { GoogleGenAI } from "@google/genai";
import { BotConfig } from '../models/BotConfig.js';
import axios from 'axios';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// WAHA API URL (Simulated or Real Env Var)
const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000/api/waha';

export const handleIncomingMessage = async (req, res) => {
  // WAHA Payload Structure (Simplified)
  // { payload: { from: '5215512345678@c.us', body: 'Hola', ... } }
  const { payload } = req.body;

  if (!payload || !payload.from || !payload.body) {
    return res.status(400).json({ error: 'Invalid Webhook Payload' });
  }

  const sender = payload.from;
  const message = payload.body;
  const userId = req.query.userId || 'default_user'; // En prod, vendría del webhook config

  console.log(`[WHATSAPP] Msg from ${sender}: ${message}`);

  // 1. Load Bot Config from Mongo
  let botConfig;
  try {
      botConfig = await BotConfig.findOne({ userId });
  } catch (e) {
      console.error("DB Error", e);
  }

  if (!botConfig) {
      // Fallback response if no bot configured
      return res.sendStatus(200);
  }

  // 2. Process with Gemini
  try {
      const prompt = `
        [System: ${botConfig.systemPrompt}]
        [Knowledge: ${botConfig.knowledgeBase}]
        User: ${message}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const reply = response.text || "Lo siento, no puedo responder ahora.";

      // 3. Send Reply via WAHA
      // WAHA uses POST /api/sendText
      await axios.post(`${WAHA_API_URL}/sendText`, {
          session: 'default',
          chatId: sender,
          text: reply
      });

      console.log(`[WHATSAPP] Replied: ${reply}`);

  } catch (error) {
      console.error("[WHATSAPP] Error processing bot logic:", error);
  }

  res.sendStatus(200); // Acknowledge Webhook
};
