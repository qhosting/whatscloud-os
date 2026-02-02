import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// 1. PostgreSQL Connection (Sequelize)
export const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/whatscloud', {
  dialect: 'postgres',
  logging: false,
});

// 2. MongoDB Connection
export const connectMongo = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/whatscloud';
    await mongoose.connect(mongoUrl);
    console.log('[DB] MongoDB Connected');
  } catch (error) {
    console.error('[DB] MongoDB Connection Error:', error.message);
  }
};

// 3. Redis Connection
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('[DB] Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('[DB] Redis Connected');
    } catch (error) {
        console.error('[DB] Redis Connection Error:', error.message);
    }
};
