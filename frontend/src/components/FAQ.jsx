import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'Which communication platforms does GhostHire work with?', a: 'GhostHire listens directly to your system speaker channel, meaning it works flawlessly across Zoom, Google Meet, Microsoft Teams, Webex, Skype, and any browser-based calling application. It functions natively at the OS layer.' },
  { q: 'Can proctoring and screensharing software detect GhostHire?', a: 'No. GhostHire runs inside a dedicated, isolated window wrapper that utilizes modern stealth overlays. It does not inject into active browser tabs or hook screen pixels, making it entirely invisible to Zoom screen share, MS Teams, and exam monitoring tools.' },
  { q: 'How does it support coding and algorithm interviews?', a: 'When a coding problem is recognized or copy-pasted, GhostHire runs custom code models to generate clean, highly-optimized functions (e.g. Python, Java, JS/TS, C++). It outputs visual step-by-step algorithms, space/time complexity analyses, and edge cases.' },
  { q: 'Can I upload my personal resume and target job descriptions?', a: 'Absolutely. Inside the dashboard documents page, you can drag and drop your PDF resume, portfolios, and past project details. GhostHire automatically contextualizes generated questions to sound like you designed them.' },
  { q: 'What languages does GhostHire support?', a: 'We support speech transcription and response generation in over 50 native languages (including English, Hindi, German, French, Japanese, Spanish, etc.). You can modify target language mid-session.' },
  { q: 'Does GhostHire require speakers or works with headphones?', a: 'It listens directly to your internal speaker bus. It works perfectly whether you use wireless headphones, wired buds, or built-in laptop speakers.' },
  { q: 'What is your refund policy?', a: 'We offer an unconditional 30-day money-back guarantee. If you are not fully satisfied with your interview prep, send a message to our support line and receive a complete refund.' },
]

function FAQItem({ faq, isOpen, toggle }) {
  return (
    <div className="bg-bg-tertiary/20 border border-white/[0.04] rounded-xl overflow-hidden hover:border-primary-light/30 transition-all duration-300">
      <button 
        onClick={toggle} 
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="text-xs sm:text-sm font-bold text-text-primary pr-4">{faq.q}</span>
        <ChevronDown 
          size={16} 
          className={`text-text-tertiary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} 
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/[0.03]">
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-24 relative" id="faq">
      <div className="max-w-[760px] mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
            ❓ FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-text-primary">
            Frequently Asked <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <FAQItem 
                faq={faq} 
                isOpen={openIndex === i} 
                toggle={() => setOpenIndex(openIndex === i ? null : i)} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
