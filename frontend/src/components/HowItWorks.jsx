import { motion } from 'framer-motion'
import { UserPlus, Upload, Play, Trophy } from 'lucide-react'

const steps = [
  { icon: <UserPlus size={24} />, step: '01', title: 'Create Account', desc: 'Register in seconds. Start with a risk-free trial immediately without entering credit card details.' },
  { icon: <Upload size={24} />, step: '02', title: 'Context Syncing', desc: 'Sync your resume, target job roles, and specific notes so every AI response matches your voice.' },
  { icon: <Play size={24} />, step: '03', title: 'Launch Copilot', desc: 'Fire up your dashboard before starting your live video or voice interview call on Zoom or Meet.' },
  { icon: <Trophy size={24} />, step: '04', title: 'Ace the Session', desc: 'Receive instant structural answers and code. Review your performance data summary afterwards.' },
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden" id="how-it-works">
      {/* Visual Tech grid background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 cyber-grid" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
            🚀 Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Acing Interviews is <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">4 Simple Steps</span> Away
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">
            From setup to target offer letter — onboarding is optimized to take under two minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((s, i) => (
            <motion.div 
              key={i} 
              className="relative p-6 bg-bg-tertiary/20 border border-white/[0.04] rounded-2xl text-center hover:bg-bg-tertiary/40 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              {/* Step number glow */}
              <div className="text-5xl font-black bg-gradient-to-br from-primary/20 to-accent/10 bg-clip-text text-transparent leading-none mb-3 font-mono tracking-tighter">
                {s.step}
              </div>
              
              {/* Icon Container with glowing box */}
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-5 text-white shadow-[0_8px_20px_rgba(99,102,241,0.25)] border border-white/10">
                {s.icon}
              </div>

              <h3 className="text-base font-bold mb-2 text-text-primary">{s.title}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed px-2">{s.desc}</p>
              
              {/* Connector lines between cards */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-[15%] w-[30%] h-[1px] bg-gradient-to-r from-primary/30 to-accent/30 opacity-40 z-[-1]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
