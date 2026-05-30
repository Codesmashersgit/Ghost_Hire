import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield, Star, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Hero() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])



  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-40 pb-12" id="hero">
      {/* Floating Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -top-40 -right-20 animate-aura-1" />
        <div className="absolute w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] -bottom-40 -left-20 animate-aura-2" />
        <div className="absolute w-[400px] h-[400px] bg-primary-light/10 rounded-full blur-[100px] top-1/3 left-1/4 animate-float" />
        <div className="absolute w-[250px] h-[250px] bg-accent/10 rounded-full blur-[80px] bottom-1/4 right-1/4 animate-aura-1" style={{ animationDelay: '8s' }} />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
        {/* Left Content (Grid Column 7) */}
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          {/* Glowing Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary-light mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
            <span>AI-Powered Interview Copilot v2.0</span>
            <ArrowRight size={12} className="text-primary-light" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black leading-[1.05] tracking-tight mb-6">
            Ace Every Interview<br />with <span className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">Real-Time AI</span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[540px] mb-8">
            GhostHire securely monitors your interview streams, providing instant context-aware solutions. Get clean code suggestions, optimal system architecture patterns, and structured behavioral replies, all completely undetectable.
          </p>

          <div className="flex gap-4 flex-wrap mb-8">
            {isLoggedIn ? (
              <button onClick={() => navigate('/dashboard')} className="px-8 py-4 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/signup')} className="px-8 py-4 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2">
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/signup')} className="px-8 py-4 text-xs font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl hover:bg-black/[0.08] hover:border-primary/30 transition-all duration-300 flex items-center gap-2">
                  <Play size={16} className="text-accent" /> Start Demo
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-5 mb-10 flex-wrap text-[0.72rem] text-text-tertiary">
            <div className="flex items-center gap-1.5"><Shield size={14} className="text-success" /> Completely Stealth Operations</div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
            <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-accent" /> Compatible with Zoom, Teams, Meet</div>
          </div>


        </motion.div>

        {/* Right Preview Panel (Grid Column 5) */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, y: 50, scale: 0.96 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Glass Windows container */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(99,102,241,0.15)] border-black/[0.08]">
            {/* Window Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-black/[0.02] border-b border-black/[0.06]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger/70 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              </div>
              <span className="text-[0.7rem] text-text-tertiary font-bold tracking-wider uppercase ml-1">GHOSTHIRE — LIVE STAGE_FEED</span>
            </div>

            {/* Visualizer Area */}
            <div className="p-5 flex flex-col gap-4">
              {/* Interviewer Speech bubble */}
              <div className="p-4 bg-black/[0.02] border border-black/[0.05] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-tertiary">Interviewer Question</span>
                  <span className="text-[0.62rem] px-2 py-0.5 bg-danger/10 border border-danger/20 rounded-full text-danger font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-ping" /> Live Feed
                  </span>
                </div>
                <p className="text-text-primary text-xs leading-relaxed font-semibold">
                  "Can you explain why we might choose GraphQL over a traditional REST API, and how you design schema updates?"
                </p>
              </div>

              {/* Copilot Response recommendation */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                    <Sparkles size={11} className="text-accent animate-spin" style={{ animationDuration: '4s' }} /> GhostHire Best Suggestion
                  </span>
                  <span className="text-[0.62rem] text-text-tertiary font-mono">Confidence: 99.4%</span>
                </div>
                <p className="text-text-primary text-xs leading-relaxed font-medium">
                  "I prefer GraphQL when clients need fine-grained control over payload size, reducing over-fetching. For schema migrations, we utilize additive-only updates and deprecate fields, avoiding breaking changes."
                </p>
                
                {/* Simulated Waveform Visualizer */}
                <div className="flex items-center gap-1 mt-4">
                  {[2, 4, 7, 5, 8, 12, 16, 11, 7, 5, 8, 14, 18, 9, 4, 2].map((h, j) => (
                    <span 
                      key={j} 
                      className="w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-300"
                      style={{ 
                        height: `${h}px`, 
                        animation: `pulse-glow 1.6s ${j * 0.08}s ease-in-out infinite` 
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-5 -right-5 hidden sm:flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary/90 border border-black/[0.08] rounded-xl text-xs font-bold text-success shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-float">
            <Shield size={14} className="text-success" /> 100% Undetectable
          </div>
          <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary/90 border border-black/[0.08] rounded-xl text-xs font-bold text-accent shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-float" style={{ animationDelay: '1.2s' }}>
            <Zap size={14} className="text-accent" /> Real-time Streaming
          </div>
        </motion.div>
      </div>

      {/* Trusted Logos Bar */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.6 }} 
        className="text-center pt-16 pb-4 border-t border-border/30 mt-16 w-full max-w-[1200px] mx-auto px-6 z-10"
      >
        <p className="text-[0.65rem] text-text-muted uppercase tracking-[3px] font-bold mb-8">Trusted by candidates interviewing at top tech firms</p>
        <div className="flex justify-center items-center gap-8 sm:gap-12 flex-wrap">
          {['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'].map((name) => (
            <span 
              key={name} 
              className="text-sm font-black text-text-muted/40 tracking-wider hover:text-primary-light hover:opacity-100 transition-all duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
