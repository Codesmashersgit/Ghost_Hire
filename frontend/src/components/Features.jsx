import { motion } from 'framer-motion'
import { Mic, Code2, FileText, Eye, Globe, Keyboard, Brain, MessageSquare } from 'lucide-react'

const features = [
  { icon: <Mic size={22} />, title: 'Real-Time Listening', desc: 'Automatically captures interviewer questions directly from desktop audio, instantly outputting answers.', color: '#6366F1' },
  { icon: <Code2 size={22} />, title: 'Advanced Coding Copilot', desc: 'Instant code generation and complexity analysis for technical coding tests and system design questions.', color: '#06B6D4' },
  { icon: <FileText size={22} />, title: 'Context Syncing', desc: 'Integrate your resume, cover letter, and project list. Every generated response uses your background.', color: '#F59E0B' },
  { icon: <Eye size={22} />, title: '100% Secure Stealth', desc: 'Entirely local visual execution. Fully invisible to online tracking, screensharing, and proctor modules.', color: '#10B981' },
  { icon: <Globe size={22} />, title: 'Global Multi-Language', desc: 'Translate and generate replies in over 50 languages with ultra-low latency audio processing.', color: '#EF4444' },
  { icon: <Brain size={22} />, title: 'Multi-Model Routing', desc: 'Select from top-tier models like Claude 3.5, GPT-4o, and Gemini. Choose the optimal brain for your niche.', color: '#A855F7' },
  { icon: <Keyboard size={22} />, title: 'Stealth Key-Shortcuts', desc: 'Run hands-free with clean background keyboard shortcuts to instantly pause, prompt, or toggle listening.', color: '#06B6D4' },
  { icon: <MessageSquare size={22} />, title: 'Post-Call Debriefs', desc: 'Generates feedback logs, key keywords, structural errors, and summaries to improve your performance.', color: '#EC4899' },
]

export default function Features() {
  return (
    <section className="py-24 relative" id="features">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
            ⚡ Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Ace Your Interview</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-[620px] mx-auto leading-relaxed">
            Engineered with deep-learning AI modules to provide instantaneous, secure, and undetectable support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative p-6 glass-panel glass-panel-hover rounded-2xl overflow-hidden"
            >
              {/* Radial gradient hover effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 20%, ${f.color}15, transparent 65%)` }} 
              />
              
              {/* Feature Icon box */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-all duration-300 group-hover:scale-105"
                style={{ 
                  backgroundColor: `${f.color}10`, 
                  borderColor: `${f.color}25`, 
                  color: f.color, 
                  boxShadow: `0 0 15px ${f.color}15` 
                }}
              >
                {f.icon}
              </div>

              <h3 className="text-base font-bold mb-2 group-hover:text-primary-light transition-colors duration-300">{f.title}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
