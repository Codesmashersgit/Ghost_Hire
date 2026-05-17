import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'Which platforms does GhostHire work with?', a: 'GhostHire works with all call platforms including Zoom, Google Meet, Microsoft Teams, and more. It is 100% private, invisible, and undetectable.' },
  { q: 'Can proctoring software detect GhostHire?', a: 'No. GhostHire operates invisibly at the system level and is designed to be undetectable by proctoring software, screen-sharing tools, and recording software.' },
  { q: 'Does GhostHire support coding interviews?', a: 'Yes! GhostHire offers full coding interview support including code suggestions, explanations, and optimizations for platforms like LeetCode, HackerRank, and Coderpad.' },
  { q: 'Can I upload my resume for personalized answers?', a: 'Absolutely. Upload your resume, job description, and any other documents. GhostHire uses this context to tailor every response to your background and experience.' },
  { q: 'What languages does GhostHire support?', a: 'GhostHire supports over 50 languages with real-time transcription and response generation. You can switch languages during your session.' },
  { q: 'How does the free trial work?', a: 'GhostHire offers unlimited free trial sessions lasting up to 10 minutes each. No credit card required. You can start a new trial every 15 minutes.' },
  { q: 'Can I use headphones during the call?', a: 'Yes. GhostHire listens directly to system audio, not from your speakers. Headphones work perfectly.' },
  { q: 'What is your refund policy?', a: 'We offer a 30-day money-back guarantee on all purchases. If you are unsatisfied for any reason, request a full refund within 30 days.' },
]

function FAQItem({ faq, isOpen, toggle }) {
  return (
    <div className="border border-black/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors duration-300">
      <button onClick={toggle} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-sm font-semibold pr-4">{faq.q}</span>
        <ChevronDown size={18} className={`text-text-tertiary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="px-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-24 bg-bg-secondary" id="faq">
      <div className="max-w-[750px] mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">❓ FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <FAQItem faq={faq} isOpen={openIndex === i} toggle={() => setOpenIndex(openIndex === i ? null : i)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
