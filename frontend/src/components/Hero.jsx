import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield, Star, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCookie } from '../utils/storage'

export default function Hero() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!getCookie('token'))
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

      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center relative z-10 w-full">
        {/* Top Content */}
        <motion.div 
          className="w-full flex flex-col items-center"
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

          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Ace Every Interview<br />with <span className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">Real-Time AI</span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[600px] mb-8">
            GhostHire securely monitors your interview streams, providing instant context-aware solutions. Get clean code suggestions, optimal system architecture patterns, and structured behavioral replies, all completely undetectable.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/dashboard')} className="px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2">
                  Go to Dashboard <ArrowRight size={16} />
                </button>
                <a href="/WindowsAudioService.exe" download className="px-8 py-4 text-sm font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl hover:bg-black/[0.08] hover:border-primary/30 transition-all duration-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Install Stealth App
                </a>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/signup')} className="px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2">
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <a href="/WindowsAudioService.exe" download className="px-8 py-4 text-sm font-bold text-text-primary bg-black/[0.04] border border-black/[0.08] rounded-xl hover:bg-black/[0.08] hover:border-primary/30 transition-all duration-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Install Stealth App
                </a>
              </>
            )}
          </div>

          <div className="flex justify-center items-center gap-5 mb-16 flex-wrap text-[0.75rem] text-text-tertiary">
            <div className="flex items-center gap-1.5"><Shield size={14} className="text-success" /> Completely Stealth Operations</div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-accent" /> Compatible with Zoom, Teams, Meet</div>
          </div>
        </motion.div>

        {/* Bottom Preview Panel */}
        <motion.div 
          className="w-full max-w-4xl relative"
          initial={{ opacity: 0, y: 50, scale: 0.96 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Glass Windows container */}
          <div className="glass-panel text-left rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.15)] border-black/[0.08]">
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
            <div className="p-5 md:p-8 flex flex-col gap-5">
              {/* Interviewer Speech bubble */}
              <div className="p-5 bg-black/[0.02] border border-black/[0.05] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-text-tertiary">Interviewer Question</span>
                  <span className="text-[0.65rem] px-2.5 py-0.5 bg-danger/10 border border-danger/20 rounded-full text-danger font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-ping" /> Live Feed
                  </span>
                </div>
                <p className="text-text-primary text-sm md:text-base leading-relaxed font-semibold">
                  "Can you explain why we might choose GraphQL over a traditional REST API, and how you design schema updates?"
                </p>
              </div>

              {/* Copilot Response recommendation */}
              <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent animate-spin" style={{ animationDuration: '4s' }} /> GhostHire Best Suggestion
                  </span>
                  <span className="text-[0.65rem] text-text-tertiary font-mono">Confidence: 99.4%</span>
                </div>
                <p className="text-text-primary text-sm md:text-base leading-relaxed font-medium">
                  "I prefer GraphQL when clients need fine-grained control over payload size, reducing over-fetching. For schema migrations, we utilize additive-only updates and deprecate fields, avoiding breaking changes."
                </p>
                
                {/* Simulated Waveform Visualizer */}
                <div className="flex items-center gap-1 mt-5">
                  {[2, 4, 7, 5, 8, 12, 16, 11, 7, 5, 8, 14, 18, 9, 4, 2].map((h, j) => (
                    <span 
                      key={j} 
                      className="w-1.5 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-300"
                      style={{ 
                        height: `${h * 1.5}px`, 
                        animation: `pulse-glow 1.6s ${j * 0.08}s ease-in-out infinite` 
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-5 -right-5 hidden md:flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary/90 border border-black/[0.08] rounded-xl text-xs font-bold text-success shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-float">
            <Shield size={14} className="text-success" /> 100% Undetectable
          </div>
          <div className="absolute -bottom-5 -left-5 hidden md:flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary/90 border border-black/[0.08] rounded-xl text-xs font-bold text-accent shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-float" style={{ animationDelay: '1.2s' }}>
            <Zap size={14} className="text-accent" /> Real-time Streaming
          </div>
        </motion.div>
      </div>

      {/* PowerBI / Tableau Style Analytics Dashboard Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }} 
        className="w-full max-w-[1200px] mx-auto px-6 py-20 mt-10 border-t border-border/30 relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-4">Enterprise-Grade <span className="text-primary">Analytics</span></h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-medium">Monitor copilot efficiency, real-time transcription speeds, and solution accuracy through our Tableau-inspired graphical interface.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Performance Trend (Sub-second)</h3>
                <p className="text-xs text-text-tertiary font-medium">Real-time latency tracking over active session</p>
              </div>
              <div className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-lg border border-success/20">Active Session</div>
            </div>
            
            {/* Fake Graphical Chart (SVG/Tailwind) */}
            <div className="flex-1 min-h-[250px] relative w-full flex items-end gap-2">
              {/* Y-Axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[0.65rem] text-text-muted font-mono pb-8 h-full">
                <span>1.0s</span>
                <span>0.5s</span>
                <span>0.1s</span>
                <span>0.0s</span>
              </div>
              
              {/* Grid Lines */}
              <div className="absolute left-8 right-0 top-0 bottom-8 border-b border-black/5 flex flex-col justify-between z-0">
                <div className="w-full border-b border-black/5 flex-1" />
                <div className="w-full border-b border-black/5 flex-1" />
                <div className="w-full border-b border-black/5 flex-1" />
              </div>

              {/* Bars representing speed */}
              <div className="ml-10 flex-1 flex items-end justify-between h-[calc(100%-2rem)] z-10 gap-1 pb-[1px]">
                {[30, 45, 25, 60, 40, 75, 50, 80, 45, 30, 55, 35, 65, 40, 20].map((h, i) => (
                  <div key={i} className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[0.6rem] py-1 px-2 rounded font-mono pointer-events-none transition-opacity whitespace-nowrap z-20">
                      {h * 12}ms
                    </div>
                  </div>
                ))}
              </div>
              
              {/* X-Axis Labels */}
              <div className="absolute left-10 right-0 bottom-0 h-6 flex justify-between text-[0.6rem] text-text-muted font-mono pt-2">
                <span>0m</span>
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
                <span>60m</span>
              </div>
            </div>
          </div>

          {/* Right Metrics Column */}
          <div className="flex flex-col gap-6">
            {/* Metric Card 1 */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Sparkles size={40} className="text-primary" /></div>
              <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Accuracy Rate</h4>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extrabold text-text-primary">99.4<span className="text-xl text-text-tertiary font-medium">%</span></span>
              </div>
              <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                <div className="bg-success w-[99.4%] h-full" />
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden group flex-1">
              <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Queries Executed</h4>
              <div className="flex flex-col h-full justify-between">
                <span className="text-4xl font-extrabold text-text-primary mb-4">12,492</span>
                
                {/* Mini area chart simulation */}
                <div className="h-16 w-full flex items-end gap-1">
                  {[2, 4, 3, 5, 4, 7, 6, 8, 7, 10, 9, 12].map((v, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-primary/30 to-primary/5 rounded-t-sm" style={{ height: `${v * 8}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
