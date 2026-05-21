import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// Admin authentication middleware
const adminMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics for administration
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    
    // Calculate total usage (seconds) across non-admin users
    const users = await User.find({ isAdmin: false });
    const totalSecondsUsed = users.reduce((sum, u) => sum + (u.dailyUsage?.secondsUsed || 0), 0);

    // Calculate total revenue from paid invoices
    const invoices = await Invoice.find({ status: 'Paid' });
    const totalRevenue = invoices.reduce((sum, inv) => {
      const val = parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0;
      return sum + val;
    }, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSessions,
        totalInvoices,
        totalMinutesUsed: Math.round(totalSecondsUsed / 60),
        totalRevenue: `$${totalRevenue.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all registered users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/toggle-admin
// @desc    Grant/Revoke administrator status to a user
router.post('/users/:id/toggle-admin', adminMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent self-demotion
    if (targetUser._id.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own admin rights' });
    }

    targetUser.isAdmin = !targetUser.isAdmin;
    await targetUser.save();

    res.json({
      success: true,
      message: `User ${targetUser.name} is now ${targetUser.isAdmin ? 'an Admin' : 'a standard User'}`,
      data: targetUser
    });
  } catch (error) {
    console.error('Admin toggle-admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/reset-usage
// @desc    Reset a user's daily usage limits back to 0
router.post('/users/:id/reset-usage', adminMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    targetUser.dailyUsage = { date: today, secondsUsed: 0 };
    await targetUser.save();

    res.json({
      success: true,
      message: `Usage stats reset for ${targetUser.name}`,
      data: targetUser
    });
  } catch (error) {
    console.error('Admin reset-usage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a registered user and their associated data
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent self-deletion
    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Clean up sessions and invoices
    await Session.deleteMany({ userId: targetUserId });
    await Invoice.deleteMany({ userId: targetUserId });

    res.json({ success: true, message: `Successfully deleted user ${deletedUser.name} and all their session/invoice data.` });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/sessions
// @desc    Get all active sessions in the database
router.get('/sessions', adminMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Admin sessions fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/invoices
// @desc    Get all billing history in the system
router.get('/invoices', adminMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Admin invoices fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
