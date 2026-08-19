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
    const handleShowAnswer = (event, text) => {
      setAnswer(text);
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

  if (!isVisible) return <div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent" }} />;

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent", padding: "10px", boxSizing: "border-box" }}>
      <div style={{ backgroundColor: "rgba(10,10,20,0.92)", color: "#e2e8f0", padding: "14px 16px", borderRadius: "14px", width: "100%", height: "100%", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.7)", border: "1px solid rgba(129,140,248,0.3)", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", marginBottom: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4ade80" }} />
            <span style={{ color: "#818cf8", fontWeight: "bold", fontSize: "12px" }}>AI COPILOT</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handleCopy} style={{ background: copied ? "rgba(74,222,128,0.2)" : "rgba(129,140,248,0.15)", border: `1px solid ${copied ? "rgba(74,222,128,0.5)" : "rgba(129,140,248,0.3)"}`, color: copied ? "#4ade80" : "#818cf8", borderRadius: "6px", padding: "3px 8px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}>
              {copied ? "COPIED!" : "COPY ALL"}
            </button>
            <span style={{ fontSize: "9px", opacity: 0.4, color: "#94a3b8" }}>Ctrl+Shift+Z=hide</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} style={{ overflowY: "auto", flex: 1, fontFamily: "Consolas, monospace", fontSize: "12.5px", lineHeight: "1.7", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(129,140,248,0.3) transparent" }}>
          <ReactMarkdown
            components={{
              strong({ children }) { return <strong style={{ color: "#a78bfa", fontWeight: 700 }}>{children}</strong>; },
              code({ node, inline, className, children, ...props }) {
                if (inline) return <code style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#c4b5fd", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }} {...props}>{children}</code>;
                return <code style={{ color: "#c4b5fd" }} {...props}>{children}</code>;
              },
              pre({ node, children, ...props }) { return <pre style={{ backgroundColor: "rgba(0,0,0,0.6)", padding: "10px 12px", borderRadius: "8px", overflowX: "auto", border: "1px solid rgba(129,140,248,0.2)", fontSize: "11.5px", lineHeight: "1.5", margin: "8px 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }} {...props}>{children}</pre>; },
              h1({ children }) { return <h1 style={{ color: "#818cf8", fontSize: "14px", margin: "8px 0 4px" }}>{children}</h1>; },
              h2({ children }) { return <h2 style={{ color: "#a78bfa", fontSize: "13px", margin: "8px 0 4px" }}>{children}</h2>; },
              h3({ children }) { return <h3 style={{ color: "#c4b5fd", fontSize: "12px", margin: "6px 0 3px" }}>{children}</h3>; },
              hr() { return <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "10px 0" }} />; },
              li({ children }) { return <li style={{ marginBottom: "4px", color: "#cbd5e1" }}>{children}</li>; },
              p({ children }) { return <p style={{ margin: "6px 0", color: "#e2e8f0" }}>{children}</p>; },
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
