import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../models/index.js';
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const register = async (req, res) => {
  const { email, password, role, orgName } = req.body;

  const t = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Multi-tenant logic: Create organization if user is owner
    let organizationId = null;
    if (role !== 'SUPER_ADMIN') {
      const org = await Organization.create({
        name: orgName || `${email.split('@')[0]}'s Org`,
        slug: `${email.split('@')[0]}-${Date.now()}`
      }, { transaction: t });
      organizationId = org.id;
    }

    const user = await User.create({
      email,
      password_hash,
      role: role || 'ACCOUNT_OWNER',
      organizationId
    }, { transaction: t });

    await t.commit();

    const token = jwt.sign({ id: user.id, role: user.role, organizationId: user.organizationId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        organizationId: user.organizationId
      }
    });

  } catch (error) {
    await t.rollback();
    logger.error(`Register Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({
      id: user.id,
      role: user.role,
      organizationId: user.organizationId
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        organizationId: user.organizationId
      }
    });

  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
