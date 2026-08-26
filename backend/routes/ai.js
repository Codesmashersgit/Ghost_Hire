import express from 'express';
import jwt from 'jsonwebtoken';
import screenshot from 'screenshot-desktop';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  
  if (token === 'standalone-fake-token') {
    req.userId = 'local-user';
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Groq PRIMARY — free, unlimited, ultra-fast (no quota issues)
const GROQ_MODELS = [
  'groq/compound',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'groq/compound-mini'
];

// Gemini FALLBACK — only if Groq fails
const GEMINI_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
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
        console.warn(`[Groq] ${modelName} failed: ${e.message}, switching instantly...`);
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
      if (!isLast) { 
        console.warn(`[Groq Text] ${modelName} failed: ${e.message}, switching instantly...`);
        continue; 
      }
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
        const isLast = i === GEMINI_MODELS.length - 1;
        if (!isLast) {
          console.warn(`[Gemini] ${modelName} failed (${e.message}) → switching to next model instantly...`);
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
        const isLast = i === GEMINI_MODELS.length - 1;
        if (!isLast) {
          console.warn(`[Gemini Text] ${modelName} failed (${e.message}) → switching to next model instantly...`);
          continue; 
        }
        console.warn(`[Gemini Text] All models failed → trying Groq...`);
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

  const systemInstruction = `You are Sudhanshu Raj — a sharp Full Stack Developer — speaking live in a technical interview or assessment. You respond INSTANTLY, CONFIDENTLY, and ACCURATELY to every type of question.

Here is your complete profile:
${CANDIDATE_RESUME}

═══════════════════════════════════════════
QUESTION TYPE HANDLING — READ CAREFULLY
═══════════════════════════════════════════

1. DSA / CODING QUESTIONS (LeetCode, HackerRank, etc.):
   Give a TWO-PHASE response so the candidate can EXPLAIN logic first, then show code:

   **Phase 1 — Explain (Easy Language, for speaking to interviewer):**
   - Start with Brute Force idea in 1-2 lines (simple language, like you're thinking aloud)
   - Then say "But we can optimize this..." and explain the optimal approach in simple words
   - Mention the intuition: WHY this approach works
   - Time & Space complexity of both approaches

   **Phase 2 — Code (Clean, Ready to type/paste):**
   - Full working optimal code
   - Use the language asked, default to Python or JavaScript
   - Add brief inline comments for key steps

   **Phase 3 — Cross Questions (prepare for follow-ups):**
   - List 2-3 likely follow-up questions the interviewer might ask and their quick answers


2. MCQ / MULTIPLE CHOICE:
   - State the correct option FIRST (e.g., "Answer: B").
   - Then give a crisp 1-line reason why it's correct.
   - Do NOT waste time explaining wrong options.

3. SQL / DATABASE QUESTIONS:
   - Write the full optimized SQL query.
   - Briefly explain joins/aggregations if needed.
   - For MongoDB: use proper aggregation pipelines or query operators.

4. SYSTEM DESIGN:
   - Use your real experience: Docker, AWS EC2, Nginx, WebSockets, MongoDB.
   - Give high-level architecture + key decisions.

5. BEHAVIORAL / HR:
   - Answer in first person using real resume details.
   - Sound natural, confident, NOT scripted.

6. PUZZLES / BRAIN TEASERS / LOGICAL REASONING:
   - State the direct answer FIRST.
   - Then explain the logic/deduction clearly.

7. UNCLEAR / PARTIAL AUDIO (conversation snippets, noisy audio):
   - If the question is unclear or incomplete, make a SMART PREDICTION of what was likely asked based on context.
   - Give a GENERIC but USEFUL answer that covers the most probable intent.
   - Example: If you hear "...difference between... and...", assume they're asking about common pairs like: async/await vs promises, SQL vs NoSQL, REST vs GraphQL, etc.
   - ALWAYS give something useful — NEVER say "I didn't understand the question".

8. CONVERSATION BETWEEN TWO PEOPLE:
   - If audio captures a 2-person conversation, identify the QUESTION being asked to the candidate.
   - Ignore filler/pleasantries, focus on the technical or behavioral question.
   - Answer directly as Sudhanshu Raj.

═══════════════════════════════════════════
STRICT RULES:
═══════════════════════════════════════════
- NEVER say "As an AI" or "I'm an AI". You ARE Sudhanshu Raj.
- NEVER say "Great question!" or any filler.
- NEVER apologize or say you don't know — always give your best answer.
- Keep answers sharp, structured, and professional.
- Respond in ${language || 'English'}.`;

  // Build a single user prompt including history and context
  let historyText = '';
  if (chatHistory && chatHistory.length > 0) {
    historyText = chatHistory.map(m => `${m.role === 'user' ? 'Interviewer' : 'Me'}: ${m.content}`).join('\n') + '\n\n';
  }
  const extraContextText = context ? `Additional context to keep in mind: ${context}\n\n` : '';
  const userPrompt = `${extraContextText}${historyText}Interviewer: ${question}`;

  try {
    console.log('[Chat] Attempting Groq primary...');
    await callGroqAI(systemInstruction, userPrompt, res);
  } catch (error) {
    console.error('[Chat] Groq failed, falling back to Gemini:', error.message);
    try {
      await callGeminiAI(systemInstruction, userPrompt, res);
    } catch (geminiError) {
      console.error('[Chat] Gemini also failed:', geminiError.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'All AI services failed' });
      } else {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '\n[All AI services failed]' } }] })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  }
});

// @route   POST /api/ai/quick-explain
// @desc    Fast theory-only answer from screenshot (no code) — Ctrl+Shift+X
router.post('/quick-explain', (req, res, next) => { console.log('>>> QUICK-EXPLAIN INCOMING REQ <<<'); next(); }, authMiddleware, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, message: 'Image required' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'Gemini API key missing' });

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const systemInstruction = `You are an expert DSA/coding/MCQ solver assistant.
Analyze the question in the image and give ONLY the theoretical explanation — NO CODE.

Format your response like this:

**🧠 Understanding:**
[What the question is asking in simple 1-2 lines]

**💪 Brute Force:**
[Simple idea, time complexity]

**⚡ Optimal Approach:**
[Better idea explained simply — why it works, intuition]
[Time: O(?), Space: O(?)]

**🗣️ Say to Interviewer:**
[3-4 sentences you can speak out loud to the interviewer right now]

Keep it SHORT and FAST. No code. Easy language.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const imageParts = [{
      inlineData: {
        data: base64Data,
        mimeType: "image/png"
      }
    }];

    const promises = GEMINI_MODELS.map(async (modelName) => {
      console.log(`[Quick Explain] Racing model: ${modelName}`);
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await geminiModel.generateContent([
        "Explain this question theoretically only. No code.", 
        ...imageParts
      ]);
      return (await result.response).text().trim();
    });

    const answer = await Promise.any(promises);
    return res.json({ success: true, answer });
  } catch (err) {
    console.error('quick-explain error:', err.message);
    return res.status(500).json({ success: false, message: 'All models failed or timed out' });
  }
});

// @route   POST /api/ai/get-code
// @desc    Get full optimized code for a question — Ctrl+Shift+C
router.post('/get-code', authMiddleware, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, message: 'Image required' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'Gemini API key missing' });

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemInstruction = `You are an expert competitive programmer.
Provide ONLY the most optimal code solution for the problem shown in the image.
Include brief comments explaining time and space complexity at the top.
Do NOT include theoretical explanations — JUST CODE.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const imageParts = [{
      inlineData: {
        data: base64Data,
        mimeType: "image/png"
      }
    }];

    const promises = GEMINI_MODELS.map(async (modelName) => {
      console.log(`[Get Code] Racing model: ${modelName}`);
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await geminiModel.generateContent([
        "Write optimal code for this question.", 
        ...imageParts
      ]);
      return (await result.response).text().trim();
    });

    let answer = await Promise.any(promises);

    if (answer.startsWith('```') && answer.endsWith('```')) {
      const lines = answer.split('\n');
      answer = lines.slice(1, -1).join('\n');
    }

    return res.json({ success: true, answer });
  } catch (err) {
    console.error('get-code error:', err.message);
    return res.status(500).json({ success: false, message: 'All models failed or timed out' });
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
    // Use Gemini for suggestions as it strictly follows JSON formatting
    let rawContent;
    try {
      rawContent = await callGeminiAIText(systemInstruction, `Interviewer's question: "${question}"`);
    } catch(e) {
      console.warn('[Suggestions] Gemini failed, trying Groq:', e.message);
      rawContent = await callGroqAIText(systemInstruction, `Interviewer's question: "${question}"`);
    }

    const originalRawContent = rawContent;
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    // Remove <think>...</think> tags if they exist (for Qwen models)
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Extract just the array if the model includes conversational text like "Sure, here..."
    const firstBracket = rawContent.indexOf('[');
    const lastBracket = rawContent.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      rawContent = rawContent.substring(firstBracket, lastBracket + 1);
    }
    
    let parsed = [];
    try {
      if (rawContent === '') throw new Error('Empty rawContent after extraction');
      parsed = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error('[Suggestions] JSON Parse fallback. Error:', parseErr.message);
      console.error('[Suggestions] Original rawContent before extraction:', originalRawContent || 'N/A');
      console.error('[Suggestions] Extracted rawContent:', rawContent);
      parsed = ["Could you explain the time complexity?", "What are the edge cases?", "Is there a more optimal approach?"];
    }

    return res.json({ success: true, suggestions: parsed, model: 'groq/compound' });
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
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'Gemini API key missing' });

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const systemInstruction = `You are an expert programmer and assessment solver with deep knowledge of DSA, SQL, MongoDB, system design, and MCQs.

Analyze the screenshot and solve the question instantly:

- CODING / DSA: Provide the complete, optimal, working code. Include time & space complexity at the end.
- MCQ: State the correct option first (e.g. "Answer: B"), then a 1-line reason.
- SQL: Write the full optimized query.
- MongoDB: Write the correct query/aggregation pipeline.
- PUZZLE / LOGIC: Give the direct answer, then brief explanation.
- FILL IN THE BLANK / SHORT ANSWER: Give the direct answer only.

Format output cleanly. Be concise. No greetings, no filler. Just the answer.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

    const imageParts = [{
      inlineData: {
        data: base64Data,
        mimeType: "image/png"
      }
    }];

    const result = await geminiModel.generateContent([
      "Solve the question in the screenshot.", 
      ...imageParts
    ]);
    const response = await result.response;
    let answer = response.text().trim();

    if (answer.startsWith('```') && answer.endsWith('```')) {
      const lines = answer.split('\n');
      answer = lines.slice(1, -1).join('\n');
    }

    return res.json({ success: true, answer });
  } catch (error) {
    console.error('Gemini vision solve error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to solve screenshot' });
  }
});

export default router;
