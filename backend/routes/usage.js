import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
const DAILY_LIMIT_SECONDS = 10 * 60; // 10 minutes

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// @route   GET /api/usage/status
// @desc    Get current usage status for the user
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const today = new Date().toISOString().split('T')[0];

    // Reset if it's a new day
    if (!user.dailyUsage || user.dailyUsage.date !== today) {
      user.dailyUsage = { date: today, secondsUsed: 0 };
      await user.save();
    }

    res.json({
      success: true,
      isAdmin: user.isAdmin,
      dailyLimitSeconds: DAILY_LIMIT_SECONDS,
      secondsUsed: user.dailyUsage.secondsUsed,
      secondsRemaining: user.isAdmin ? Infinity : Math.max(0, DAILY_LIMIT_SECONDS - user.dailyUsage.secondsUsed),
      limitReached: user.isAdmin ? false : user.dailyUsage.secondsUsed >= DAILY_LIMIT_SECONDS
    });
  } catch (error) {
    console.error('Usage status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/usage/track
// @desc    Add seconds to the user's daily usage
router.post('/track', authMiddleware, async (req, res) => {
  try {
    const { seconds } = req.body;
    if (typeof seconds !== 'number' || seconds < 0) {
      return res.status(400).json({ success: false, message: 'Invalid seconds value' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Admin has unlimited access
    if (user.isAdmin) {
      return res.json({
        success: true,
        isAdmin: true,
        secondsUsed: 0,
        secondsRemaining: Infinity,
        limitReached: false
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Reset if new day
    if (!user.dailyUsage || user.dailyUsage.date !== today) {
      user.dailyUsage = { date: today, secondsUsed: 0 };
    }

    user.dailyUsage.secondsUsed += seconds;
    await user.save();

    const remaining = Math.max(0, DAILY_LIMIT_SECONDS - user.dailyUsage.secondsUsed);

    res.json({
      success: true,
      isAdmin: false,
      secondsUsed: user.dailyUsage.secondsUsed,
      secondsRemaining: remaining,
      limitReached: remaining <= 0
    });
  } catch (error) {
    console.error('Usage track error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
