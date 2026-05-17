import { motion } from 'framer-motion'
import { Mic, Code2, FileText, Eye, Globe, Keyboard, Brain, MessageSquare } from 'lucide-react'

const features = [
  { icon: <Mic size={24} />, title: 'Real-Time Listening', desc: 'Automatically detects interviewer questions from audio and generates instant, contextual responses.', color: '#6C5CE7' },
  { icon: <Code2 size={24} />, title: 'Coding Interview Support', desc: 'Get code suggestions, explanations, and optimizations for LeetCode, HackerRank, and live coding rounds.', color: '#00D2FF' },
  { icon: <FileText size={24} />, title: 'Resume Context', desc: 'Upload your resume and documents — GhostHire tailors every response to your experience and skills.', color: '#FFB300' },
  { icon: <Eye size={24} />, title: '100% Undetectable', desc: 'Invisible to screen sharing, proctoring software, and recording tools. Completely stealth operation.', color: '#00C853' },
  { icon: <Globe size={24} />, title: '50+ Languages', desc: 'Supports over 50 languages with real-time transcription and response generation.', color: '#FF6B6B' },
  { icon: <Brain size={24} />, title: 'Multi-Model AI', desc: 'Choose from GPT-4, Claude, Gemini and more. Pick the best AI model for your interview type.', color: '#A29BFE' },
  { icon: <Keyboard size={24} />, title: 'Keyboard Shortcuts', desc: 'Full keyboard shortcut support for seamless, hands-free operation during live calls.', color: '#67E8F9' },
  { icon: <MessageSquare size={24} />, title: 'Post-Call Summary', desc: 'Automatic notes, key points, and action items generated after every interview session.', color: '#FFE082' },
]

export default function Features() {
  return (
    <section className="py-24 relative" id="features">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">⚡ Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ace Your Interview</span>
          </h2>
          <p className="text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">Powerful AI features designed to give you the edge in every interview scenario.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 bg-bg-tertiary/60 backdrop-blur-xl border border-black/10 rounded-2xl hover:bg-bg-tertiary/80 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(108,92,231,0.2)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.color}15`, color: f.color, boxShadow: `0 0 20px ${f.color}20` }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${f.color}08, transparent 60%)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
