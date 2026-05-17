import express from 'express';
// import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Example route for generating AI response from the backend
router.post('/generate', async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    /* 
    // To move Gemini API logic to backend:
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    */
    
    // Placeholder response
    res.json({ success: true, answer: `Backend received prompt: ${prompt}` });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

export default router;
