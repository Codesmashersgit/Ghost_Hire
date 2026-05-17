import express from 'express';
import Session from '../models/Session.js';

const router = express.Router();

// Get all interview sessions for a specific user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId query parameter is required' });
  }

  try {
    const userSessions = await Session.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: userSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save a new interview session
router.post('/save', async (req, res) => {
  const { userId, title, transcript, duration } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  try {
    const newSession = new Session({
      userId,
      title: title || 'Interview Session',
      transcript: transcript || [],
      duration: duration || '00:00:00'
    });

    await newSession.save();
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
