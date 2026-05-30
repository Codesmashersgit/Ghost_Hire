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
    <section className="py-24 relative" id="reviews">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
            ⭐ Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Loved by <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Ambitious Candidates</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">
            Real stories from verified engineers and designers who secured roles at top tech companies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 bg-bg-tertiary/30 border border-black/[0.05] rounded-2xl hover:border-primary-light/30 hover:bg-bg-tertiary/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(r.rating)].map((_, j) => (
                    <Star key={j} size={13} className="fill-warning text-warning" />
                  ))}
                </div>
                
                <Quote size={24} className="text-primary-light/20 mb-3" />
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 font-medium">"{r.text}"</p>
              </div>

              <div className="flex items-center gap-3 border-t border-black/[0.04] pt-4 mt-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-black shadow-inner shadow-white/20">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-text-primary">{r.name}</p>
                  <p className="text-[0.68rem] text-text-tertiary font-medium">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
