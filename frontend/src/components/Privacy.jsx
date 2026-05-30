import { motion } from 'framer-motion'
import { Shield, EyeOff, Lock, Monitor, Wifi, Server } from 'lucide-react'

const privacyFeatures = [
  { icon: <EyeOff size={20} />, title: 'Stealth Screensharing', desc: 'GhostHire operates inside a dedicated rendering overlay invisible to Zoom, Teams, Meet and Discord streams.' },
  { icon: <Lock size={20} />, title: 'End-to-End Encryption', desc: 'All local signals are encrypted. We never record, store, or stream your acoustic dialogue data.' },
  { icon: <Monitor size={20} />, title: 'Proctoring Protection', desc: 'Tested and proven completely undetectable against Examity, ProctorU, and modern browser checkers.' },
  { icon: <Wifi size={20} />, title: 'Zero Network Footprints', desc: 'Transmits data in hyper-optimized, lightweight cryptographic packets mimicking secure system updates.' },
  { icon: <Server size={20} />, title: 'Zero-Save Server Policy', desc: 'Session metrics and answers are automatically scrubbed from memory the second you stop the interview.' },
  { icon: <Shield size={20} />, title: 'Enterprise GDPR/CCPA', desc: 'Rigorous compliance standards keep candidate credentials separate and fully anonymous.' },
]

export default function Privacy() {
  return (
    <section className="py-24 relative overflow-hidden" id="privacy">
      {/* Visual background aura */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] top-1/2 right-10 animate-aura-1" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column (5 of 12) */}
          <motion.div 
            className="lg:col-span-5 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
              🔒 Privacy Assurance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Your Privacy is <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Non-Negotiable</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-8 max-w-[450px] mx-auto lg:mx-0">
              GhostHire is constructed from the first line of code with complete anonymity as a core foundation. We use military-grade local containers to safeguard your interview journey.
            </p>
            
            {/* Visual Glowing Shield Display */}
            <div className="relative w-44 h-44 mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/10 rounded-full blur-[35px] animate-pulse" />
              <div className="relative w-full h-full bg-bg-tertiary/40 border border-black/[0.06] rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <Shield size={56} className="text-primary-light animate-pulse-glow" style={{ color: 'var(--color-primary-light)' }} />
              </div>
            </div>
          </motion.div>

          {/* Right Column (7 of 12) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privacyFeatures.map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-5 bg-bg-tertiary/20 border border-black/[0.04] rounded-2xl hover:border-primary-light/35 hover:bg-bg-tertiary/40 transition-all duration-300 shadow-sm"
              >
                <div className="text-primary-light mb-3 bg-primary/10 w-9 h-9 rounded-lg flex items-center justify-center border border-primary/20">{f.icon}</div>
                <h3 className="text-xs sm:text-sm font-bold mb-1 text-text-primary">{f.title}</h3>
                <p className="text-[0.72rem] text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
