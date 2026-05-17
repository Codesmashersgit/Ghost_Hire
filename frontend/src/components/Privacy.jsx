import { motion } from 'framer-motion'
import { Shield, EyeOff, Lock, Monitor, Wifi, Server } from 'lucide-react'

const privacyFeatures = [
  { icon: <EyeOff size={24} />, title: 'Invisible to Screen Share', desc: 'GhostHire stays completely hidden during Zoom, Teams, and Meet screen sharing sessions.' },
  { icon: <Lock size={24} />, title: 'End-to-End Encrypted', desc: 'All audio and data is encrypted in transit and at rest. We never store your interview recordings.' },
  { icon: <Monitor size={24} />, title: 'Proctoring Safe', desc: 'Undetectable by proctoring software like ProctorU, Examity, and HonorLock.' },
  { icon: <Wifi size={24} />, title: 'No Network Traces', desc: 'Operates with minimal network footprint. No suspicious traffic patterns.' },
  { icon: <Server size={24} />, title: 'Zero Data Retention', desc: 'Session data is automatically deleted after your call ends. Nothing is stored on our servers.' },
  { icon: <Shield size={24} />, title: 'GDPR Compliant', desc: 'Fully compliant with GDPR, CCPA, and international data protection regulations.' },
]

export default function Privacy() {
  return (
    <section className="py-24 bg-bg-secondary" id="privacy">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">🔒 Privacy & Security</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Your Privacy is <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Non-Negotiable</span>
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-8">
              GhostHire is built from the ground up with privacy and stealth in mind. We use military-grade encryption and leave zero traces on your system.
            </p>
            {/* Visual Shield */}
            <div className="relative w-48 h-48 mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-[40px] animate-pulse" />
              <div className="relative w-full h-full bg-bg-tertiary/60 border border-black/10 rounded-full flex items-center justify-center">
                <Shield size={64} className="text-primary" />
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privacyFeatures.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-5 bg-bg-tertiary/40 border border-black/10 rounded-xl hover:border-primary/30 transition-all duration-300">
                <div className="text-primary mb-3">{f.icon}</div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
