import express from 'express';
import jwt from 'jsonwebtoken';
import screenshot from 'screenshot-desktop';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

const FALLBACK_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "meta-llama-3.1-70b-instruct",
  "Phi-3-medium-128k-instruct"
];

// Auth middleware
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

// Helper: call Azure GitHub AI with fallback models (streaming)
const callAzureAI = async (messages, model, res) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ success: false, message: 'AI service not configured.' });
  }

  const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];

  for (const currentModel of modelsToTry) {
    try {
      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({ model: currentModel, messages, stream: true })
      });

      if (response.status === 429) {
        console.warn(`Model ${currentModel} rate limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || '';
        if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('429')) {
          continue;
        }
        throw new Error(errMsg || `HTTP ${response.status}`);
      }

      // ── Streaming headers ─────────────────────────────────────────────────
      // X-Accel-Buffering: no  → tells Nginx / Vite proxy NOT to buffer
      // flushHeaders()         → sends headers immediately so proxy knows
      //                          a streaming response is coming (fixes 502)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders(); // CRITICAL: must flush before any res.write()

      // Guard against client disconnecting mid-stream
      let clientGone = false;
      res.socket?.on('close', () => { clientGone = true; });

      const reader = response.body;
      const decoder = new TextDecoder();

      for await (const chunk of reader) {
        if (clientGone) break;
        const text = decoder.decode(chunk, { stream: true });
        res.write(text);
        // Flush each chunk immediately so proxy passes it through right away
        if (typeof res.flush === 'function') res.flush();
      }

      if (!clientGone) res.end();
      return;
    } catch (e) {
      console.warn(`Error with model ${currentModel}:`, e.message);
      const isLast = currentModel === modelsToTry[modelsToTry.length - 1];
      if (isLast) throw e;
    }
  }
};

// @route   POST /api/ai/chat
// @desc    Proxy AI chat completions (streaming) - keeps GitHub token server-side
router.post('/chat', authMiddleware, async (req, res) => {
  const { question, context, language, chatHistory, model } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const systemInstruction = `You are a professional coding interview assistant. Provide a direct, extremely concise, and precise answer.
Do NOT use any markdown headers (like ###), bullet points (*), emojis, or conversational intros/outros.
Start answering the question immediately in first person ("I", "my", "we"). Limit your entire response to exactly 2 to 3 sentences maximum.
Respond strictly in ${language || 'English'}.`;

  const prompt = context ? `Context: ${context}\n\nQuestion: ${question}` : question;
  const messages = [
    { role: "system", content: systemInstruction },
    ...(chatHistory || []),
    { role: "user", content: prompt }
  ];

  try {
    await callAzureAI(messages, model || 'gpt-4o-mini', res);
  } catch (error) {
    console.error('AI chat error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'AI request failed' });
    }
  }
});

// @route   POST /api/ai/suggestions
// @desc    Generate 3 follow-up question suggestions - keeps GitHub token server-side
router.post('/suggestions', authMiddleware, async (req, res) => {
  const { question, model } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ success: false, message: 'AI service not configured.' });
  }

  const systemInstruction = `You are a helpful coding interview assistant.
Given the interviewer's question/topic, generate exactly 3 short, highly relevant follow-up questions, related technical terms, or deep-dives that the interviewer is likely to ask next or the candidate should mention.
Format your response strictly as a JSON array of 3 strings, for example: ["How does time complexity change?", "Explain the difference between X and Y", "What are the edge cases?"].
Do not include any markdown styling, code block symbols (like \`\`\`json), or conversational text. Return only the raw JSON.`;

  const modelsToTry = [model || 'gpt-4o-mini', ...FALLBACK_MODELS.filter(m => m !== (model || 'gpt-4o-mini'))];

  for (const currentModel of modelsToTry) {
    try {
      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Interviewer's question: "${question}"` }
          ]
        })
      });

      if (response.status === 429) { continue; }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || '';
        if (errMsg.toLowerCase().includes('rate limit')) continue;
        throw new Error(errMsg || `HTTP ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.choices[0]?.message?.content || '[]';
      rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawContent);
      return res.json({ success: true, suggestions: parsed, model: currentModel });
    } catch (e) {
      const isLast = currentModel === modelsToTry[modelsToTry.length - 1];
      if (isLast) {
        console.error('Suggestions error:', e.message);
        return res.status(500).json({ success: false, message: 'Suggestions failed' });
      }
    }
  }
});

// @route   GET /api/ai/capture-screen
// @desc    Silently capture the host desktop screen
router.get('/capture-screen', authMiddleware, async (req, res) => {
  try {
    const imgBuffer = await screenshot();
    const base64 = imgBuffer.toString('base64');
    res.json({ success: true, imageBase64: `data:image/png;base64,${base64}` });
  } catch (error) {
    console.error('Screenshot capture error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to capture screen' });
  }
});

// @route   POST /api/ai/solve-screenshot
// @desc    Process a screenshot and extract the answer using Gemini Vision model
router.post('/solve-screenshot', authMiddleware, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, message: 'Image is required' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ success: false, message: 'Gemini API key not configured on server.' });
  }

  try {
    // Import GoogleGenerativeAI dynamically from the SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Extract base64 details
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png"
      }
    };

    const systemInstruction = `You are an expert assessment solver.
The user has provided an image of a coding problem (like LeetCode), multiple choice question (MCQ), or general assessment.
Your goal is to extract the question and provide the direct, most correct answer.
If it is a coding question, provide ONLY the clean, fully functional, optimized code block (without backticks if possible, or just the standard markdown block). Do not explain the code.
If it is multiple choice, provide ONLY the correct option text or number.
Do NOT include any conversational filler, greetings, or explanation.
Keep it extremely concise so it can be used instantly.`;

    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent([
      "Solve this assessment question. Provide only the final answer or code.",
      imagePart
    ]);

    let answer = result.response.text() || '';
    
    // Clean up code block backticks if present and it's the only thing
    if (answer.startsWith('```') && answer.endsWith('```')) {
      const lines = answer.split('\n');
      answer = lines.slice(1, -1).join('\n');
    }

    return res.json({ success: true, answer: answer.trim() });
  } catch (error) {
    console.error('Gemini vision solve error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to solve screenshot using Gemini API' });
  }
});

export default router;
