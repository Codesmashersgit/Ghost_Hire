import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const reviews = [
  { name: 'Rahul S.', role: 'Software Engineer @ Google', text: 'GhostHire helped me ace my Google L5 interview. The real-time coding suggestions were incredibly accurate. Got the offer within a week!', rating: 5 },
  { name: 'Priya M.', role: 'Product Manager @ Amazon', text: 'I was nervous about my behavioral round. GhostHire gave me perfectly structured STAR responses in real-time. Absolutely game-changing!', rating: 5 },
  { name: 'Alex K.', role: 'Data Scientist @ Meta', text: 'The multi-language support is incredible. I interviewed in both English and German, and GhostHire handled both flawlessly.', rating: 5 },
  { name: 'Sarah L.', role: 'Frontend Dev @ Microsoft', text: 'Completely invisible during screen sharing. My interviewer had no idea I had AI assistance. The stealth mode is truly undetectable.', rating: 5 },
  { name: 'Dev P.', role: 'Backend Engineer @ Stripe', text: 'The resume context feature made all the difference. Every answer was tailored to my experience. Felt like having a personal interview coach.', rating: 5 },
  { name: 'Nina T.', role: 'ML Engineer @ Netflix', text: 'I used GhostHire for 5 different interviews and got 4 offers. The ROI on this tool is insane. Worth every penny!', rating: 5 },
]

export default function Reviews() {
  return (
    <section className="py-24" id="reviews">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">⭐ Reviews</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Loved by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">50,000+ Users</span>
          </h2>
          <p className="text-base text-text-secondary max-w-[600px] mx-auto">Real stories from real candidates who landed their dream jobs.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group p-6 bg-bg-tertiary/60 backdrop-blur-xl border border-black/10 rounded-2xl hover:border-primary/40 hover:shadow-[0_0_40px_rgba(108,92,231,0.15)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} className="fill-warning text-warning" />)}
              </div>
              <Quote size={20} className="text-primary/30 mb-3" />
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{r.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-text-primary text-sm font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-text-tertiary">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
