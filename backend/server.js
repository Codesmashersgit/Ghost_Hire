import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ───── Security Middleware ─────
app.use(helmet());

// CORS - allow Electron (file://) and optionally your web domain
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'https://ghosthireweb.netlify.app'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Accept requests with no origin (electron/file://) or explicit 'null' string
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' })); // Prevent large payload attacks

// ───── Rate Limiting ─────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/signup attempts per IP
  message: { success: false, message: 'Too many attempts, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, message: 'Rate limit exceeded.' }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to Interview_Tool!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'GhostHire Backend Running', version: '1.0.0' });
});

// ───── Import Routes ─────
import aiRoutes from './routes/ai.js';
import sessionRoutes from './routes/session.js';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';
import usageRoutes from './routes/usage.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/sessions', apiLimiter, sessionRoutes);
app.use('/api/invoices', apiLimiter, invoiceRoutes);
app.use('/api/usage', apiLimiter, usageRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// ───── WebSocket Server for Deepgram Speech Proxy ─────
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/api/speech/stream' });

wss.on('connection', (clientWs, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const lang = url.searchParams.get('language') || 'en';

  const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY;
  if (!DEEPGRAM_KEY) {
    clientWs.close(4000, 'Deepgram API key not configured on server.');
    return;
  }

  const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&smart_format=true&interim_results=true&endpointing=300&keepalive=true&filler_words=false`;
  const deepgramWs = new WebSocket(deepgramUrl, {
    headers: { Authorization: `Token ${DEEPGRAM_KEY}` }
  });

  let isDeepgramOpen = false;
  let audioBuffer = [];

  clientWs.on('message', (audioChunk) => {
    if (isDeepgramOpen && deepgramWs.readyState === WebSocket.OPEN) {
      deepgramWs.send(audioChunk, { binary: true });
    } else {
      audioBuffer.push(audioChunk);
    }
  });

  deepgramWs.on('open', () => {
    console.log('Deepgram WebSocket connected');
    isDeepgramOpen = true;
    while (audioBuffer.length > 0) {
      const chunk = audioBuffer.shift();
      deepgramWs.send(chunk, { binary: true });
    }
  });

  deepgramWs.on('message', (data) => {
    const msgString = data.toString();
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(msgString);
    }
  });

  const cleanup = (reason) => {
    if (deepgramWs.readyState === WebSocket.OPEN) deepgramWs.close();
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  };

  clientWs.on('close', (code, reason) => {
    console.log(`Client WS closed. Code: ${code}, Reason: ${reason}`);
    cleanup('client');
  });
  deepgramWs.on('close', (code, reason) => {
    console.log(`Deepgram WS closed. Code: ${code}, Reason: ${reason}`);
    cleanup('deepgram');
  });
  deepgramWs.on('error', (err) => { console.error('Deepgram WS error:', err.message); cleanup('error'); });
  clientWs.on('error', (err) => { console.error('Client WS error:', err.message); cleanup('error'); });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
