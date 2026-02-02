import mongoose from 'mongoose';

const BotConfigSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  systemPrompt: { type: String, default: '' },
  knowledgeBase: { type: String, default: '' },
  temperature: { type: Number, default: 0.7 },
  actions: [{
    id: String,
    triggerCode: String,
    type: String,
    name: String,
    content: mongoose.Schema.Types.Mixed
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const BotConfig = mongoose.model('BotConfig', BotConfigSchema);
