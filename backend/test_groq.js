import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const systemInstruction = `You are a helpful coding interview assistant.
Given the interviewer's question/topic, generate exactly 3 short, highly relevant follow-up questions, related technical terms, or deep-dives that the interviewer is likely to ask next or the candidate should mention.
Format your response strictly as a JSON array of 3 strings, for example: ["How does time complexity change?", "Explain the difference between X and Y", "What are the edge cases?"].
Do not include any markdown styling, code block symbols (like \`\`\`json), or conversational text. Return only the raw JSON.`;

  const question = "Can you explain the Node.js event loop?";

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'groq/compound',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Interviewer's question: "${question}"` }
        ]
      })
    });
    
    const data = await response.json();
    console.log("RAW GROQ RESPONSE:");
    console.log(data.choices[0].message.content);
  } catch (e) {
    console.error(e);
  }
}
run();
