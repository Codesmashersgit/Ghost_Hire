import express from 'express';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get all invoices for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  try {
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create/Simulate a new payment invoice (when user upgrades)
router.post('/pay', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: 'userId and amount are required' });
  }

  try {
    const invoiceNum = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newInvoice = new Invoice({
      userId,
      invoiceId: invoiceNum,
      amount,
      status: 'Paid'
    });

    await newInvoice.save();
    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
