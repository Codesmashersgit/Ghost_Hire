import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Play, Upload, Settings, LogOut, Clock, Zap, FileText, Globe, Mic, MicOff, Square, MessageSquare, ChevronDown, CreditCard, HelpCircle, Plus, Key, ArrowRight, Sliders, X, Activity, RefreshCw } from 'lucide-react'


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
  const [speechNotification, setSpeechNotification] = useState(null)
  
  const [transcriptionEngine, setTranscriptionEngine] = useState(() => {
    return localStorage.getItem('ghosthire_transcription_engine') || 'AI_ENGINE';
  })
  const [autoSend, setAutoSend] = useState(() => {
    return localStorage.getItem('ghosthire_autosend') === 'true';
  })
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  
  const [aiProvider, setAiProvider] = useState(() => {
    return localStorage.getItem('ghosthire_ai_provider') || 'GEMINI';
  })
  const [groqApiKey, setGroqApiKey] = useState(() => {
    return localStorage.getItem('ghosthire_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '';
  })
  const [groqModel, setGroqModel] = useState(() => {
    const saved = localStorage.getItem('ghosthire_groq_model');
    if (saved === 'llama-3.3-70b-specdec') {
      return 'llama-3.3-70b-versatile';
    }
    return saved || 'llama-3.3-70b-versatile';
  })
  const [pollinationsModel, setPollinationsModel] = useState(() => {
    return localStorage.getItem('ghosthire_pollinations_model') || 'openai';
  })
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)
  const chatHistoryRef = useRef([])
  const timerIntervalRef = useRef(null)
  const secondsRef = useRef(0)

  // Custom audio transcriber refs
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  const isListeningRef = useRef(isListening)
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening])

  const isSessionActiveRef = useRef(isSessionActive)
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive])

  const transcriptionEngineRef = useRef(transcriptionEngine)
  useEffect(() => {
    transcriptionEngineRef.current = transcriptionEngine;
  }, [transcriptionEngine])

  useEffect(() => {
    localStorage.setItem('ghosthire_transcription_engine', transcriptionEngine);
  }, [transcriptionEngine])

  useEffect(() => {
    localStorage.setItem('ghosthire_autosend', autoSend);
  }, [autoSend])

  useEffect(() => {
    localStorage.setItem('ghosthire_ai_provider', aiProvider);
  }, [aiProvider])

  useEffect(() => {
    localStorage.setItem('ghosthire_groq_api_key', groqApiKey);
  }, [groqApiKey])

  useEffect(() => {
    localStorage.setItem('ghosthire_groq_model', groqModel);
  }, [groqModel])

  useEffect(() => {
    localStorage.setItem('ghosthire_pollinations_model', pollinationsModel);
  }, [pollinationsModel])

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
    if (speechNotification) {
      const t = setTimeout(() => {
        setSpeechNotification(null);
      }, 10000); // 10 seconds timeout for transcription review
      return () => clearTimeout(t);
    }
  }, [speechNotification]);

  const transcribeAudio = async (blob) => {
    const activeKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!activeKey) return "";
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const genAI = new GoogleGenerativeAI(activeKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          
          const prompt = `You are a speech-to-text transcriber for an interview.
Transcribe the provided audio into text.
The speech is in ${selectedLang}.
Return ONLY the transcribed text. Do not add any notes, headers, explanations, or conversational filler.
If the audio is silent or only contains noise, return exactly nothing (empty string).`;
          
          const result = await model.generateContent([
            {
              inlineData: {
                data: base64Data,
                mimeType: blob.type || "audio/webm"
              }
            },
            prompt
          ]);
          
          const text = result.response.text().trim();
          resolve(text);
        } catch (err) {
          console.error("Transcription error:", err);
          resolve("");
        }
      };
      reader.readAsDataURL(blob);
    });
  };

  const startVisualizer = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.8;
          if (barHeight < 4) barHeight = 4; // minimum height

          // Centered bar drawing
          const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          gradient.addColorStop(0, '#E11D48'); // Primary Rose
          gradient.addColorStop(0.5, '#F97316'); // Accent Orange
          gradient.addColorStop(1, '#E11D48');

          ctx.fillStyle = gradient;
          
          const barY = height / 2 - barHeight / 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, barY, barWidth - 2, barHeight, 2);
          } else {
            ctx.rect(x, barY, barWidth - 2, barHeight);
          }
          ctx.fill();

          x += barWidth;
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error("Visualizer setup failed:", err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      startVisualizer(stream);

      const options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/ogg';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
          chunksRef.current = [];
          
          setIsTranscribing(true);
          const text = await transcribeAudio(audioBlob);
          setIsTranscribing(false);
          
          if (text && text.trim()) {
            setManualInput(prev => {
              const joined = prev ? `${prev} ${text}` : text;
              if (autoSend) {
                setTimeout(() => {
                  handleFinalTranscript(joined);
                  setManualInput('');
                  setSpeechNotification(null);
                }, 100);
                return '';
              } else {
                setSpeechNotification(joined);
                return joined;
              }
            });
          }
        }

        if (isListeningRef.current && transcriptionEngineRef.current === 'AI_ENGINE') {
          try {
            mediaRecorderRef.current.start();
          } catch(e) {
            console.error("Failed to restart MediaRecorder:", e);
          }
        }
      };

      mediaRecorder.start();
      
      recordingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 3000);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      setMessages(prev => [...prev, { type: 'system', text: `Mic Access Error: ${err.message || err}. Please allow microphone permissions.` }]);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    stopVisualizer();
  };

  useEffect(() => {
    // Clean up any active engines first
    stopRecording();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {}
    }

    if (!isListening) return;

    if (transcriptionEngine === 'AI_ENGINE') {
      startRecording();
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        
        const langMap = {
          'English': 'en-US',
          'Hindi': 'hi-IN',
          'German': 'de-DE',
          'French': 'fr-FR',
          'Japanese': 'ja-JP'
        };
        rec.lang = langMap[selectedLang] || 'en-US';

        rec.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const text = finalTranscript || interimTranscript;
          if (text.trim()) {
            setManualInput(text);
            setSpeechNotification(text);
          }
        };

        rec.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'not-allowed') {
            setMessages(prev => [...prev, { type: 'system', text: 'Error: Microphone permission denied. Please allow microphone access.' }]);
            setIsListening(false);
          } else if (event.error === 'network') {
            setMessages(prev => [...prev, { 
              type: 'system', 
              text: 'Native engine error: Network/Service restricted. Switching to GhostHire AI Engine...' 
            }]);
            setTranscriptionEngine('AI_ENGINE');
          }
        };

        rec.onend = () => {
          if (isSessionActiveRef.current && isListeningRef.current && transcriptionEngineRef.current === 'NATIVE') {
            try {
              rec.start();
            } catch(e) {
              console.error("Failed to auto-restart speech recognition", e);
            }
          }
        };

        recognitionRef.current = rec;
        try {
          rec.start();
        } catch(e) {
          console.error("Failed to start speech recognition", e);
        }
      } else {
        setMessages(prev => [...prev, { 
          type: 'system', 
          text: 'Native Speech Recognition not supported. Falling back to GhostHire AI Engine...' 
        }]);
        setTranscriptionEngine('AI_ENGINE');
      }
    }

    return () => {
      stopRecording();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
    };
  }, [isListening, transcriptionEngine, selectedLang]);

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

  const initChatSession = (modelName, history = []) => {
    const activeKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!activeKey) return null;

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: `You are an expert interview copilot. Provide extremely concise, precise, and direct answers under high pressure. 
DO NOT write introductions, conclusions, or filler text. Start responding immediately.

Your response MUST strictly follow this ultra-short structure:

### 🔑 KEY TALKING POINTS
* [2 bullets max, 3-4 words each. Highlight core tech/strategy]

### 🗣️ EXACT RESPONSE TO SPEAK (First-Person Tone)
"[Provide a natural 2-sentence response max, in first person (I, my, we). Make it clear, direct, and quick to speak.]"

### 💡 TECHNICAL CORNER
* [1 sentence max highlighting architecture, complexity (e.g. O(N)), or design pattern]

Maintain this exact format and respond strictly in ${selectedLang}.`
      });
      chatRef.current = model.startChat({ history });
      return true;
    } catch(e) {
      console.error(`Failed to init chat session with ${modelName}`, e);
      return false;
    }
  };

  const isCasualPhrase = (text) => {
    const clean = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const casualWords = [
      "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
      "am i audible", "can you hear me", "can everyone hear me", "testing", 
      "test", "testing mic", "mic test", "one two three", "1 2 3", "how are you",
      "thank you", "thanks", "ok", "okay", "fine", "yes", "no"
    ];
    
    if (clean.split(/\s+/).length <= 3) {
      return casualWords.some(w => clean.includes(w) || w.includes(clean));
    }
    
    return casualWords.some(w => clean.includes(w));
  };

  const handleFinalTranscript = async (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessages(prev => [...prev, { type: 'interviewer', text: `"${text}"`, time }]);
    
    const aiMessageId = Date.now();
    setMessages(prev => [...prev, { 
      id: aiMessageId,
      type: 'ai', 
      text: '', 
      isStreaming: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    }]);

    if (isCasualPhrase(text)) {
      setTimeout(() => {
        let reply = "Hello! Ready when you are.";
        const clean = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
        if (clean.includes("audible") || clean.includes("hear me")) {
          reply = "Yes, you are perfectly audible. I can hear you clearly.";
        } else if (clean.includes("thank") || clean.includes("thanks")) {
          reply = "You're welcome!";
        } else if (clean.includes("how are you")) {
          reply = "I am doing well, thank you! How are you?";
        }
        
        setMessages(prev => {
          return prev.map(msg => {
            if (msg.id === aiMessageId) {
              return { ...msg, text: reply, isStreaming: false };
            }
            return msg;
          });
        });
      }, 300);
      return;
    }

    try {
      const activeKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!activeKey) {
        throw new Error("Groq API Key (VITE_GROQ_API_KEY) is missing in your .env file.");
      }
      
      const systemInstruction = `You are an expert interview copilot. Provide extremely concise, precise, and direct answers under high pressure. 
DO NOT write introductions, conclusions, or filler text. Start responding immediately.

Your response MUST strictly follow this ultra-short structure:

### 🔑 KEY TALKING POINTS
* [2 bullets max, 3-4 words each. Highlight core tech/strategy]

### 🗣️ EXACT RESPONSE TO SPEAK (First-Person Tone)
"[Provide a natural 2-sentence response max, in first person (I, my, we). Make it clear, direct, and quick to speak.]"

### 💡 TECHNICAL CORNER
* [1 sentence max highlighting architecture, complexity (e.g. O(N)), or design pattern]

Maintain this exact format and respond strictly in ${selectedLang}.`;

      const prompt = extraContext ? `Context: ${extraContext}\n\nQuestion: ${text}` : text;
      const apiMessages = [
        { role: "system", content: systemInstruction },
        ...chatHistoryRef.current,
        { role: "user", content: prompt }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: apiMessages,
          stream: true
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq API returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let accumulatedText = "";
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content || "";
              accumulatedText += content;
              
              setMessages(prev => {
                return prev.map(msg => {
                  if (msg.id === aiMessageId) {
                    return { ...msg, text: accumulatedText };
                  }
                  return msg;
                });
              });
            } catch(e) {}
          }
        }
      }

      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === aiMessageId) {
            return { ...msg, text: accumulatedText, isStreaming: false };
          }
          return msg;
        });
      });

      chatHistoryRef.current.push({ role: "user", content: prompt });
      chatHistoryRef.current.push({ role: "assistant", content: accumulatedText });

    } catch(e) {
      console.error("Groq generation failed:", e);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== aiMessageId);
        return [...filtered, { type: 'system', text: `Error: Groq request failed. (${e.message || e})` }];
      });
    }
  };

  const startSession = () => {
    chatHistoryRef.current = [];

    const activeKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!activeKey) {
      alert("Groq API Key not found in .env file. Please add VITE_GROQ_API_KEY.");
      return;
    }

    setIsSessionActive(true);
    setMessages([]);
    setIsListening(false);
  }

  const stopSession = async () => {
    setIsSessionActive(false);
    setIsListening(false);
    stopRecording();
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
    setIsListening(!isListening);
  };

  const handleSendManualMessage = () => {
    if (!manualInput.trim()) return;
    handleFinalTranscript(manualInput.trim());
    setManualInput('');
    setSpeechNotification(null);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-bg-primary flex">
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
                
                {/* Control Panel Toggle */}
                {isSessionActive && (
                  <button 
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    className={`p-2 rounded-xl border transition-all ${isRightSidebarOpen ? 'bg-primary/10 border-primary/20 text-primary-light' : 'bg-black/5 border-black/10 text-text-secondary hover:bg-black/10'}`}
                    title="Toggle Session Control Panel"
                  >
                    <Sliders size={16} />
                  </button>
                )}
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
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
                      {speechNotification && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-300">
                          <div className="flex items-center gap-3 px-5 py-3 bg-bg-secondary/90 border border-primary/20 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] backdrop-blur-xl text-text-primary text-xs font-semibold relative overflow-hidden">
                            {/* Top decorative line */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                            
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse shrink-0">
                              <Mic size={12} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold uppercase tracking-wider text-[0.65rem] text-primary-light">Voice Transcribed Preview</p>
                              <p className="truncate text-text-secondary mt-0.5">"{speechNotification}"</p>
                            </div>
                            
                            <div className="flex gap-1 shrink-0">
                              <button 
                                onClick={() => {
                                  setManualInput('');
                                  setSpeechNotification(null);
                                }} 
                                className="px-2.5 py-1 bg-black/5 hover:bg-black/10 text-text-secondary font-bold rounded-lg transition-all text-[0.65rem]"
                              >
                                Clear
                              </button>
                              <button 
                                onClick={handleSendManualMessage} 
                                className="px-3 py-1 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-md transition-all text-[0.65rem]"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl ml-8 relative group">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-primary-light flex items-center gap-1">
                                  <Zap size={12} className={msg.isStreaming ? 'animate-bounce' : ''} /> 
                                  GhostHire Suggestion
                                </span>
                                <span className="text-[0.65rem] text-text-muted font-mono">{msg.time}</span>
                              </div>
                              {msg.text ? (
                                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                                  {msg.text}
                                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary-light animate-pulse align-middle" />}
                                </p>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                  <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                  <span>AI is analyzing context...</span>
                                </div>
                              )}
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
                        <button 
                          onClick={toggleListening} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 relative group ${
                            isListening 
                              ? 'bg-gradient-to-tr from-primary to-accent border-primary/30 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse' 
                              : 'bg-black/5 border-black/10 text-text-secondary hover:bg-black/10 hover:border-black/20'
                          }`}
                          title={isListening ? "Mute Microphone" : "Activate Speech Copilot"}
                        >
                          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                          <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-secondary transition-all ${
                            isListening ? 'bg-green-500' : 'bg-text-muted'
                          }`} />
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

              {/* Collapsible Right Sidebar Control Center */}
              {isSessionActive && isRightSidebarOpen && (
                <aside className="w-80 bg-bg-secondary border-l border-black/10 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-300">
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-black/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      <Sliders size={16} className="text-primary" /> Session Control Panel
                    </h3>
                    <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 hover:bg-black/5 rounded-lg text-text-tertiary hover:text-text-primary transition-all">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-4 space-y-5">
                    {/* Speech Engine Configuration */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider">Transcription Engine</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setTranscriptionEngine('AI_ENGINE')}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${transcriptionEngine === 'AI_ENGINE' ? 'bg-primary/10 border-primary/30 text-primary-light' : 'bg-black/5 border-black/5 text-text-secondary hover:bg-black/10'}`}
                        >
                          GhostHire AI
                        </button>
                        <button 
                          onClick={() => setTranscriptionEngine('NATIVE')}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${transcriptionEngine === 'NATIVE' ? 'bg-primary/10 border-primary/30 text-primary-light' : 'bg-black/5 border-black/5 text-text-secondary hover:bg-black/10'}`}
                        >
                          Native Web
                        </button>
                      </div>
                      <p className="text-[0.65rem] text-text-tertiary leading-relaxed">
                        {transcriptionEngine === 'AI_ENGINE' 
                          ? '🚀 GhostHire AI Engine transcribes audio snippets using Gemini. 100% working in Electron.' 
                          : '🌐 Native engine uses Chromium recognition. Often blocked/restricted in desktop app.'}
                      </p>
                    </div>

                    {/* Speech Spectrum Visualizer */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider">Audio Monitor</label>
                        {isTranscribing && (
                          <span className="flex items-center gap-1 text-[0.65rem] text-primary-light font-semibold animate-pulse">
                            <RefreshCw size={10} className="animate-spin" /> transcribing...
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-black/5 rounded-2xl border border-black/5">
                        <canvas ref={canvasRef} width="280" height="50" className="w-full h-12 bg-black/10 rounded-xl" />
                        <div className="flex justify-between items-center mt-2 text-[0.65rem] text-text-tertiary font-mono">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-text-muted'}`} />
                            {isListening ? 'Listening' : 'Muted'}
                          </span>
                          <span>Lang: {selectedLang}</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto Send Toggle */}
                    <div className="flex items-center justify-between p-3 bg-black/5 rounded-2xl border border-black/5">
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">Hands-free Auto-Send</h4>
                        <p className="text-[0.65rem] text-text-tertiary mt-0.5">Automatically send to AI once transcribed.</p>
                      </div>
                      <button 
                        onClick={() => setAutoSend(!autoSend)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${autoSend ? 'bg-primary' : 'bg-black/25'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoSend ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Extra Context */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider">Extra Interview Context</label>
                      <textarea
                        value={extraContext}
                        onChange={e => setExtraContext(e.target.value)}
                        placeholder="Paste job description, specific resume achievements, key interview tips, or company culture info here. GhostHire will tailor its suggestion based on this context..."
                        className="w-full h-32 bg-black/5 border border-black/10 rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/40 outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </aside>
              )}
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
                <h3 className="text-base font-bold text-text-primary border-b border-black/5 pb-2">AI Provider & API Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">AI Engine Provider</label>
                    <select 
                      value={aiProvider} 
                      onChange={e => setAiProvider(e.target.value)}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer"
                    >
                      <option value="GEMINI">Google Gemini API (Default)</option>
                      <option value="GROQ">Groq API (Ultra-Fast / Free Developer Key)</option>
                      <option value="POLLINATIONS">Pollinations AI (100% Free & Keyless)</option>
                    </select>
                  </div>

                  {aiProvider === 'POLLINATIONS' ? (
                    <div>
                      <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Pollinations AI Model</label>
                      <select 
                        value={pollinationsModel} 
                        onChange={e => setPollinationsModel(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer"
                      >
                        <option value="openai">OpenAI (GPT-4o-mini - Default)</option>
                        <option value="llama">Llama 3 70B (Fast & Intelligent)</option>
                        <option value="mistral">Mistral 7B (Lightweight & Quick)</option>
                      </select>
                    </div>
                  ) : null}

                  {aiProvider === 'GROQ' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Groq API Key</span>
                          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary-light hover:underline text-[0.75rem] normal-case font-medium">Get Free Key ↗</a>
                        </label>
                        <input 
                          type="password" 
                          value={groqApiKey} 
                          onChange={e => setGroqApiKey(e.target.value)}
                          placeholder="gsk_..."
                          className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Groq AI Model</label>
                        <select 
                          value={groqModel} 
                          onChange={e => setGroqModel(e.target.value)}
                          className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer"
                        >
                          <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Smartest, High Quality Coding)</option>
                          <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Blazing Fast, Low Latency)</option>
                          <option value="mixtral-8x7b-32768">Mixtral 8x7B (Excellent Multi-lingual Reasoning)</option>
                        </select>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="p-6 bg-bg-secondary border border-black/10 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-black/5 pb-2">Audio & Input Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Speech Language Model</label>
                    <select 
                      value={selectedLang} 
                      onChange={e => setSelectedLang(e.target.value)}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer"
                    >
                      <option value="English">🇺🇸 English</option>
                      <option value="Hindi">🇮🇳 Hindi</option>
                      <option value="German">🇩🇪 German</option>
                      <option value="French">🇫🇷 French</option>
                      <option value="Japanese">🇯🇵 Japanese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Preferred Voice Engine</label>
                    <select 
                      value={transcriptionEngine} 
                      onChange={e => setTranscriptionEngine(e.target.value)}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary/40 transition-colors cursor-pointer"
                    >
                      <option value="AI_ENGINE">GhostHire AI Transcriber (Gemini API)</option>
                      <option value="NATIVE">Native Web Engine (Chromium SpeechRecognition)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Hands-free Auto-Send</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Automatically send questions to AI once transcribed.</p>
                    </div>
                    <button 
                      onClick={() => setAutoSend(!autoSend)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${autoSend ? 'bg-primary' : 'bg-black/25'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoSend ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
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
