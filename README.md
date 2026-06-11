# 👻 GhostHire — AI Interview Assistant

<div align="center">

![GhostHire Banner](https://img.shields.io/badge/GhostHire-AI%20Interview%20Assistant-6366f1?style=for-the-badge&logo=ghost&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Electron](https://img.shields.io/badge/Electron-42-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

**GhostHire is an AI-powered interview assistant that supports you during coding interviews in real time.**  
Live speech recognition, AI-generated answers, screenshot problem solving, and much more — all within a sleek desktop app.

[🚀 Getting Started](#-getting-started) · [✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [🔑 API Keys](#-required-api-keys) · [📦 Build & Deploy](#-build--deploy)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Live Speech Recognition** | Real-time transcription using **Deepgram Nova-2** via WebSocket proxy |
| 🤖 **AI Answer Generation** | Instant, concise answers via **Azure GitHub AI** (GPT-4o, Llama, Phi-3) with auto-fallback |
| 📸 **Screenshot Solver** | Capture your screen and solve coding questions / MCQs with **Gemini 2.5 Flash Vision** |
| 💡 **Smart Suggestions** | AI-generated follow-up question suggestions based on the current topic |
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
    │   ├── api/                 # API call helpers
    │   └── config/              # App configuration
    └── vite.config.js           # Vite + Electron build config
```

---

## 🔑 Required API Keys

You will need the following API keys. Add them to the respective `.env` files as described in the setup steps below.

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
- A MongoDB Atlas account (or a local MongoDB instance)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Codesmashersgit/Ghost_Hire.git
cd AI_assistant
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `backend/.env` file with the following variables:

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

Start the backend server:

```bash
# Development mode (auto-restart on file changes)
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

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

---

### 4️⃣ Run the App

#### 🌐 In Web Browser (Development)
```bash
cd frontend
npm run dev
# Open: http://localhost:5173
```

#### 🖥️ As Electron Desktop App
```bash
cd frontend
npm run app
# This starts both the Vite dev server and the Electron window simultaneously
```

---

## 📦 Build & Deploy

### Desktop App Build (Windows)

```bash
cd frontend
npm run electron-build
```

Build output will be placed in the `frontend/release/` folder:
- `GhostHire Setup x64.exe` — NSIS Installer
- `GhostHire x64.exe` — Portable executable

### Backend Deployment

The backend can be deployed to any Node.js hosting platform (Railway, Render, VPS, etc.):

```bash
cd backend
npm start
```

> **Note:** In production, update `ALLOWED_ORIGINS` in your `.env` file to match your frontend's domain.

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT token |

### AI Routes (`/api/ai`) — *Auth Required*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Generate a streaming AI answer |
| `POST` | `/api/ai/suggestions` | Get follow-up question suggestions |
| `GET` | `/api/ai/capture-screen` | Capture the desktop screenshot |
| `POST` | `/api/ai/solve-screenshot` | Solve a question from a screenshot |

### WebSocket (`ws://localhost:5000/api/speech/stream`)
Real-time audio streaming through Deepgram for live speech-to-text transcription.

### Other Routes
| Prefix | Description |
|---|---|
| `/api/sessions` | Interview session CRUD |
| `/api/invoices` | Invoice management |
| `/api/usage` | API usage statistics |
| `/api/admin` | Admin-only operations |

---

## 🛡️ Security Features

- **Helmet.js** — Secure HTTP response headers
- **CORS** — Strict origin whitelisting (with support for Electron's `file://` origin)
- **Rate Limiting** — Auth routes: 20 req/15 min · API routes: 100 req/min
- **JWT Auth** — Stateless, token-based authentication
- **bcryptjs** — Secure password hashing
- **Payload Limit** — 50 MB max request size

---

## 🤖 AI Models Used

| Model | Provider | Use Case |
|---|---|---|
| `gpt-4o-mini` | Azure/GitHub | Default chat responses |
| `gpt-4o` | Azure/GitHub | Fallback |
| `meta-llama-3.1-70b-instruct` | Azure/GitHub | Fallback |
| `Phi-3-medium-128k-instruct` | Azure/GitHub | Fallback |
| `gemini-2.5-flash` | Google | Screenshot / Vision solving |
| `nova-2` | Deepgram | Speech-to-text |

> An automatic fallback system is in place — if one model hits its rate limit, the next available model is tried automatically.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ by the **GhostHire Team**

⭐ **Star this repo if it helped you ace your interviews!** ⭐

</div>
