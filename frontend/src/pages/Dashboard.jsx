import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Play, Upload, Settings, LogOut, Clock, Zap, FileText, Globe, Mic, MicOff, Square, MessageSquare, ChevronDown, CreditCard, HelpCircle, Plus, Key, ArrowRight, Sliders, X, Activity, RefreshCw, Shield, Camera } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

const FALLBACK_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "meta-llama-3.1-70b-instruct",
  "Phi-3-medium-128k-instruct"
];

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
  
  // Usage tracking states
  const [isAdmin, setIsAdmin] = useState(false)
  const [usageLimitReached, setUsageLimitReached] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(600)
  const [showPaywall, setShowPaywall] = useState(false)
  const usageIntervalRef = useRef(null)

  // Question prediction and suggestions
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Assessment Solver state
  const [solverImage, setSolverImage] = useState(null)
  const [solverBase64, setSolverBase64] = useState(null)
  const [solverAnswer, setSolverAnswer] = useState('')
  const [isSolving, setIsSolving] = useState(false)

  // Silence-based auto-send refs
  const accumulatedSpeechRef = useRef('')
  const sendTimeoutRef = useRef(null)
  
  const [transcriptionEngine, setTranscriptionEngine] = useState(() => {
    return localStorage.getItem('ghosthire_transcription_engine') || 'AI_ENGINE';
  })
  const [autoSend, setAutoSend] = useState(() => {
    return localStorage.getItem('ghosthire_autosend') === 'true';
  })
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  
  const [githubModel, setGithubModel] = useState(() => {
    return localStorage.getItem('ghosthire_github_model') || 'gpt-4o-mini';
  })
  
  const [earbudsMode, setEarbudsMode] = useState(() => {
    return localStorage.getItem('ghosthire_earbuds') === 'true';
  })

  // Ref so async recording functions always read the latest earbudsMode value
  const earbudsModeRef = useRef(earbudsMode);
  useEffect(() => {
    earbudsModeRef.current = earbudsMode;
    localStorage.setItem('ghosthire_earbuds', earbudsMode);
  }, [earbudsMode])
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatHistoryRef = useRef([])
  const timerIntervalRef = useRef(null)
  const secondsRef = useRef(0)

  // Custom audio transcriber refs
  const socketRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const recordingSessionIdRef = useRef(0)

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
    localStorage.setItem('ghosthire_github_model', githubModel);
  }, [githubModel])

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 200)}px`;
    }
  }, [manualInput])

  const fetchSessions = async (uid) => {
    if (!uid) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions?userId=${uid}`);
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
      const res = await fetch(`${API_BASE_URL}/api/invoices?userId=${uid}`);
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
      const res = await fetch(`${API_BASE_URL}/api/invoices/pay`, {
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

  // Fetch usage status from backend
  const fetchUsageStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/usage/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(data.isAdmin);
        setSecondsRemaining(data.isAdmin ? Infinity : data.secondsRemaining);
        setUsageLimitReached(data.limitReached);
        if (data.limitReached && !data.isAdmin) {
          setShowPaywall(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch usage status', err);
    }
  };

  // Track usage: send seconds to backend
  const trackUsage = async (seconds) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/usage/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ seconds })
      });
      const data = await res.json();
      if (data.success) {
        setSecondsRemaining(data.isAdmin ? Infinity : data.secondsRemaining);
        if (data.limitReached) {
          setUsageLimitReached(true);
          setShowPaywall(true);
          // Force stop the session
          if (isSessionActiveRef.current) {
            stopSession();
          }
        }
      }
    } catch (err) {
      console.error('Failed to track usage', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setIsAdmin(parsed.isAdmin || false);
      fetchSessions(parsed._id);
      fetchInvoices(parsed._id);
      fetchUsageStatus();
    } catch (e) {
      console.error("Failed to parse user data");
      navigate('/signin');
    }
  }, []);

  // Track usage every 30 seconds while session is active
  useEffect(() => {
    if (isSessionActive && !isAdmin) {
      usageIntervalRef.current = setInterval(() => {
        trackUsage(30);
      }, 30000);
      return () => clearInterval(usageIntervalRef.current);
    } else {
      if (usageIntervalRef.current) clearInterval(usageIntervalRef.current);
    }
  }, [isSessionActive, isAdmin]);

  useEffect(() => {
    if (speechNotification) {
      const t = setTimeout(() => {
        setSpeechNotification(null);
      }, 10000); // 10 seconds timeout for transcription review
      return () => clearTimeout(t);
    }
  }, [speechNotification]);

  const transcribeAudio = async (blob) => {
    const activeKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!activeKey) {
      console.warn("Deepgram API Key (VITE_DEEPGRAM_API_KEY) is missing in your .env file.");
      return "";
    }
    
    return new Promise((resolve) => {
      const langMap = {
        'English': 'en',
        'Hindi': 'hi',
        'German': 'de',
        'French': 'fr',
        'Japanese': 'ja'
      };
      const langCode = langMap[selectedLang] || 'en';
      
      const url = `https://api.deepgram.com/v1/listen?model=nova-2&language=${langCode}&smart_format=true`;
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${activeKey}`,
          'Content-Type': blob.type || 'audio/webm'
        },
        body: blob
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        resolve(transcript);
      })
      .catch(err => {
        console.error("Deepgram Transcription failed:", err);
        resolve("");
      });
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
          gradient.addColorStop(0, '#8B5CF6'); // Primary Violet
          gradient.addColorStop(0.5, '#00F5D4'); // Accent Mint
          gradient.addColorStop(1, '#8B5CF6');

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

  // Lock to prevent overlapping transcriptions
  const isProcessingRef = useRef(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const startRecording = async (sessionId) => {
    chunksRef.current = [];
    isProcessingRef.current = false;
    try {
      let stream;

      if (earbudsModeRef.current) {
        // ── EARBUDS MODE ──────────────────────────────────────────────────────
        // Interviewer's voice arrives through earbuds/speakers as system audio.
        // getDisplayMedia with audio:'loopback' (handled in Electron main.js)
        // captures that system audio so Deepgram can transcribe the interviewer.
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: { width: 1, height: 1 } // minimal video required by spec
          });
          // We only need audio — drop the video track immediately
          displayStream.getVideoTracks().forEach(track => track.stop());
          stream = new MediaStream(displayStream.getAudioTracks());
        } catch (displayErr) {
          console.warn('[Earbuds] getDisplayMedia failed, falling back to mic:', displayErr);
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } else {
        // ── NORMAL MODE ───────────────────────────────────────────────────────
        // Capture the user's own microphone (candidate speaking).
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      if (sessionId !== recordingSessionIdRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      
      startVisualizer(stream);

      const langMap = { 'English': 'en', 'Hindi': 'hi', 'German': 'de', 'French': 'fr', 'Japanese': 'ja' };
      const langCode = langMap[selectedLang] || 'en';

      // Connect securely via backend proxy to hide Deepgram API Key
      // Use backend URL from config, not frontend URL
      const backendUrl = new URL(API_BASE_URL);
      const protocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      const socketUrl = `${protocol}//${backendUrl.host}/api/speech/stream?language=${langCode}`;
      
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        const options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported('audio/webm')) options.mimeType = 'audio/ogg';
        
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data && event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            try {
              const arrayBuffer = await event.data.arrayBuffer();
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(arrayBuffer);
              }
            } catch (e) {
              console.error('Error sending audio chunk', e);
            }
          }
        };

        mediaRecorder.start(250); // Stream chunks every 250ms
        setLiveTranscript('🎙️ Listening (Live Streaming)...');
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel?.alternatives?.[0]?.transcript;
        if (transcript && received.is_final) {
          const cleanedText = transcript.trim();
          if (autoSend) {
            accumulatedSpeechRef.current = accumulatedSpeechRef.current
              ? `${accumulatedSpeechRef.current} ${cleanedText}`
              : cleanedText;
            setLiveTranscript(`🎙️ "${accumulatedSpeechRef.current}"`);
            
            if (sendTimeoutRef.current) clearTimeout(sendTimeoutRef.current);
            sendTimeoutRef.current = setTimeout(() => {
              if (accumulatedSpeechRef.current.trim()) {
                handleFinalTranscript(accumulatedSpeechRef.current.trim());
                accumulatedSpeechRef.current = '';
                setLiveTranscript('');
              }
            }, 2000);
          } else {
            setLiveTranscript(cleanedText);
            setManualInput(prev => {
              const joined = prev ? `${prev} ${cleanedText}` : cleanedText;
              setSpeechNotification(joined);
              return joined;
            });
          }
        } else if (transcript) {
          setLiveTranscript(`🎙️ ${transcript}`);
        }
      };

      socket.onclose = () => console.log("Deepgram WebSocket closed.");
      socket.onerror = (error) => console.error("Deepgram WebSocket error:", error);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      if (sessionId === recordingSessionIdRef.current) {
        setMessages(prev => [...prev, { type: 'system', text: `Mic Access Error: ${err.message || err}. Please allow microphone permissions.` }]);
        setIsListening(false);
      }
    }
  };

  const stopRecording = () => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) socketRef.current.close();
      socketRef.current = null;
    }
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
    setLiveTranscript('');
    isProcessingRef.current = false;

    // Clear auto-send timeout
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    accumulatedSpeechRef.current = '';
  };

  useEffect(() => {
    const currentSessionId = ++recordingSessionIdRef.current;
    
    // Clean up any active engines first
    stopRecording();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {}
      recognitionRef.current = null;
    }

    if (!isListening) return;

    // Always use AI_ENGINE (Groq Whisper) as it is the most reliable option in Electron environment.
    // Native Speech Recognition is commented out because Chromium native speech credentials
    // are disabled inside Electron, causing network/credential errors.
    startRecording(currentSessionId);

    /*
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
        if (rec !== recognitionRef.current) return;
        
        let finalPart = '';
        let interimPart = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalPart += event.results[i][0].transcript;
          } else {
            interimPart += event.results[i][0].transcript;
          }
        }

        const fullText = (finalPart + interimPart).trim();
        
        if (rec !== recognitionRef.current) return;
        
        if (fullText) {
          setManualInput(fullText);
          setSpeechNotification(fullText);
        }

        // If a final result segment is completed and autoSend is enabled, submit it
        if (event.results[event.results.length - 1].isFinal && autoSend && finalPart.trim()) {
          const trimmed = finalPart.trim();
          handleFinalTranscript(trimmed);
          setManualInput('');
          setSpeechNotification(null);
          try {
            rec.stop(); // Stops recognition, triggers onend which auto-restarts for a clean next sentence
          } catch(e) {}
        }
      };

      rec.onerror = (event) => {
        if (rec !== recognitionRef.current) return;
        
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setMessages(prev => [...prev, { type: 'system', text: 'Error: Microphone permission denied. Please allow microphone access.' }]);
          setIsListening(false);
        } else if (event.error === 'network') {
          setMessages(prev => [...prev, { 
            type: 'system', 
            text: 'Speech recognition experienced a network issue. Please check your internet connection.' 
          }]);
        }
      };

      rec.onend = () => {
        if (rec !== recognitionRef.current) return;
        
        if (isSessionActiveRef.current && isListeningRef.current) {
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
    */

    return () => {
      stopRecording();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
        recognitionRef.current = null;
      }
    };
  }, [isListening, transcriptionEngine, selectedLang, earbudsMode]);

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



  const generateSuggestions = async (questionText) => {
    const jwtToken = localStorage.getItem('token');
    if (!jwtToken) {
      console.error('Missing auth token for suggestions');
      return;
    }
    const suggRes = await fetch(`${API_BASE_URL}/api/ai/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        question: questionText,
        model: githubModel
      })
    });
    if (!suggRes.ok) {
      const err = await suggRes.json().catch(() => ({}));
      console.error('Suggestions request failed:', err.message || `HTTP ${suggRes.status}`);
      return;
    }
    const suggData = await suggRes.json();
    if (Array.isArray(suggData.suggestions)) {
      setSuggestions(suggData.suggestions);
    }
  };

  const handleFinalTranscript = async (text) => {
    // Clear old suggestions and generate new ones
    setSuggestions([]);
    generateSuggestions(text);

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

    const jwtToken = localStorage.getItem('token');
    if (!jwtToken) {
      setMessages(prev => prev.map(msg => msg.id === aiMessageId
        ? { ...msg, text: 'Error: Not authenticated. Please sign in again.', isStreaming: false }
        : msg
      ));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          question: text,
          context: extraContext,
          language: selectedLang,
          chatHistory: chatHistoryRef.current,
          model: githubModel
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('data: ')) {
            const dataStr = cleanLine.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices?.[0]?.delta?.content || '';
              accumulatedText += content;
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
              ));
            } catch (_) { /* skip malformed JSON chunks */ }
          }
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, text: accumulatedText, isStreaming: false } : msg
      ));

      chatHistoryRef.current.push({ role: 'user', content: text });
      chatHistoryRef.current.push({ role: 'assistant', content: accumulatedText });
    } catch (e) {
      console.error('AI chat request failed:', e);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== aiMessageId);
        return [...filtered, { type: 'system', text: `Error: AI request failed. (${e.message || e})` }];
      });
    }
  };

  const startSession = () => {
    // Check usage limit for non-admin users
    if (!isAdmin && usageLimitReached) {
      setShowPaywall(true);
      return;
    }

    chatHistoryRef.current = [];
    setIsSessionActive(true);
    setMessages([]);
    setIsListening(false);
  };

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
          
          await fetch(`${API_BASE_URL}/api/sessions/save`, {
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

  const handleScreenCapture = async () => {
    setIsSolving(true);
    try {
      const token = localStorage.getItem('token');
      // Hit the silent backend capture API instead of browser screen share
      const captureRes = await fetch(`${API_BASE_URL}/api/ai/capture-screen`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const captureData = await captureRes.json();

      if (!captureData.success || !captureData.imageBase64) {
        alert("Silent screen capture failed: " + (captureData.message || 'Unknown error'));
        setIsSolving(false);
        return;
      }

      let dataURL = captureData.imageBase64;

      if (dataURL) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/ai/solve-screenshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageBase64: dataURL })
        });
        const data = await res.json();
        if (data.success) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            text: "🔍 **Screen Analyzed:**\n\n" + data.answer,
            isStreaming: false,
            time
          }]);
        } else {
          alert("Failed to solve screen: " + (data.message || 'Error'));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Screen capture failed.");
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-transparent flex relative text-text-primary">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        <div className="absolute inset-0 cyber-grid" />
      </div>

      {/* Sidebar Command Panel */}
      <aside className="w-64 bg-bg-secondary/40 backdrop-blur-xl border-r border-black/[0.05] flex flex-col shrink-0 hidden lg:flex relative z-10">
        {/* Brand/Logo Header */}
        <div className="p-5 border-b border-black/[0.05] bg-black/[0.01]">
          <a href="/" className="flex items-center gap-2.5 font-black text-lg group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-all"><Sparkles size={16} /></div>
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent font-extrabold tracking-wide">GhostHire</span>
          </a>
        </div>

        {/* Tab Command List */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { icon: <Play size={16} />, label: 'New Session' },
            { icon: <Upload size={16} />, label: 'Assessment Solver' },
            { icon: <Clock size={16} />, label: 'Session History' },
            { icon: <FileText size={16} />, label: 'My Documents' },
            { icon: <CreditCard size={16} />, label: 'Credits & Billing' },
            { icon: <Settings size={16} />, label: 'Settings' },
            { icon: <HelpCircle size={16} />, label: 'Help & Support' },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === item.label 
                  ? 'bg-primary/20 text-primary-light border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.12)]' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03] border border-transparent'
              }`}
            >
              <span className={activeTab === item.label ? 'text-accent' : 'text-text-tertiary'}>{item.icon}</span> 
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Dynamic Credits Dashboard */}
        <div className="p-4">
          <div className="p-4 bg-bg-tertiary/40 border border-black/[0.06] rounded-2xl shadow-inner backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.62rem] font-bold uppercase tracking-[1.5px] text-text-tertiary">Copilot Credits</span>
              <span className="text-[0.62rem] text-primary-light font-mono font-bold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">∞ Free Beta</span>
            </div>
            <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden mb-3 border border-black/[0.02]">
              <div className="h-full w-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            </div>
            <button onClick={handleSimulatePayment} className="w-full py-2.5 text-[0.68rem] font-black text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all">
              Upgrade Candidate Plan
            </button>
          </div>
        </div>

        {/* Administrative Shortcut */}
        {isAdmin && (
          <div className="p-4 pt-0">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[0.68rem] font-black text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <Shield size={13} className="text-purple-400" /> Admin Command Center
            </button>
          </div>
        )}

        {/* User Account Capsule */}
        <div className="p-4 border-t border-black/[0.05] bg-black/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-xs font-black shadow-[0_0_12px_rgba(99,102,241,0.25)] relative">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-secondary shadow-[0_0_8px_#10B981]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{user?.name || 'Candidate User'}</p>
              <p className="text-[0.62rem] text-text-tertiary font-medium truncate mt-0.5">{user?.email || 'Standalone Mode'}</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/');
              }} 
              className="text-text-tertiary hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all"
              title="Logout Session"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-bg-primary/45 backdrop-blur-md">
        {activeTab === 'New Session' && (
          <>
            {/* Header Stage Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-bg-secondary/50 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <h1 className="text-sm font-bold text-text-primary">
                  {isSessionActive ? (
                    <span className="flex items-center gap-2 bg-danger/10 border border-danger/20 px-3 py-1 rounded-full text-xs font-black text-danger-light">
                      <span className="w-2 h-2 bg-danger rounded-full animate-ping" />
                      STEALTH SESSION IN PROGRESS
                    </span>
                  ) : 'COPILOT WORKSPACE'}
                </h1>
              </div>
            </header>

            {/* Stage Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Audio/Text Live Stream Area */}
              <div className="flex-1 flex flex-col bg-transparent">
                {!isSessionActive ? (
                  /* Inactive workspace start prompt */
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-sm p-8 glass-panel rounded-3xl shadow-2xl">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/25 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)] animate-pulse">
                        <Mic size={32} className="text-primary-light" />
                      </div>
                      <h2 className="text-lg font-black mb-2 text-text-primary">Start Live Copilot</h2>
                      <p className="text-xs text-text-secondary leading-relaxed mb-8 px-2 font-medium">
                        GhostHire will listen and transcribe audio feeds locally, generating sub-second suggestions, algorithms, and behavioral STAR outlines.
                      </p>
                      <button 
                        onClick={startSession}
                        className="px-8 py-3.5 text-sm font-black text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2 mx-auto"
                      >
                        <Play size={14} /> INITIALIZE SESSION
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active Stealth Stream Feed */
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
                      {speechNotification && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-300 animate-fadeIn">
                          <div className="flex items-center gap-3 px-5 py-3 bg-[#0B0C16]/95 border border-primary/30 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl text-text-primary text-xs font-semibold relative overflow-hidden">
                            {/* Decorative banner bar */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                            
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light animate-pulse shrink-0">
                              <Mic size={12} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-black uppercase tracking-wider text-[0.62rem] text-primary-light">Real-Time Acoustic Signal</p>
                              <p className="truncate text-text-secondary mt-0.5 font-medium">"{speechNotification}"</p>
                            </div>
                            
                            <div className="flex gap-1.5 shrink-0">
                              <button 
                                onClick={() => {
                                  setManualInput('');
                                  setSpeechNotification(null);
                                }} 
                                className="px-2.5 py-1 bg-black/5 hover:bg-black/10 text-text-secondary font-bold rounded-lg transition-all text-[0.62rem] border border-black/[0.04]"
                              >
                                Clear
                              </button>
                              <button 
                                onClick={handleSendManualMessage} 
                                className="px-3 py-1 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-md transition-all text-[0.62rem] border border-black/10"
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
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-[0.68rem] text-primary-light font-bold">
                              <Zap size={11} className="text-accent" /> {msg.text}
                            </div>
                          ) : msg.type === 'interviewer' ? (
                            <div className="p-4 bg-black/[0.02] border border-black/[0.05] rounded-2xl shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1">🎙️ Interviewer Signal</span>
                                <span className="text-[0.6rem] text-text-muted font-mono">{msg.time}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-text-secondary font-medium">{msg.text}</p>
                            </div>
                          ) : (
                            <div className="p-4 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/5 border border-primary/35 rounded-2xl ml-8 relative group shadow-[0_0_20px_rgba(99,102,241,0.06)]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                                  <Zap size={12} className={msg.isStreaming ? 'animate-bounce text-accent' : 'text-accent'} /> 
                                  GhostHire Suggestion
                                </span>
                                <span className="text-[0.6rem] text-text-muted font-mono ml-auto">{msg.time}</span>
                              </div>
                              {msg.text ? (
                                <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-medium">
                                  {msg.text}
                                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary-light animate-pulse align-middle" />}
                                </p>
                              ) : (
                                <div className="flex items-center gap-2 text-[0.68rem] text-text-tertiary">
                                  <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                  <span>AI Copilot is generating response...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Copilot Suggestions Board */}
                    {suggestions.length > 0 && (
                      <div className="px-5 py-3 border-t border-black/[0.04] bg-bg-secondary/40">
                        <div className="max-w-3xl mx-auto flex flex-col gap-2">
                          <p className="text-[0.58rem] font-bold uppercase tracking-[1.5px] text-text-tertiary">Predictive Follow-ups & Sub-topics</p>
                          <div className="flex flex-wrap gap-2 animate-fadeIn">
                            {suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  handleFinalTranscript(suggestion);
                                  setSuggestions([]);
                                }}
                                className="px-3.5 py-1.5 text-xs text-primary-light bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary-light/40 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Waveform Indicator */}
                    {isListening && (
                      <div className="px-5 py-2 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-md">
                        <div className="flex items-center justify-between max-w-3xl mx-auto gap-4">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                            <p className="text-[0.68rem] font-bold text-text-secondary italic truncate">
                              {liveTranscript || '🎙️ Listening to acoustic speaker loop...'}
                            </p>
                          </div>
                          <canvas 
                            ref={canvasRef} 
                            width="100" 
                            height="20" 
                            className="h-5 w-[100px] opacity-75 shrink-0" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Input Control Deck */}
                    <div className="p-4 border-t border-black/[0.05] bg-bg-secondary/50 backdrop-blur-xl">
                      <div className="flex items-end gap-3 max-w-3xl mx-auto">
                        {/* Screen Capture button */}
                        <button 
                          onClick={handleScreenCapture}
                          disabled={isSolving}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 relative group mb-[1px] ${
                            isSolving 
                              ? 'bg-text-tertiary cursor-not-allowed text-white' 
                              : 'bg-black/[0.03] border-black/[0.06] text-text-secondary hover:bg-black/[0.06] hover:border-black/[0.1] hover:text-primary-light'
                          }`}
                          title="Capture Screen & Solve"
                        >
                          {isSolving ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Camera size={18} />}
                        </button>
                        
                        {/* Audio listening switch */}
                        <button 
                          onClick={toggleListening} 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 relative group mb-[1px] ${
                            isListening 
                              ? 'bg-gradient-to-tr from-primary to-accent border-primary/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                              : 'bg-black/[0.03] border-black/[0.06] text-text-secondary hover:bg-black/[0.06] hover:border-black/[0.1]'
                          }`}
                          title={isListening ? "Mute Acoustic Mic" : "Start Acoustic Capture"}
                        >
                          {isListening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                          <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-secondary transition-all ${
                            isListening ? 'bg-success' : 'bg-text-muted'
                          }`} />
                        </button>
                        
                        {/* Text command input */}
                        <div className="flex-1 flex items-end gap-2">
                          <textarea 
                            ref={textareaRef}
                            rows={1}
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => { 
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendManualMessage(); 
                              }
                            }}
                            placeholder={isListening ? "Listening speakers... or type manual question..." : "Type manual question..."}
                            className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-4 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-primary-light/40 outline-none transition-all resize-none overflow-y-auto max-h-[200px] no-scrollbar"
                            style={{ minHeight: '44px', height: '44px' }}
                          />
                          <button 
                            onClick={handleSendManualMessage} 
                            className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_4px_25px_rgba(99,102,241,0.25)] transition-all flex items-center gap-1.5 shrink-0 h-[44px]"
                          >
                            Send <ArrowRight size={13} />
                          </button>
                        </div>

                        {/* Stop stream */}
                        <button 
                          onClick={stopSession}
                          className="px-4 py-3 text-sm font-bold text-danger bg-danger/10 border border-danger/20 rounded-xl hover:bg-danger/20 transition-all flex items-center gap-1.5 shrink-0 h-[44px]"
                        >
                          <Square size={12} /> End
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Assessment Solver' && (
          <div className="flex-1 p-8 overflow-y-auto bg-transparent relative">
            <h2 className="text-xl font-black mb-1 text-text-primary">Online Assessment Solver</h2>
            <p className="text-xs text-text-secondary mb-6 font-semibold">Upload or paste a screenshot (Ctrl+V) of your online assessment to get instant solutions.</p>
            
            <div className="max-w-4xl space-y-6">
              {/* Upload Area */}
              <div 
                className="w-full border-2 border-dashed border-black/[0.1] rounded-2xl p-10 flex flex-col items-center justify-center bg-bg-tertiary/20 hover:bg-bg-tertiary/30 transition-all cursor-pointer relative"
                onPaste={(e) => {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                      const blob = items[i].getAsFile();
                      setSolverImage(URL.createObjectURL(blob));
                      const reader = new FileReader();
                      reader.onload = () => setSolverBase64(reader.result);
                      reader.readAsDataURL(blob);
                      break;
                    }
                  }
                }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSolverImage(URL.createObjectURL(file));
                      const reader = new FileReader();
                      reader.onload = () => setSolverBase64(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                
                {solverImage ? (
                  <div className="relative z-20 pointer-events-none">
                    <img src={solverImage} alt="Assessment" className="max-h-64 object-contain rounded-lg shadow-md mx-auto" />
                    <div className="mt-4 text-center">
                      <span className="text-xs font-bold text-text-primary bg-bg-secondary px-3 py-1.5 rounded-full shadow-sm border border-black/[0.05]">Click to change image or paste again</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center z-20 pointer-events-none">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-light shadow-inner">
                      <Upload size={28} />
                    </div>
                    <h3 className="text-sm font-black text-text-primary mb-2">Click or Drag Image Here</h3>
                    <p className="text-[0.72rem] text-text-secondary font-medium">You can also just press <kbd className="bg-black/5 px-1.5 py-0.5 rounded border border-black/10 text-text-primary font-mono text-[0.65rem] mx-1">Ctrl + V</kbd> to paste a screenshot directly</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {solverImage && (
                <div className="flex justify-center">
                  <button 
                    disabled={isSolving}
                    onClick={async () => {
                      if (!solverBase64) return;
                      setIsSolving(true);
                      setSolverAnswer('');
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_BASE_URL}/api/ai/solve-screenshot`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ imageBase64: solverBase64 })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setSolverAnswer(data.answer);
                        } else {
                          setSolverAnswer('Error: ' + (data.message || 'Failed to solve assessment.'));
                        }
                      } catch (err) {
                        setSolverAnswer('Error: ' + err.message);
                      } finally {
                        setIsSolving(false);
                      }
                    }}
                    className={`px-8 py-3 text-sm font-black text-white rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all flex items-center gap-2 ${isSolving ? 'bg-text-tertiary cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]'}`}
                  >
                    {isSolving ? (
                      <>Solving Image...</>
                    ) : (
                      <><Zap size={16} /> Solve Question</>
                    )}
                  </button>
                </div>
              )}

              {/* Result Area */}
              {solverAnswer && (
                <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/30 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.1)] relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                      <Zap size={14} className="text-accent" /> GhostHire Verified Solution
                    </span>
                  </div>
                  <div className="text-sm text-text-primary whitespace-pre-wrap font-medium">
                    {solverAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Session History' && (
          <div className="flex-1 p-8 overflow-y-auto bg-transparent">
            <h2 className="text-xl font-black mb-1 text-text-primary">Session History</h2>
            <p className="text-xs text-text-secondary mb-6 font-semibold">Review your past interview solutions and AI suggestions.</p>
            
            {loadingSessions ? (
              <p className="text-xs text-text-tertiary">Retrieving history logs...</p>
            ) : sessionsList.length === 0 ? (
              <div className="p-8 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl text-center max-w-xl">
                <p className="text-xs text-text-tertiary font-semibold">No past sessions found. Completed sessions are saved automatically.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {sessionsList.map((session, i) => (
                  <div key={i} className="p-5 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl flex items-center justify-between hover:border-primary-light/35 hover:bg-bg-tertiary/40 transition-all">
                    <div>
                      <span className="text-[0.62rem] text-primary-light font-black uppercase tracking-[1px] bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-text-primary mt-2">{session.title}</h3>
                      <div className="flex gap-4 mt-2 text-[0.65rem] text-text-tertiary font-semibold">
                        <span>Duration: {session.duration}</span>
                        <span>•</span>
                        <span>QA Items: {session.transcript?.length || 0} transcript logs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-success/10 border border-success/20 text-success text-[0.62rem] font-bold rounded-full">Saved</span>
                      <button 
                        onClick={() => alert(JSON.stringify(session.transcript, null, 2))} 
                        className="px-4 py-2 bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] rounded-xl text-xs font-bold text-text-primary transition-all"
                      >
                        Show Logs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'My Documents' && (
          <div className="flex-1 p-8 overflow-y-auto bg-transparent">
            <h2 className="text-xl font-black mb-1 text-text-primary">User Guide & Stealth Support</h2>
            <p className="text-xs text-text-secondary mb-8 font-semibold">Learn how to maximize your GhostHire copilot for interview dominance.</p>
            
            <div className="max-w-4xl space-y-6">
              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl shadow-sm">
                <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-black/[0.04] pb-2">
                  <Play size={14} className="text-accent" /> 🚀 Instant Launch Checklist
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-xs shrink-0">1</div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">Choose AI Brain Model</h4>
                      <p className="text-[0.72rem] text-text-secondary mt-0.5">Select your preferred model (e.g. GPT-4o, Llama 3.1) in Settings to match technical depth.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-xs shrink-0">2</div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">Enable Microphone Hook</h4>
                      <p className="text-[0.72rem] text-text-secondary mt-0.5">Initialize a session and toggle acoustic processing. GhostHire captures incoming speaker streams locally.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light font-bold text-xs shrink-0">3</div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">Read Streaming Output</h4>
                      <p className="text-[0.72rem] text-text-secondary mt-0.5">AI structures solutions into clear paragraphs and visual code blocks. Use manual input to patch gaps.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl">
                <h3 className="text-sm font-black text-text-primary mb-3 uppercase tracking-wider border-b border-black/[0.04] pb-2">🔒 Stealth Screen Shielding</h3>
                <p className="text-[0.72rem] text-text-secondary leading-relaxed font-semibold">
                  GhostHire operates at deep desktop levels using hardware window flags. When sharing desktops via Zoom, Teams, Meet or specialized hiring code checkers, they only capture a completely transparent, dark or empty canvas. Your copilot operates in absolute privacy.
                </p>
              </div>

              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl">
                <h3 className="text-sm font-black text-text-primary mb-3 uppercase tracking-wider border-b border-black/[0.04] pb-2">💡 Tips for 100% Accuracy</h3>
                <ul className="space-y-2 text-[0.72rem] text-text-secondary list-none">
                  <li className="flex items-center gap-2"><span className="text-accent font-bold">▪</span> <strong>Ideal Room:</strong> Work in minimal reverb to help neural phonetic decoders.</li>
                  <li className="flex items-center gap-2"><span className="text-accent font-bold">▪</span> <strong>System Driver:</strong> Use default system audio outputs. Headphones operate fully.</li>
                  <li className="flex items-center gap-2"><span className="text-accent font-bold">▪</span> <strong>Context Injection:</strong> Paste job values, descriptions, or company rubrics inside Settings.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Credits & Billing' && (
          <div className="flex-1 p-8 overflow-y-auto bg-transparent">
            <h2 className="text-xl font-black mb-1 text-text-primary">Credits & Invoices</h2>
            <p className="text-xs text-text-secondary mb-6 font-semibold">Track plan states, billings, and credit usages.</p>
            
            <div className="max-w-4xl space-y-8">
              <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/25 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-primary-light bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">Candidate Plan</span>
                  <h3 className="text-xl font-black text-text-primary mt-2">Unlimited Beta Trial</h3>
                  <p className="text-xs text-text-secondary mt-1 font-semibold">Uncapped credit access during our public framework launch.</p>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="text-2xl font-black text-text-primary">∞ <span className="text-xs font-medium text-text-tertiary">Credits active</span></div>
                  <button onClick={handleSimulatePayment} className="mt-3 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-[0_4px_25px_rgba(99,102,241,0.25)] transition-all">Upgrade Pro</button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary mb-4">Invoice Logs</h3>
                {loadingInvoices ? (
                  <p className="text-xs text-text-tertiary">Loading invoice records...</p>
                ) : invoicesList.length === 0 ? (
                  <div className="p-8 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl text-center max-w-2xl">
                    <p className="text-xs text-text-secondary font-semibold">No transactions active. Invoices reflect payment completions.</p>
                    <button onClick={handleSimulatePayment} className="mt-4 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl">
                      Unlock Full Pro Access (₹1,499)
                    </button>
                  </div>
                ) : (
                  <div className="bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
                    {invoicesList.map((inv, i) => (
                      <div key={i} className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-black/[0.01] transition-colors">
                        <div>
                          <span className="font-bold text-text-primary">{inv.invoiceId}</span>
                          <span className="text-[0.68rem] text-text-tertiary font-semibold ml-4">
                            {new Date(inv.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-text-primary">{inv.amount}</span>
                          <span className="px-2 py-0.5 bg-success/15 border border-success/20 text-success text-[0.62rem] font-bold rounded-md uppercase">Paid</span>
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
          <div className="flex-1 p-8 overflow-y-auto bg-transparent">
            <h2 className="text-xl font-black mb-1 text-text-primary">System Settings</h2>
            <p className="text-xs text-text-secondary mb-6 font-semibold">Configure AI agents, model routing, and inputs.</p>
            
            <div className="max-w-3xl space-y-6">
              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-black/[0.04] pb-2 uppercase tracking-wider">Stealth Shields</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">Dynamic Anti-Capture</h4>
                    <p className="text-[0.72rem] text-text-secondary mt-0.5 leading-relaxed max-w-md">Forces deep hardware window masks, blackening screenshare viewports (Zoom, OBS, Teams).</p>
                  </div>
                  <span className="px-3 py-1 bg-success/10 border border-success/20 text-success text-[0.62rem] font-bold rounded-full uppercase tracking-wider shadow-inner">ACTIVE</span>
                </div>
              </div>

              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-black/[0.04] pb-2 uppercase tracking-wider">Model Selection</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[1.5px] mb-2">Primary AI Intelligence</label>
                    <select 
                      value={githubModel} 
                      onChange={e => setGithubModel(e.target.value)}
                      className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-4 py-3 text-xs sm:text-sm text-text-primary focus:border-primary-light/50 transition-colors cursor-pointer outline-none font-bold"
                    >
                      <option value="gpt-4o-mini" className="bg-bg-tertiary text-text-primary">GPT-4o-mini (Uncapped • Sub-second Latency)</option>
                      <option value="gpt-4o" className="bg-bg-tertiary text-text-primary">GPT-4o (High-level Algorithms & Logic)</option>
                      <option value="meta-llama-3.1-70b-instruct" className="bg-bg-tertiary text-text-primary">Llama 3.1 70B (Complex Explanations)</option>
                      <option value="Phi-3-medium-128k-instruct" className="bg-bg-tertiary text-text-primary">Phi-3 Medium (Lightweight Summary)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-black/[0.04] pb-2 uppercase tracking-wider">Audio & Languages</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.62rem] font-bold text-text-tertiary uppercase tracking-[1.5px] mb-2">Target Speech/Transcript Language</label>
                    <select 
                      value={selectedLang} 
                      onChange={e => setSelectedLang(e.target.value)}
                      className="w-full bg-black/[0.03] border border-black/[0.06] rounded-xl px-4 py-3 text-xs sm:text-sm text-text-primary focus:border-primary-light/50 transition-colors cursor-pointer outline-none font-bold"
                    >
                      <option value="English" className="bg-bg-tertiary text-text-primary">🇺🇸 English</option>
                      <option value="Hindi" className="bg-bg-tertiary text-text-primary">🇮🇳 Hindi</option>
                      <option value="German" className="bg-bg-tertiary text-text-primary">🇩🇪 German</option>
                      <option value="French" className="bg-bg-tertiary text-text-primary">🇫🇷 French</option>
                      <option value="Japanese" className="bg-bg-tertiary text-text-primary">🇯🇵 Japanese</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.03]">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">Earbuds Mode (System Audio)</h4>
                      <p className="text-[0.72rem] text-text-secondary mt-0.5">Silently capture system audio for earbuds. (Requires Desktop App)</p>
                    </div>
                    <button 
                      onClick={() => setEarbudsMode(!earbudsMode)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${earbudsMode ? 'bg-primary-light' : 'bg-black/[0.08]'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${earbudsMode ? 'translate-x-4 shadow-sm' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.03]">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">Acoustic Auto-Submit</h4>
                      <p className="text-[0.72rem] text-text-secondary mt-0.5">Stream transcripts directly to AI on speech pauses.</p>
                    </div>
                    <button 
                      onClick={() => setAutoSend(!autoSend)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${autoSend ? 'bg-primary-light' : 'bg-black/[0.08]'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoSend ? 'translate-x-4 shadow-sm' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Help & Support' && (
          <div className="flex-1 p-8 overflow-y-auto bg-transparent">
            <h2 className="text-xl font-black mb-1 text-text-primary">Candidate Support</h2>
            <p className="text-xs text-text-secondary mb-6 font-semibold">Help manuals, specifications, and connections.</p>
            
            <div className="max-w-4xl space-y-6">
              <div className="p-6 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-black/[0.04] pb-2">Common Troubleshoot</h3>
                <div className="space-y-4 divide-y divide-white/[0.04]">
                  {[
                    { q: 'Is it completely undetectable during screen sharing?', a: 'Yes! Using our system level mainWindow.setContentProtection(true) setting, screen share softwares (Zoom, OBS, Teams) will only see a black window instead of GhostHire, maintaining your full stealth mode.' },
                    { q: 'How does voice recognition work?', a: 'GhostHire utilizes the web speech API to transcribe the interviewer\'s audio in real-time. Make sure to keep your microphone unmuted or speak in a quiet room for high accuracy.' }
                  ].map((faq, i) => (
                    <div key={i} className={`pt-4 ${i === 0 ? 'pt-0' : ''}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">{faq.q}</h4>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-semibold">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== Paywall Premium Glass Modal ===== */}
      {showPaywall && !isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="bg-[#0C0E1F] border border-black/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-center relative max-w-md w-full mx-4 rounded-3xl p-8 animate-float">
            {/* Pulsing neon icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Zap size={28} className="text-white" />
            </div>
            
            <h2 className="text-xl font-black text-text-primary mb-2">Free Allocation Complete</h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-6 font-semibold px-4">
              You have completed your **10 minutes** of free speech transcription for today. Upgrade to **Pro Candidate** for uncapped runtime, priority models, and system contextualization.
            </p>

            {/* Premium specs list */}
            <div className="bg-black/[0.02] border border-black/[0.05] rounded-2xl p-5 mb-6 text-left shadow-inner">
              <div className="flex items-center justify-between mb-3 border-b border-black/[0.03] pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-accent">Pro Plan Feature Pack</span>
                <span className="text-xl font-black text-text-primary">₹1,499<span className="text-xs font-normal text-text-tertiary">/mo</span></span>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary font-semibold">
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> Infinite session lengths and streams</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> Low-latency access to GPT-4o & Claude</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> Drag-and-drop resume context syncer</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> 50+ local speech language processing</li>
              </ul>
            </div>

            <button
              onClick={() => {
                handleSimulatePayment();
                setShowPaywall(false);
                setUsageLimitReached(false);
              }}
              className="w-full py-3.5 rounded-xl font-black text-white text-xs bg-gradient-to-r from-primary to-accent hover:shadow-[0_4px_25px_rgba(99,102,241,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              UPGRADE PRO — ₹1,499/mo
            </button>
            
            <button
              onClick={() => setShowPaywall(false)}
              className="mt-4 text-xs font-bold text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Stay on limited tier
            </button>

            <p className="mt-4 text-[0.62rem] text-text-muted font-semibold tracking-wide">
              ⏳ Daily trial limits renew in 24 hours
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
