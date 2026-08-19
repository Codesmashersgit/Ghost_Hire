require('dotenv').config();

module.exports = {
  apps: [{
    name: "ghosthire-backend",
    script: "server.js",
    cwd: "E:\\AI_assistant\\backend",
    interpreter: "node",
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || "5000",
      MONGO_URI: process.env.MONGO_URI,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY
    },
    watch: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 1000
  }]
};
