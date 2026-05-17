import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Hero() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  const stats = [
    { icon: <Users size={18} />, value: '50,000+', label: 'Active Users' },
    { icon: <Zap size={18} />, value: '2M+', label: 'Interviews Aced' },
    { icon: <Star size={18} />, value: '4.9/5', label: 'User Rating' },
  ]

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20" id="hero">
      {/* BG Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-primary/12 rounded-full blur-[100px] -top-48 -right-24 animate-float" />
        <div className="absolute w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] -bottom-24 -left-24 animate-float" style={{ animationDirection: 'reverse', animationDuration: '10s' }} />
        <div className="absolute w-[300px] h-[300px] bg-primary/6 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12 pb-8 relative z-10">
        {/* Left Content */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/25 rounded-full text-[0.82rem] font-semibold text-primary-light mb-6">
            <span className="w-2 h-2 bg-success rounded-full shadow-[0_0_8px_#00C853] animate-pulse-glow" />
            <span>AI-Powered Interview Copilot</span>
            <ArrowRight size={14} />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black leading-[1.1] tracking-tight mb-6">
            Ace Every Interview<br />with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Real-Time AI</span>
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed max-w-[520px] mb-8">
            GhostHire listens to your interview questions and instantly generates perfect responses. Get coding support, behavioral answers, and personalized context — all in real-time.
          </p>

          <div className="flex gap-3 flex-wrap mb-6">
            {isLoggedIn ? (
              <button onClick={() => navigate('/dashboard')} className="px-8 py-4 text-base font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-2xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300 flex items-center gap-2" id="hero-cta-primary">
                Go to Dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/signup')} className="px-8 py-4 text-base font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-2xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300 flex items-center gap-2" id="hero-cta-primary">
                  Start Free Trial <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/signup')} className="px-8 py-4 text-base font-semibold text-text-primary bg-black/5 border border-black/10 rounded-2xl hover:bg-black/5 transition-all duration-300 flex items-center gap-2" id="hero-cta-secondary">
                  <Play size={18} /> Start Demo
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary"><Shield size={16} /> No Credit Card Required</div>
            <div className="w-px h-4 bg-black/5" />
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary"><Zap size={16} /> Works with Zoom, Teams, Meet</div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-8 flex-wrap">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-9 h-9 bg-black/5 border border-black/10 rounded-lg flex items-center justify-center text-accent">{stat.icon}</div>
                <div className="flex flex-col">
                  <span className="text-base font-bold">{stat.value}</span>
                  <span className="text-[0.72rem] text-text-tertiary">{stat.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Mockup */}
        <motion.div className="relative" initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <div className="bg-bg-secondary border border-black/10 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(108,92,231,0.2)]">
            {/* Window Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-black/30 border-b border-black/10">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <span className="text-xs text-text-tertiary font-medium">GhostHire — Live Session</span>
            </div>
            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] min-h-[280px]">
              <div className="p-5 flex flex-col gap-3">
                {/* Interviewer */}
                <div className="p-3 bg-black/5 border border-black/10 rounded-xl text-[0.82rem] leading-relaxed">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary block mb-1">Interviewer</span>
                  <p className="text-text-secondary">"Can you explain the difference between REST and GraphQL APIs?"</p>
                </div>
                {/* AI Response */}
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl text-[0.82rem] leading-relaxed">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-primary-light flex items-center gap-1 mb-1"><Zap size={12} /> GhostHire Suggestion</span>
                  <p className="text-text-primary">"REST uses multiple endpoints with fixed data structures, while GraphQL uses a single endpoint where clients specify exactly what data they need..."</p>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(j => <span key={j} className="w-1.5 h-1.5 bg-primary-light rounded-full" style={{ animation: `typing-dot 1.4s ${j * 0.2}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col justify-between p-3 border-l border-black/10 bg-black/15">
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-tertiary block mb-2">📄 Resume Context</span>
                  {['3 yrs Backend Dev', 'Node.js, Python', 'AWS Certified'].map((item, i) => (
                    <div key={i} className="text-[0.72rem] text-text-secondary px-2 py-1 bg-black/5 rounded mb-1">{item}</div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[0.72rem] text-text-tertiary font-mono">
                  <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,68,68,0.5)] animate-pulse" /> Live • 00:12:34
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute top-6 -right-4 hidden lg:flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-black/10 rounded-xl text-xs font-semibold text-success shadow-lg animate-float">
            <Shield size={18} /> Undetectable
          </div>
          <div className="absolute bottom-10 -left-4 hidden lg:flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-black/10 rounded-xl text-xs font-semibold text-accent shadow-lg animate-float" style={{ animationDelay: '1s' }}>
            <Zap size={18} /> Real-time
          </div>
        </motion.div>
      </div>

      {/* Logos */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center pt-12 pb-6 border-t border-black/10 mt-8">
        <p className="text-xs text-text-muted uppercase tracking-[2px] font-medium mb-6">Trusted by candidates interviewing at</p>
        <div className="flex justify-center items-center gap-10 flex-wrap">
          {['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'].map((name) => (
            <span key={name} className="text-base font-bold text-text-muted/50 tracking-wide hover:text-text-muted/80 transition-opacity">{name}</span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
