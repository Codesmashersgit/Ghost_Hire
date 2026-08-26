import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const isElectron = window && window.process && window.process.type;
let ipcRenderer = null;
let clipboard = null;
if (isElectron) {
  const electron = window.require("electron");
  ipcRenderer = electron.ipcRenderer;
  clipboard = electron.clipboard;
}

export default function Overlay() {
  const [answer, setAnswer] = useState("");
  const [answerType, setAnswerType] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Force transparent background on body and html to prevent white/dark solid backgrounds
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";
    document.body.style.backgroundImage = "none";
    
    // Hide the pseudo-elements (aurora gradient) if present
    const style = document.createElement('style');
    style.innerHTML = `
      body::before, body::after { display: none !important; }
      html, body { background: transparent !important; }
    `;
    document.head.appendChild(style);

    if (!ipcRenderer) return;
    const handleShowAnswer = (event, text, type) => {
      setAnswer(text);
      setAnswerType(type || 'Theory');
      setIsVisible(true);
      setCopied(false);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }, 50);
    };
    const handleHide = () => setIsVisible(false);
    ipcRenderer.on("show-answer", handleShowAnswer);
    ipcRenderer.on("hide-overlay", handleHide);
    return () => {
      ipcRenderer.removeListener("show-answer", handleShowAnswer);
      ipcRenderer.removeListener("hide-overlay", handleHide);
      document.head.removeChild(style);
    };
  }, []);

  const handleCopy = () => {
    if (clipboard) clipboard.writeText(answer);
    else navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetCode = () => {
    setAnswer("Fetching optimal code... Please wait...");
    setAnswerType("Loading");
    if (ipcRenderer) ipcRenderer.send('request-code');
  };

  if (!isVisible) return <div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent" }} />;

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent", padding: "10px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#ffffff", color: "#1e293b", padding: "14px 16px", borderRadius: "14px", width: "100%", height: "100%", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ WebkitAppRegion: "drag", cursor: "grab", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px", marginBottom: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: answerType === 'Code' ? "#f59e0b" : "#4ade80" }} />
            <span style={{ color: "#475569", fontWeight: "bold", fontSize: "12px" }}>AI COPILOT {answerType ? `— ${answerType.toUpperCase()}` : ''} (Drag me)</span>
          </div>
          <span style={{ fontSize: "9px", opacity: 0.6, color: "#64748b", WebkitAppRegion: "no-drag" }}>Ctrl+Shift+Z to hide</span>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} style={{ overflowY: "auto", flex: 1, fontFamily: "Consolas, monospace", fontSize: "13px", lineHeight: "1.7", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.2) transparent" }}>
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
        </div>

        {/* Footer Buttons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.05)", flexShrink: 0 }}>
          {answerType === 'Theory' && (
            <button onClick={handleGetCode} style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#d97706", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
              GET CODE
            </button>
          )}
          <button onClick={handleCopy} style={{ background: copied ? "#f0fdf4" : "#f1f5f9", border: `1px solid ${copied ? "#bbf7d0" : "#e2e8f0"}`, color: copied ? "#16a34a" : "#475569", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
            {copied ? "COPIED!" : "COPY ALL"}
          </button>
        </div>
      </div>
    </div>
  );
}
