import { motion } from 'framer-motion'
import { UserPlus, Upload, Play, Trophy } from 'lucide-react'

const steps = [
  { icon: <UserPlus size={28} />, step: '01', title: 'Create Account', desc: 'Sign up in seconds. No credit card required. Get instant access to your dashboard.' },
  { icon: <Upload size={28} />, step: '02', title: 'Upload Context', desc: 'Upload your resume, job description, and any notes. GhostHire personalizes every response.' },
  { icon: <Play size={28} />, step: '03', title: 'Start Session', desc: 'Launch a session before your interview. GhostHire listens and generates answers in real-time.' },
  { icon: <Trophy size={28} />, step: '04', title: 'Ace the Interview', desc: 'Deliver confident, well-structured answers. Review your post-call summary afterwards.' },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-bg-secondary" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">🚀 How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Up and Running in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">4 Simple Steps</span>
          </h2>
          <p className="text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">From sign-up to acing your interview — it takes less than 2 minutes to get started.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, i) => (
            <motion.div key={i} className="text-center relative px-4 py-8" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
              <div className="text-6xl font-black bg-gradient-to-br from-primary/15 to-accent/8 bg-clip-text text-transparent leading-none mb-4">{s.step}</div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-5 text-text-primary shadow-[0_8px_30px_rgba(108,92,231,0.3)]">
                {s.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-[12%] w-[24%] h-0.5 bg-gradient-to-r from-primary to-accent opacity-30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
