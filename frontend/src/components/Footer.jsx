import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, MessageCircle, Briefcase, Camera, Video } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  return (
    <footer className="border-t border-white/[0.05] bg-bg-secondary/40 relative z-10">
      {/* CTA Banner */}
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="relative p-12 md:p-16 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/5 border border-primary/30 rounded-3xl text-center overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Neon background blurs inside banner */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-80 h-80 bg-primary/15 rounded-full blur-[80px] -top-24 -left-24 animate-aura-1" />
            <div className="absolute w-64 h-64 bg-accent/10 rounded-full blur-[80px] -bottom-20 -right-20 animate-aura-2" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Ready to <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Ace Your Interview?</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto mb-8 font-medium">
              Join 50,000+ candidates who unlocked their full technical potential and landed stellar job offers with GhostHire.
            </p>
            <button 
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signin')}
              className="px-8 py-4 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all duration-300 inline-flex items-center gap-2"
            >
              Start Free Trial Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="#" className="flex items-center gap-2 font-black text-lg mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white"><Sparkles size={16} /></div>
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">GhostHire</span>
            </a>
            <p className="text-[0.72rem] text-text-tertiary leading-relaxed max-w-[200px]">Your AI-powered technical and behavioral interview copilot. Accelerating offers daily.</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['Features', 'Pricing', 'How It Works', 'Reviews'].map(l => (
                <li key={l}>
                  <a 
                    href={`#${l.toLowerCase().replace(/ /g, '-')}`} 
                    className="text-xs text-text-tertiary hover:text-primary-light transition-colors font-semibold"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'GDPR Compliance'].map(l => (
                <li key={l}>
                  <a href="#" className="text-xs text-text-tertiary hover:text-primary-light transition-colors font-semibold">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-4">Connect</h4>
            <div className="flex gap-2.5">
              {[MessageCircle, Briefcase, Camera, Video].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-9 h-9 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-primary-light/40 hover:bg-white/[0.08] transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04] text-[0.7rem] font-medium text-text-muted">
          <p>© 2026 GhostHire. All rights reserved.</p>
          <p className="flex items-center gap-1">Made with <span className="text-primary-light">💜</span> for ambitious candidates worldwide</p>
        </div>
      </div>
    </footer>
  )
}
