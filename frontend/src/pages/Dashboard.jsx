import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Play, Upload, Settings, LogOut, Clock, Zap, FileText, Globe, Mic, MicOff, Square, MessageSquare, ChevronDown, CreditCard, HelpCircle, Plus, Key, ArrowRight } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function Dashboard() {
  const navigate = useNavigate()
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [selectedLang, setSelectedLang] = useState('English')
  const [messages, setMessages] = useState([])
  const [extraContext, setExtraContext] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [user, setUser] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [activeTab, setActiveTab] = useState('New Session')
  const [sessionsList, setSessionsList] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [invoicesList, setInvoicesList] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const secondsRef = useRef(0)

  const fetchSessions = async (uid) => {
    if (!uid) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:5000/api/sessions?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setSessionsList(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchInvoices = async (uid) => {
    if (!uid) return;
    setLoadingInvoices(true);
    try {
      const res = await fetch(`http://localhost:5000/api/invoices?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setInvoicesList(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSimulatePayment = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    try {
      const parsed = JSON.parse(userData);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/invoices/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parsed._id,
          amount: '$19.00'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Payment Successful! $19.00 billed and Invoice generated in MongoDB DB!");
        fetchInvoices(parsed._id);
      }
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchSessions(parsed._id);
        fetchInvoices(parsed._id);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          handleFinalTranscript(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      rec.onend = () => {
        // Auto-restart if session is still active and was listening
        if (isSessionActive && isListening) {
          try {
            rec.start();
          } catch(e) {
            console.error("Failed to auto-restart speech recognition", e);
          }
        }
      };

      recognitionRef.current = rec;
    }
  }, [isSessionActive, isListening]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFinalTranscript = async (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessages(prev => [...prev, { type: 'interviewer', text: `"${text}"`, time }]);
    
    if (!chatRef.current) return;
    
    setMessages(prev => [...prev, { type: 'system', text: 'GhostHire is analyzing context...' }]);
    
    try {
      const prompt = extraContext ? `Context: ${extraContext}\n\nQuestion: ${text}` : text;
      const result = await chatRef.current.sendMessage(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      setMessages(prev => {
        const newMsgs = [...prev];
        if(newMsgs[newMsgs.length - 1].type === 'system') newMsgs.pop();
        return [...newMsgs, { 
          type: 'ai', 
          text: textResponse, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        }];
      });
    } catch(e) {
      console.error(e);
      setMessages(prev => {
        const newMsgs = [...prev];
        if(newMsgs[newMsgs.length - 1].type === 'system') newMsgs.pop();
        return [...newMsgs, { type: 'system', text: 'Error generating AI response. Please check your API key.' }];
      });
    }
  };

  const startSession = () => {
    const activeKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!activeKey) {
      alert("Gemini API Key not found in .env file. Please add VITE_GEMINI_API_KEY.");
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      chatRef.current = model.startChat({
        systemInstruction: `You are an expert interview copilot. The user will send you interview questions (and optionally some context). You must provide concise, professional, and highly actionable answers that the candidate can speak during the interview. Keep it natural, straight to the point, and respond exactly in ${selectedLang}.`
      });
    } catch(e) {
      console.error("Failed to init AI", e);
    }

    setIsSessionActive(true);
    setMessages([
      { type: 'system', text: 'Session started. GhostHire is now listening...' },
    ]);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setMessages([{ type: 'system', text: 'Error: Speech Recognition API not supported in this browser.' }]);
    }
  }

  const stopSession = async () => {
    setIsSessionActive(false);
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {
        console.error(e);
      }
    }
    
    // Save session to backend
    if (messages.length > 1) {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const activeMessages = messages.filter(m => m.type !== 'system');
          
          await fetch('http://localhost:5000/api/sessions/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: parsedUser._id,
              title: `${selectedLang} Interview Session`,
              transcript: activeMessages,
              duration: 'N/A'
            })
          });
          
          // Refresh sessions after saving
          fetchSessions(parsedUser._id);
        }
      } catch (err) {
        console.error("Failed to save session", err);
      }
    }
    
    setMessages([]);
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setMessages(prev => [...prev, { type: 'system', text: 'Mic muted. GhostHire stopped listening.' }]);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setMessages(prev => [...prev, { type: 'system', text: 'Mic active. GhostHire is listening...' }]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendManualMessage = () => {
    if (!manualInput.trim()) return;
    handleFinalTranscript(manualInput.trim());
    setManualInput('');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-black/10 flex flex-col shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="p-5 border-b border-black/10">
          <a href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white"><Sparkles size={16} /></div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GhostHire</span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: <Play size={18} />, label: 'New Session' },
            { icon: <Clock size={18} />, label: 'Session History' },
            { icon: <FileText size={18} />, label: 'My Documents' },
            { icon: <CreditCard size={18} />, label: 'Credits & Billing' },
            { icon: <Settings size={18} />, label: 'Settings' },
            { icon: <HelpCircle size={18} />, label: 'Help & Support' },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.label ? 'bg-primary/15 text-primary-light border border-primary/20' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Credits Card */}
        <div className="p-4">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-tertiary">Credits</span>
              <span className="text-xs text-primary-light font-mono">∞ Free Trial</span>
            </div>
            <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <button onClick={handleSimulatePayment} className="w-full mt-3 py-2 text-xs font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[0.7rem] text-text-tertiary truncate">{user?.email || 'Login to sync'}</p>
            </div>
            <button onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/');
            }} className="text-text-tertiary hover:text-text-primary transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'New Session' && (
          <>
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-bg-secondary/50 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold">
                  {isSessionActive ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,68,68,0.5)]" />
                      Live Session
                    </span>
                  ) : 'New Session'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Select */}
                <div className="relative">
                  <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                    className="appearance-none bg-black/5 border border-black/10 rounded-xl px-4 py-2 pr-8 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer">
                    <option value="English">🇺🇸 English</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="German">🇩🇪 German</option>
                    <option value="French">🇫🇷 French</option>
                    <option value="Japanese">🇯🇵 Japanese</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Transcript Area */}
              <div className="flex-1 flex flex-col">
                {!isSessionActive ? (
                  /* Start Screen */
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Mic size={36} className="text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3">Start a New Session</h2>
                      <p className="text-sm text-text-secondary leading-relaxed mb-8">
                        GhostHire will listen to your interview and provide real-time AI-generated responses. Get coding support, behavioral answers, and personalized context instantly.
                      </p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <button onClick={startSession}
                          className="px-8 py-3.5 text-sm font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300 flex items-center gap-2">
                          <Play size={18} /> Start Session
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Session */
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((msg, i) => (
                        <div key={i} className={`max-w-2xl ${msg.type === 'ai' ? '' : msg.type === 'system' ? 'mx-auto text-center' : ''}`}>
                          {msg.type === 'system' ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary-light font-medium">
                              <Zap size={12} /> {msg.text}
                            </div>
                          ) : msg.type === 'interviewer' ? (
                            <div className="p-4 bg-black/5 border border-black/10 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">🎙️ Interviewer</span>
                                <span className="text-[0.65rem] text-text-muted font-mono">{msg.time}</span>
                              </div>
                              <p className="text-sm text-text-secondary">{msg.text}</p>
                            </div>
                          ) : (
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl ml-8">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-primary-light flex items-center gap-1"><Zap size={12} /> GhostHire Suggestion</span>
                                <span className="text-[0.65rem] text-text-muted font-mono">{msg.time}</span>
                              </div>
                              <p className="text-sm text-text-primary leading-relaxed">{msg.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Controls */}
                    <div className="p-4 border-t border-black/10 bg-bg-secondary/50 backdrop-blur-xl">
                      <div className="flex items-center gap-3 max-w-3xl mx-auto">
                        {/* Toggle Mic */}
                        <button onClick={toggleListening} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shrink-0 ${isListening ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/5 border-black/10 text-text-secondary hover:bg-black/10'}`}>
                          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        
                        {/* Manual Input Bar */}
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSendManualMessage(); }}
                            placeholder={isListening ? "Listening... or type message manually..." : "Type message manually..."}
                            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/40 outline-none transition-all"
                          />
                          <button onClick={handleSendManualMessage} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0">
                            Send <ArrowRight size={14} />
                          </button>
                        </div>

                        {/* Stop Session */}
                        <button onClick={stopSession}
                          className="px-4 py-2.5 text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-1.5 shrink-0">
                          <Square size={14} /> End
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Session History' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Session History</h2>
            <p className="text-sm text-text-secondary mb-6">Review your past interviews and AI suggestions.</p>
            
            {loadingSessions ? (
              <p className="text-sm text-text-tertiary">Loading history...</p>
            ) : sessionsList.length === 0 ? (
              <p className="text-sm text-text-tertiary">No past sessions found. Start a session to save history.</p>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {sessionsList.map((session, i) => (
                  <div key={i} className="p-5 bg-bg-secondary border border-black/10 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all">
                    <div>
                      <span className="text-xs text-primary-light font-semibold">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h3 className="text-base font-bold text-text-primary mt-1">{session.title}</h3>
                      <div className="flex gap-4 mt-2 text-xs text-text-tertiary">
                        <span>Duration: {session.duration}</span>
                        <span>QA Count: {session.transcript?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-success/15 border border-success/20 text-success text-xs font-semibold rounded-full">Completed</span>
                      <button onClick={() => {
                        alert(JSON.stringify(session.transcript, null, 2));
                      }} className="px-4 py-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl text-xs font-bold text-text-primary transition-all">View Transcript</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'My Documents' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">User Guide & Documentation</h2>
            <p className="text-sm text-text-secondary mb-8">Learn how to maximize your GhostHire copilot for interview success.</p>
            
            <div className="max-w-4xl space-y-6">
              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl">
                <h3 className="text-lg font-bold text-text-primary mb-3">🚀 Getting Started in 3 Steps</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-sm shrink-0">1</div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Configure Settings</h4>
                      <p className="text-xs text-text-secondary mt-1">Select your preferred AI Engine (GPT-4, Claude, or Gemini) and Response Language (English, Hindi, etc.) at the top header.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-sm shrink-0">2</div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Start a New Session</h4>
                      <p className="text-xs text-text-secondary mt-1">Click the "Start Session" button. Ensure you grant microphone access so that GhostHire can listen to interviewer's questions.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-sm shrink-0">3</div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Speak or Type</h4>
                      <p className="text-xs text-text-secondary mt-1">As the interviewer speaks, the AI will transcribe and generate answers instantly. You can also manually type any question in the control panel input and hit Send.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl">
                <h3 className="text-lg font-bold text-text-primary mb-3">🔒 Stealth Mode Safety</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  GhostHire is designed with extreme stealth features. Our native window architecture blocks capture engines. When you share your screen via Zoom, Microsoft Teams, Google Meet, or Discord, other participants will only see a black window instead of GhostHire. Keep the app open safely on the side of your monitor!
                </p>
              </div>

              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl">
                <h3 className="text-lg font-bold text-text-primary mb-3">💡 Best Practices</h3>
                <ul className="list-disc list-inside space-y-2 text-xs text-text-secondary">
                  <li><strong>Quiet Environment:</strong> Speak in a quiet room so the microphone doesn't pick up ambient background noise.</li>
                  <li><strong>Clear Audio:</strong> If using headphones, make sure your default system mic is selected in system audio settings.</li>
                  <li><strong>Use Extra Context:</strong> Paste the target job description or company-specific values into the "Extra Context" section on the right side. This forces the AI to output responses tailored to that job description!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Credits & Billing' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Credits & Billing</h2>
            <p className="text-sm text-text-secondary mb-6">Manage your plan subscription and credit usage.</p>
            
            <div className="max-w-4xl space-y-8">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">Current Plan</span>
                  <h3 className="text-2xl font-black text-text-primary mt-1">Free Trial Mode</h3>
                  <p className="text-sm text-text-secondary mt-1">Enjoy unlimited credits during the beta phase.</p>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="text-3xl font-black text-text-primary">∞ <span className="text-sm font-medium text-text-tertiary">Credits remaining</span></div>
                  <button onClick={handleSimulatePayment} className="mt-3 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg transition-all">Upgrade to Pro</button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary mb-4">Payment Invoices</h3>
                {loadingInvoices ? (
                  <p className="text-sm text-text-tertiary">Loading invoices...</p>
                ) : invoicesList.length === 0 ? (
                  <div className="p-6 bg-black/5 border border-black/10 rounded-2xl text-center">
                    <p className="text-sm text-text-secondary">No invoices found. Invoices are generated dynamically when you perform a payment.</p>
                    <button onClick={handleSimulatePayment} className="mt-3 px-5 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary-light transition-all">
                      Upgrade to Pro ($19.00)
                    </button>
                  </div>
                ) : (
                  <div className="bg-bg-secondary border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden">
                    {invoicesList.map((inv, i) => (
                      <div key={i} className="p-4 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-bold text-text-primary">{inv.invoiceId}</span>
                          <span className="text-text-tertiary ml-4">
                            {new Date(inv.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-text-primary">{inv.amount}</span>
                          <span className="px-2 py-0.5 bg-success/15 border border-success/20 text-success text-xs font-semibold rounded">{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-sm text-text-secondary mb-6">Customize GhostHire to align with your setup.</p>
            
            <div className="max-w-3xl space-y-6">
              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-black/5 pb-2">Stealth Protection</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Content Protection</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Prevents capture software (OBS, Zoom, Discord) from viewing the app window.</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/15 border border-primary/20 text-primary-light text-xs font-semibold rounded-full">Always On</span>
                </div>
              </div>

              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-black/5 pb-2">Audio & Input Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Speech Language Model</label>
                    <select className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors">
                      <option>Auto Detect Language</option>
                      <option>English only</option>
                      <option>Hinglish / Mix</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Help & Support' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Help & Support</h2>
            <p className="text-sm text-text-secondary mb-6">Need help? We've got you covered.</p>
            
            <div className="max-w-4xl space-y-6">
              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-text-primary">Frequently Asked Questions</h3>
                <div className="space-y-4 divide-y divide-black/5">
                  {[
                    { q: 'Is it completely undetectable during screen sharing?', a: 'Yes! Using our system level mainWindow.setContentProtection(true) setting, screen share softares (Zoom, OBS, Teams) will only see a black window instead of GhostHire, maintaining your full stealth mode.' },
                    { q: 'How does voice recognition work?', a: 'GhostHire utilizes the web speech API to transcribe the interviewer\'s audio in real-time. Make sure to keep your microphone unmuted or speak in a quiet room for high accuracy.' }
                  ].map((faq, i) => (
                    <div key={i} className={`pt-4 ${i === 0 ? 'pt-0' : ''}`}>
                      <h4 className="text-sm font-bold text-text-primary">{faq.q}</h4>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
