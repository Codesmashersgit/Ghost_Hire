import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const data = await res.json();
  if (data.models) {
    console.log("Available Models:", data.models.map(m => m.name).join('\n'));
  } else {
    console.log("Error:", data);
  }
}

listModels();
