import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, MessageCircle, Briefcase, Camera, Video } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-black/10">
      {/* CTA Banner */}
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="relative p-12 md:p-16 bg-gradient-to-br from-primary/15 to-accent/8 border border-primary/20 rounded-3xl text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-[80px] -top-20 -left-20" />
            <div className="absolute w-56 h-56 bg-accent/8 rounded-full blur-[80px] -bottom-10 -right-10" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ace Your Interview?</span>
            </h2>
            <p className="text-base text-text-secondary max-w-md mx-auto mb-8">Join 50,000+ candidates who landed their dream jobs with GhostHire.</p>
            <button onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-base font-semibold text-text-primary bg-gradient-to-r from-primary to-accent rounded-2xl shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,92,231,0.4)] transition-all duration-300 inline-flex items-center gap-2">
              Start Free Trial <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="#" className="flex items-center gap-2 font-extrabold text-lg mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white"><Sparkles size={16} /></div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GhostHire</span>
            </a>
            <p className="text-xs text-text-tertiary leading-relaxed">Your AI-powered interview copilot. Ace every interview with confidence.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'How It Works', 'Reviews'].map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="text-xs text-text-tertiary hover:text-text-primary transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'GDPR'].map(l => <li key={l}><a href="#" className="text-xs text-text-tertiary hover:text-text-primary transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4">Connect</h4>
            <div className="flex gap-3">
              {[MessageCircle, Briefcase, Camera, Video].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-black/5 border border-black/10 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-primary/40 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-black/10">
          <p className="text-xs text-text-muted">© 2026 GhostHire. All rights reserved.</p>
          <p className="text-xs text-text-muted">Made with 💜 for job seekers worldwide</p>
        </div>
      </div>
    </footer>
  )
}
