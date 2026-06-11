# 👻 GhostHire — AI Interview Assistant

<div align="center">

![GhostHire Banner](https://img.shields.io/badge/GhostHire-AI%20Interview%20Assistant-6366f1?style=for-the-badge&logo=ghost&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Electron](https://img.shields.io/badge/Electron-42-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

**GhostHire is an AI-powered interview assistant that supports you during coding interviews in real time. With live speech recognition, AI-generated answers, screenshot problem solving, and much more — all within a sleek desktop app.**


[🚀 Getting Started](#-getting-started) · [✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [🔑 API Keys](#-required-api-keys) · [📦 Build & Deploy](#-build--deploy)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Live Speech Recognition** | Real-time transcription using **Deepgram Nova-2** via WebSocket proxy |
| 🤖 **AI Answer Generation** | Instant, concise answers via **Azure GitHub AI** (GPT-4o, Llama, Phi-3) with auto-fallback |
| 📸 **Screenshot Solver** | Capture your screen and solve coding questions / MCQs with **Gemini 2.5 Flash Vision** |
| 💡 **Smart Suggestions** | AI-generated follow-up question suggestions based on current topic |
| 🔐 **Auth System** | JWT-based authentication with bcrypt password hashing |
| 📊 **Admin Dashboard** | Monitor users, usage, sessions, and invoices |
| 📋 **Session History** | Save and review all your interview sessions |
| 💳 **Invoice Management** | Track billing and payment records |
| 🌐 **Multi-language Support** | AI responses in your preferred language |
| 🛡️ **Rate Limiting** | IP-based rate limiting & Helmet security headers |

---

## 🏗️ Architecture

```
AI_assistant/
├── 📁 backend/                  # Node.js + Express API Server
│   ├── server.js                # Main server (HTTP + WebSocket)
│   ├── routes/
│   │   ├── ai.js                # AI chat, suggestions, screenshot solve
│   │   ├── auth.js              # Login / Signup
│   │   ├── session.js           # Interview session management
│   │   ├── invoice.js           # Invoice CRUD
│   │   ├── usage.js             # API usage tracking
│   │   └── admin.js             # Admin-only routes
│   └── models/
│       ├── User.js              # User schema (MongoDB)
│       ├── Session.js           # Interview session schema
│       └── Invoice.js           # Invoice schema
│
└── 📁 frontend/                 # React + Vite + Electron Desktop App
    ├── electron/
    │   └── main.js              # Electron main process
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Main interview dashboard
    │   │   ├── LandingPage.jsx  # Landing / home page
    │   │   ├── Signin.jsx       # Login page
    │   │   ├── Signup.jsx       # Registration page
    │   │   └── AdminDashboard.jsx # Admin panel
    │   ├── components/          # Reusable UI components
    │   ├── api/                 # Axios API call helpers
    │   └── config/              # App configuration
    └── vite.config.js           # Vite + Electron build config
```

---

## 🔑 Required API Keys

Aapko neeche diye gaye API keys ki zaroorat hogi. Inhe respective `.env` files mein daalo:

| Service | Key | Use |
|---|---|---|
| [GitHub Marketplace](https://github.com/marketplace/models) | `GITHUB_TOKEN` | Azure AI models (GPT-4o, Llama, Phi-3) |
| [Deepgram](https://deepgram.com/) | `DEEPGRAM_API_KEY` | Live speech-to-text |
| [Google AI Studio](https://aistudio.google.com/) | `GEMINI_API_KEY` | Screenshot vision solving |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | `MONGO_URI` | Database |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- MongoDB Atlas account (ya local MongoDB)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/codesmashersgit/GhostHire.git
cd frontend
npm run dev
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

`backend/.env` file create:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Interview_Tool
JWT_SECRET=your_super_secret_jwt_key_here

# AI Services
GITHUB_TOKEN=github_pat_your_token_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# CORS (optional)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

Backend start karo:

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

`frontend/.env` file banao:

```env
VITE_API_URL=http://localhost:5000
```

---

### 4️⃣ Run the App

#### 🌐 Web Browser mein (Development)
```bash
cd frontend
npm run dev
# Open: http://localhost:5173
```

#### 🖥️ Electron Desktop App
```bash
cd frontend
npm run app
# Yeh browser dev server + Electron dono ek saath start karega
```

---

## 📦 Build & Deploy

### Desktop App Build (Windows)

```bash
cd frontend
npm run electron-build
```

Build output `frontend/release/` folder mein milega:
- `GhostHire Setup x64.exe` — NSIS Installer
- `GhostHire x64.exe` — Portable executable



```bash
cd backend
npm start
```

> **Note:** Production mein `ALLOWED_ORIGINS` ko apne frontend domain se update karo.

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Naya user register karo |
| `POST` | `/api/auth/login` | Login aur JWT token pao |

### AI Routes (`/api/ai`) — *Auth Required*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Streaming AI answer generate karo |
| `POST` | `/api/ai/suggestions` | Follow-up question suggestions |
| `GET` | `/api/ai/capture-screen` | Desktop screenshot capture karo |
| `POST` | `/api/ai/solve-screenshot` | Screenshot se question solve karo |

### WebSocket (`ws://localhost:5000/api/speech/stream`)
Real-time audio streaming Deepgram ke through live transcription ke liye.

### Other Routes
| Prefix | Description |
|---|---|
| `/api/sessions` | Interview session CRUD |
| `/api/invoices` | Invoice management |
| `/api/usage` | API usage stats |
| `/api/admin` | Admin-only operations |

---

## 🛡️ Security Features

- **Helmet.js** — HTTP security headers
- **CORS** — Strict origin whitelisting (Electron `file://` support ke saath)
- **Rate Limiting** — Auth routes: 20 req/15min, API routes: 100 req/min
- **JWT Auth** — Stateless authentication
- **bcryptjs** — Password hashing
- **Payload Limit** — 50MB max request size

---

## 🤖 AI Models Used

| Model | Provider | Use Case |
|---|---|---|
| `gpt-4o-mini` | Azure/GitHub | Default chat responses |
| `gpt-4o` | Azure/GitHub | Fallback |
| `meta-llama-3.1-70b-instruct` | Azure/GitHub | Fallback |
| `Phi-3-medium-128k-instruct` | Azure/GitHub | Fallback |
| `gemini-2.5-flash` | Google | Screenshot/Vision solving |
| `nova-2` | Deepgram | Speech-to-text |

> Auto-fallback system hai — agar ek model rate-limited ho jaye, toh automatically next model try karta hai.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ by the **GhostHire Team**

⭐ **Star this repo if it helped you ace your interviews!** ⭐

</div>
