import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Mic, MicOff } from "lucide-react";

const isElectron = window && window.process && window.process.type;
let ipcRenderer = null;
let clipboard = null;
if (isElectron) {
  const electron = window.require("electron");
  ipcRenderer = electron.ipcRenderer;
  clipboard = electron.clipboard;
}

export default function MicOverlay() {
  const [answer, setAnswer] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";
    document.body.style.backgroundImage = "none";
    const style = document.createElement('style');
    style.innerHTML = `
      body::before, body::after { display: none !important; }
      html, body { background: transparent !important; }
    `;
    document.head.appendChild(style);

    if (!ipcRenderer) return;

    const handleShowAnswer = (event, text) => {
      setAnswer(text);
      setCopied(false);
      setLiveTranscript(""); // clear transcript when answer starts
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }, 50);
    };

    const handleLiveTranscript = (event, text) => {
      setLiveTranscript(text);
      if (text) setAnswer(""); // Clear previous answer when new speech starts
    };

    const handleSync = (event, status) => {
      setIsListening(status);
    };

    ipcRenderer.on("show-mic-answer", handleShowAnswer);
    ipcRenderer.on("live-transcript", handleLiveTranscript);
    ipcRenderer.on("sync-mic-status", handleSync);
    ipcRenderer.send("get-mic-status");

    return () => {
      ipcRenderer.removeListener("show-mic-answer", handleShowAnswer);
      ipcRenderer.removeListener("live-transcript", handleLiveTranscript);
      ipcRenderer.removeListener("sync-mic-status", handleSync);
      document.head.removeChild(style);
    };
  }, []);

  const toggleMic = () => {
    const newStatus = !isListening;
    setIsListening(newStatus);
    if (ipcRenderer) {
      ipcRenderer.send('toggle-mic-from-overlay', newStatus);
    }
  };

  const handleCopy = () => {
    if (clipboard) clipboard.writeText(answer);
    else navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent", padding: "10px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#ffffff", color: "#1e293b", padding: "14px 16px", borderRadius: "14px", width: "100%", height: "100%", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ WebkitAppRegion: "drag", cursor: "grab", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px", marginBottom: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isListening ? "#4ade80" : "#94a3b8" }} />
            <span style={{ color: "#475569", fontWeight: "bold", fontSize: "12px" }}>MIC ASSISTANT (Drag me)</span>
          </div>
          <span style={{ fontSize: "9px", opacity: 0.6, color: "#64748b", WebkitAppRegion: "no-drag" }}>Ctrl+Shift+M to hide</span>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} style={{ overflowY: "auto", flex: 1, fontFamily: "Consolas, monospace", fontSize: "13px", lineHeight: "1.7", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.2) transparent", display: 'flex', flexDirection: 'column' }}>
          {liveTranscript && (
            <div style={{ backgroundColor: "#f1f5f9", padding: "10px", borderRadius: "8px", marginBottom: "10px", color: "#334155", fontStyle: "italic", borderLeft: "3px solid #3b82f6" }}>
              {liveTranscript}
            </div>
          )}
          
          {answer ? (
            <ReactMarkdown
              components={{
                strong({ children }) { return <strong style={{ color: "#0f172a", fontWeight: 700 }}>{children}</strong>; },
                code({ node, inline, className, children, ...props }) {
                  if (inline) return <code style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#334155", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }} {...props}>{children}</code>;
                  return <code style={{ color: "#334155" }} {...props}>{children}</code>;
                },
                pre({ node, children, ...props }) { return <pre style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "8px", overflowX: "auto", border: "1px solid rgba(0,0,0,0.05)", fontSize: "12px", lineHeight: "1.5", margin: "8px 0", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#1e293b" }} {...props}>{children}</pre>; },
                h1({ children }) { return <h1 style={{ color: "#0f172a", fontSize: "16px", margin: "12px 0 6px" }}>{children}</h1>; },
                h2({ children }) { return <h2 style={{ color: "#1e293b", fontSize: "14px", margin: "10px 0 4px" }}>{children}</h2>; },
                h3({ children }) { return <h3 style={{ color: "#334155", fontSize: "13px", margin: "8px 0 3px" }}>{children}</h3>; },
                hr() { return <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.05)", margin: "10px 0" }} />; },
                li({ children }) { return <li style={{ marginBottom: "4px", color: "#334155" }}>{children}</li>; },
                p({ children }) { return <p style={{ margin: "6px 0", color: "#334155" }}>{children}</p>; },
              }}
            >
              {answer}
            </ReactMarkdown>
          ) : !liveTranscript && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', textAlign: 'center' }}>
              Mic Assistant is ready.<br/>Click the microphone below to start capturing.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.05)", flexShrink: 0, position: 'relative' }}>
          <button 
            onClick={toggleMic} 
            style={{
              width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
              background: isListening ? 'linear-gradient(to top right, #4f46e5, #ec4899)' : '#f1f5f9',
              color: isListening ? '#ffffff' : '#475569', cursor: 'pointer', WebkitAppRegion: "no-drag", transition: 'all 0.3s ease',
              boxShadow: isListening ? '0 0 15px rgba(99,102,241,0.4)' : 'none'
            }}
            title={isListening ? "Stop Capturing" : "Start Capturing"}
          >
            {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
          </button>
          
          <button onClick={handleCopy} style={{ position: 'absolute', right: 0, background: copied ? "#f0fdf4" : "#f1f5f9", border: `1px solid ${copied ? "#bbf7d0" : "#e2e8f0"}`, color: copied ? "#16a34a" : "#475569", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>

      </div>
    </div>
  );
}
