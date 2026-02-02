import { User } from '../models/User.js';

export const deductCredits = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id; // From verifyToken

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.credits < amount) {
      return res.status(402).json({ error: 'Insufficient credits', current: user.credits });
    }

    user.credits -= amount;
    await user.save();

    res.json({ success: true, remaining: user.credits });

  } catch (error) {
    console.error('Credit Deduction Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
