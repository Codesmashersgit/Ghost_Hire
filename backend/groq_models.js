import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    console.log(data.data.map(m => m.id));
  } catch (e) {
    console.error(e);
  }
}
run();
