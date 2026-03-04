import { User, CreditTransaction } from '../models/index.js';
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';

export const deductCredits = async (req, res) => {
  const { amount } = req.body;
  const userReq = req.user;

  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userReq.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < amount) {
      await t.rollback();
      return res.status(402).json({ error: 'Insufficient credits', current: user.credits });
    }

    user.credits -= amount;
    await user.save({ transaction: t });

    // Create Audit Record
    await CreditTransaction.create({
      amount: -amount,
      type: 'DEDUCTION',
      userId: user.id,
      organizationId: user.organizationId,
      reason: 'Lead Scraper Usage'
    }, { transaction: t });

    await t.commit();
    logger.info(`Credits deducted for user ${user.id}: ${amount}`);
    res.json({ success: true, remaining: user.credits });

  } catch (error) {
    await t.rollback();
    logger.error(`Credit Deduction Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
