<div align="center">

# 👻 GhostHire — The Ultimate AI Interview Copilot

![GhostHire Version](https://img.shields.io/badge/Version-2.0.0-6366f1?style=for-the-badge&logo=ghost&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-4ade80?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-3b82f6?style=for-the-badge)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Electron](https://img.shields.io/badge/Electron-42-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![Groq](https://img.shields.io/badge/Groq-Llama_3-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com)
[![PM2](https://img.shields.io/badge/PM2-Daemon-2B037A?style=flat-square&logo=pm2&logoColor=white)](https://pm2.keymetrics.io/)

**GhostHire is an advanced, stealthy AI-powered assistant designed to support you during live technical interviews and coding assessments.**  
Featuring an invisible overlay, real-time audio transcription, lightning-fast AI vision processing, and a two-phase DSA solver.

[🚀 Getting Started](#-getting-started) · [✨ Features](#-features) · [🥷 Stealth Mode](#-stealth--proctor-bypass) · [🏗️ Architecture](#️-architecture) · [📦 Build](#-build--deploy)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🥷 **Stealth Overlay** | A transparent, click-through UI that remains **100% invisible** to screen sharing (Zoom, Meet, Teams) and screen recorders (OBS). |
| ⚡ **Ultra-Fast AI Engine** | Powered by **Groq** (`llama3-70b-8192` & `llama-3.2-11b-vision-preview`) for sub-second responses. |
| 📸 **Smart Screen Capture** | Use global hotkeys to capture questions instantly. No alt-tabbing required. |
| 🧠 **Two-Phase DSA Solver** | **Phase 1 (Theory):** Explains Brute-force & Optimal approach in simple language to speak out loud.<br>**Phase 2 (Code):** Delivers clean, optimized, ready-to-type code. |
| 🎤 **Live Transcription** | Real-time audio processing using **Deepgram Nova-2** via WebSocket proxy. |
| 👻 **Background Daemon** | Backend runs silently via **PM2** to bypass strict exam platform restrictions. |
| 💡 **Cross-Question Predictor** | Automatically anticipates and answers follow-up questions the interviewer might ask. |

---

## ⌨️ Global Shortcuts

GhostHire is designed to be operated entirely via keyboard during an interview:

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | **Quick Explain (Theory)** | Captures screen & returns a fast theoretical explanation (Brute force + Optimal intuition). Perfect for talking to the interviewer. |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | **Get Optimal Code** | Returns clean, optimized code with time/space complexity based on the last captured screenshot. |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | **Hide Overlay** | Instantly hides the AI overlay from your screen. |

---

## 🥷 Stealth & Proctor Bypass

GhostHire is built with privacy and undetectability in mind:
- **`setContentProtection(true)`**: The Electron overlay window is injected at the OS level to be excluded from standard screen capture APIs.
- **PM2 Daemon (`start-hidden.bat`)**: The Node.js backend runs completely in the background without any visible terminal windows.
- **Disguised Process Names**: Configured to appear as standard system processes (e.g., `WindowsAudioService`) in the Task Manager.

---

## 🏗️ Architecture

```text
Ghost_Hire/
├── backend/                  # Node.js + Express + PM2 Daemon
│   ├── server.js             # Main server (HTTP + WebSocket)
│   ├── routes/
│   │   ├── ai.js             # Groq Vision, Gemini Fallback logic
│   │   └── ...               # Auth, Sessions, Invoices
│   └── ecosystem.config.cjs  # PM2 configuration for background running
│
├── frontend/                 # React + Vite + Electron
│   ├── electron/
│   │   └── main.js           # Global shortcuts, Stealth window injection
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Overlay.jsx   # Invisible transparent UI
│   │   │   └── Dashboard.jsx # Main control panel
│   │   └── App.jsx           # HashRouter (Electron compatible)
│   └── vite.config.js           
│
├── start-hidden.bat          # 1-click silent backend launcher
└── start-silent.vbs          # VBScript wrapper for absolute invisibility
```

---

## 🔑 Required API Keys

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Interview_Tool
JWT_SECRET=your_super_secret_jwt_key_here

# AI Services
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

---

## 🚀 Getting Started

### 1️⃣ Clone & Install
```bash
git clone https://github.com/Codesmashersgit/Ghost_Hire.git
cd Ghost_Hire

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2️⃣ Start Backend (Silent Mode)
Double-click `start-hidden.bat` in the root folder.
*(Alternatively, run `pm2 start backend/ecosystem.config.cjs` manually)*

### 3️⃣ Build & Run Desktop App
```bash
cd frontend
npm run electron-build
```
Open the generated `.exe` in `frontend/release/win-unpacked/`.

---

## 🤖 AI Models Used

| Model | Provider | Use Case |
|---|---|---|
| `llama-3.2-11b-vision-preview` | **Groq** | Primary — Ultra-fast screenshot analysis & code generation |
| `llama3-70b-8192` | **Groq** | Primary — Text chat & logic solving |
| `gemini-3.6-flash` | **Google** | Fallback — Automatic failover if Groq is overloaded |
| `nova-2` | **Deepgram** | Primary — Live audio transcription via WebSocket |

---

## 🛡️ Security & Performance

- **Zero API Quota Bottlenecks:** Primary routing through Groq ensures unlimited, free, and lightning-fast inferences.
- **Hardware Acceleration:** Electron configured with `disable-gpu-shader-disk-cache` for maximum stability.
- **JWT Auth:** Stateless authentication with encrypted local storage on `file://` protocol.

---

<div align="center">

Made with ❤️ by **Sudhanshu Raj**

⭐ **Star this repo if GhostHire helped you ace your interviews!** ⭐

</div>
