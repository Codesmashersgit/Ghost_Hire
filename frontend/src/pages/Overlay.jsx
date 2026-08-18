import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Only load ipcRenderer if running in Electron
const isElectron = window && window.process && window.process.type;
let ipcRenderer = null;
if (isElectron) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

export default function Overlay() {
  const [answer, setAnswer] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ipcRenderer) return;

    const handleShowAnswer = (event, text) => {
      setAnswer(text);
      setIsVisible(true);
    };

    ipcRenderer.on('show-answer', handleShowAnswer);

    // Hide when clicking outside or pressing Escape (though it's ignoreMouseEvents, so it won't receive clicks easily unless focused)
    const handleHide = () => setIsVisible(false);
    ipcRenderer.on('hide-overlay', handleHide);

    return () => {
      ipcRenderer.removeListener('show-answer', handleShowAnswer);
      ipcRenderer.removeListener('hide-overlay', handleHide);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'flex-end', // Aligned to right
      alignItems: 'flex-start'    // Aligned to top
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark, semi-transparent background
        color: '#e2e8f0', // Light gray text
        padding: '20px',
        borderRadius: '12px',
        width: '400px',
        maxHeight: '80vh',
        overflowY: 'hidden', // No scrollbars to keep it clean
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ 
          borderBottom: '1px solid rgba(255,255,255,0.2)', 
          paddingBottom: '8px', 
          marginBottom: '10px',
          fontWeight: 'bold',
          color: '#818cf8', // Indigo color for the header
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>GhostHire Copilot</span>
          <span style={{ fontSize: '10px', opacity: 0.6, paddingTop: '3px' }}>Ctrl+Shift+Z to hide</span>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 50px)' }}>
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}) {
                return (
                  <code style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    padding: '2px 4px', 
                    borderRadius: '4px',
                    color: '#a78bfa' 
                  }} {...props}>
                    {children}
                  </code>
                )
              },
              pre({node, children, ...props}) {
                return (
                  <pre style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    padding: '10px', 
                    borderRadius: '6px',
                    overflowX: 'auto',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }} {...props}>
                    {children}
                  </pre>
                )
              }
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
