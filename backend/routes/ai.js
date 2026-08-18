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

// Fallback model chain — tries each in order if previous is overloaded/unavailable
const GEMINI_MODELS = [
  'gemini-2.5-flash',       // Best quality
  'gemini-2.0-flash',       // Fast & reliable
  'gemini-2.0-flash-lite',  // Lightest, almost never overloaded
];

// Groq models — ultimate fallback (free, ultra-fast LLaMA)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // most capable
  'llama-3.1-8b-instant',      // fastest
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: call Groq API (streaming) — OpenAI-compatible
const callGroqAI = async (systemInstruction, userPrompt, res) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const modelName = GROQ_MODELS[i];
    try {
      console.log(`[Groq] Trying model: ${modelName}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelName,
          stream: true,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
      }

      let clientGone = false;
      res.socket?.on('close', () => { clientGone = true; });

      const reader = response.body;
      const decoder = new TextDecoder();
      let buffer = '';

      for await (const chunk of reader) {
        if (clientGone) break;
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const clean = line.trim();
          if (clean.startsWith('data: ')) {
            const dataStr = clean.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const text = parsed.choices?.[0]?.delta?.content || '';
              if (text) {
                res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
                if (typeof res.flush === 'function') res.flush();
              }
            } catch (_) {}
          }
        }
      }

      if (!clientGone) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
      return; // success
    } catch (e) {
      const isLast = i === GROQ_MODELS.length - 1;
      if (!isLast) {
        console.warn(`[Groq] ${modelName} failed: ${e.message}, trying next...`);
        await sleep(500);
        continue;
      }
      throw e; // all groq models failed
    }
  }
};

// Helper: call Groq API (non-streaming)
const callGroqAIText = async (systemInstruction, userPrompt) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const modelName = GROQ_MODELS[i];
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      const isLast = i === GROQ_MODELS.length - 1;
      if (!isLast) { await sleep(500); continue; }
      throw e;
    }
  }
};

// Helper: call Google Gemini AI (streaming) with retry + Groq fallback
const callGeminiAI = async (systemInstruction, userPrompt, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Try Gemini chain first
  if (GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const modelName = GEMINI_MODELS[i];
      try {
        console.log(`[Gemini] Trying model: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName, systemInstruction });

        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Accel-Buffering', 'no');
          res.flushHeaders();
        }

        let clientGone = false;
        res.socket?.on('close', () => { clientGone = true; });

        const result = await model.generateContentStream(userPrompt);
        for await (const chunk of result.stream) {
          if (clientGone) break;
          const text = chunk.text();
          if (text) {
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
            if (typeof res.flush === 'function') res.flush();
          }
        }
        if (!clientGone) { res.write('data: [DONE]\n\n'); res.end(); }
        return; // Gemini success

      } catch (e) {
        const isRetryable = e.message?.includes('overloaded') || e.message?.includes('503') || e.message?.includes('429') || e.message?.includes('404') || e.message?.includes('not found') || e.status === 503 || e.status === 429 || e.status === 404;
        const isLast = i === GEMINI_MODELS.length - 1;
        if (isRetryable && !isLast) {
          console.warn(`[Gemini] ${modelName} overloaded → next model...`);
          await sleep(800);
          continue;
        }
        // Last Gemini model failed — fall through to Groq
        console.warn(`[Gemini] All models failed (${e.message}) → trying Groq...`);
        break;
      }
    }
  }

  // ── ULTIMATE FALLBACK: Groq ──────────────────────────────────────────────
  try {
    console.log('[Groq] Gemini unavailable, switching to Groq...');
    await callGroqAI(systemInstruction, userPrompt, res);
  } catch (groqErr) {
    console.error('[Groq] Also failed:', groqErr.message);
    if (!res.headersSent) {
      res.status(503).json({ success: false, message: 'All AI services are currently unavailable. Please try again in a few seconds.' });
    } else {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '\n[All AI services busy — please retry in 5 seconds]' } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
};

// Helper: call Google Gemini AI (non-streaming) with retry + Groq fallback
const callGeminiAIText = async (systemInstruction, userPrompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const modelName = GEMINI_MODELS[i];
      try {
        console.log(`[Gemini Text] Trying model: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName, systemInstruction });
        const result = await model.generateContent(userPrompt);
        return result.response.text();
      } catch (e) {
        const isRetryable = e.message?.includes('overloaded') || e.message?.includes('503') || e.message?.includes('429') || e.message?.includes('404') || e.message?.includes('not found') || e.status === 503 || e.status === 429 || e.status === 404;
        const isLast = i === GEMINI_MODELS.length - 1;
        if (isRetryable && !isLast) { await sleep(800); continue; }
        if (isLast) console.warn(`[Gemini Text] All models failed → trying Groq...`);
        break;
      }
    }
  }

  // Groq fallback
  console.log('[Groq Text] Using Groq as fallback...');
  return await callGroqAIText(systemInstruction, userPrompt);
};

// @route   POST /api/ai/chat
// @desc    Proxy AI chat completions (streaming) via Gemini
router.post('/chat', authMiddleware, async (req, res) => {
  const { question, context, language, chatHistory, model } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const CANDIDATE_RESUME = `
NAME: Sudhanshu Raj
CONTACT: +91-7667016662 | Delhi, India | sudhanshu.ok1802@gmail.com
PORTFOLIO: Sudhanshuportfolio1802.netlify.app | github.com/Codesmashersgit | leetcode.com/u/codextr/
LINKEDIN: linkedin.com/in/sudhanshu-raj-45b205250

SUMMARY:
Full Stack Developer skilled in React.js, Node.js, Express.js, MongoDB, PostgreSQL, Docker, and AWS. Built scalable AI-powered and real-time web applications with hands-on experience in REST APIs, SDLC, cloud deployment, and prompt-based AI integrations. Strong foundation in DSA, OOP, DBMS, OS, and Computer Networks.

EXPERIENCE:
Freelance Full Stack Developer (Oct 2025 – Apr 2026)
- Real-time Peer-to-Peer Communication Platform | React.js, Node.js, WebRTC, Socket.IO, JWT, Docker, AWS EC2
- Designed, developed, and deployed production-grade backend services and 12+ REST APIs supporting authentication, real-time messaging, room management, and video communication.
- Implemented JWT-based authentication and Role-Based Access Control (RBAC) to secure backend resources and user sessions.
- Participated in the complete SDLC including requirements analysis, development, testing, deployment, and production maintenance.
- Containerized the application using Docker Compose, reducing deployment time by 60% while ensuring consistent environments.
- Deployed on AWS EC2 behind Nginx with PM2 process management and CloudWatch monitoring, achieving 99.5% uptime.

PROJECTS:
1. GhostHire – AI Interview Assistant | React.js, Node.js, Electron, GPT-4o, Gemini, Deepgram, MongoDB
   - Built an AI-powered interview assistant capable of generating contextual responses using GPT-4o, Gemini, and Deepgram APIs.
   - Developed REST APIs for authentication, interview lifecycle management, analytics, and session persistence.
   - Designed prompt flows to improve response relevance and conversational quality for technical interview scenarios.
   - Optimized backend response time to under 500 ms through asynchronous request handling and efficient API orchestration.
2. Multi-language Online IDE | React.js, Node.js, Express.js, Docker, AWS EC2, Monaco Editor, Judge0 API
   - Developed a browser-based online IDE supporting execution of 15+ programming languages.
   - Integrated Monaco Editor for syntax highlighting, auto-completion, and IDE-like editing capabilities.
   - Implemented Docker-based isolated execution environments for secure code compilation and execution.
   - Deployed on AWS EC2 with real-time output streaming.

SKILLS:
- Languages: JavaScript, TypeScript, SQL, Java
- Backend: Node.js, Express.js, REST APIs, JWT, OAuth 2.0, Socket.IO, RBAC
- Databases: PostgreSQL, MongoDB, MySQL
- Cloud & Infra: Docker, Docker Compose, AWS (EC2, S3, Lambda), Nginx, PM2
- Frontend: React.js, Redux Toolkit, HTML5, CSS3, Tailwind CSS
- Testing & Tools: Jest, Git, GitHub, Postman, CloudWatch
- Core CS: DSA, OOP, DBMS, Operating Systems, Computer Networks

EDUCATION:
B.Tech Computer Science & Engineering
Rungta College of Engineering & Technology, Bhilai, Chhattisgarh | CGPA: 7.25 | Sept 2022 – May 2026

ACHIEVEMENTS:
- Published BugBhai on VS Code Marketplace with 20+ installs and 4.5/5 user rating.
- Solved 250+ DSA problems on LeetCode & GeeksforGeeks.
- Built and deployed multiple production-ready applications using Docker and AWS.
`;

  const systemInstruction = `You are Sudhanshu Raj — a Full Stack Developer — speaking directly in a live technical job interview.
You MUST answer every question in FIRST PERSON, exactly as Sudhanshu would speak. Use "I", "my", "I built", "In my experience", "At my project", etc.

Here is your complete profile and background. Use it to give accurate, personalized answers:
${CANDIDATE_RESUME}

RULES:
1. For behavioral/HR questions — answer using real details from the resume above. Sound natural and confident.
2. For project-related questions — refer to GhostHire or the Online IDE projects.
3. For technical/DSA/coding questions — give the optimal solution with code and briefly explain time/space complexity.
4. For Multiple Choice Questions (MCQs) — Provide the correct option immediately, then a brief 1-line justification.
5. For puzzles and logical reasoning — Provide the direct answer first, followed by the logical deduction steps.
6. For system design questions — answer using your real experience with Docker, AWS, Nginx.
7. NEVER say "As an AI". You ARE Sudhanshu Raj.
8. Do NOT use conversational filler like "Great question!"
7. Keep answers sharp, confident, and professional. Respond in ${language || 'English'}.`;

  // Build a single user prompt including history and context
  let historyText = '';
  if (chatHistory && chatHistory.length > 0) {
    historyText = chatHistory.map(m => `${m.role === 'user' ? 'Interviewer' : 'Me'}: ${m.content}`).join('\n') + '\n\n';
  }
  const extraContextText = context ? `Additional context to keep in mind: ${context}\n\n` : '';
  const userPrompt = `${extraContextText}${historyText}Interviewer: ${question}`;

  try {
    await callGeminiAI(systemInstruction, userPrompt, res);
  } catch (error) {
    console.error('AI chat error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'AI request failed' });
    }
  }
});

// @route   POST /api/ai/suggestions
// @desc    Generate 3 follow-up question suggestions via Gemini
router.post('/suggestions', authMiddleware, async (req, res) => {
  const { question, model } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const systemInstruction = `You are a helpful coding interview assistant.
Given the interviewer's question/topic, generate exactly 3 short, highly relevant follow-up questions, related technical terms, or deep-dives that the interviewer is likely to ask next or the candidate should mention.
Format your response strictly as a JSON array of 3 strings, for example: ["How does time complexity change?", "Explain the difference between X and Y", "What are the edge cases?"].
Do not include any markdown styling, code block symbols (like \`\`\`json), or conversational text. Return only the raw JSON.`;

  try {
    let rawContent = await callGeminiAIText(systemInstruction, `Interviewer's question: "${question}"`);
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawContent);
    return res.json({ success: true, suggestions: parsed, model: 'gemini-2.5-flash' });
  } catch (e) {
    console.error('Suggestions error:', e.message);
    return res.status(500).json({ success: false, message: 'Suggestions failed' });
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
