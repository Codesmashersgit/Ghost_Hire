import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Languages } from 'lucide-react'

export default function DemoVideo() {
  const [language, setLanguage] = useState('English')

  // You can replace these with actual YouTube embed IDs or video URLs
  const videoSources = {
    English: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0",
    Hindi: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0" 
  }

  return (
    <section className="py-24 relative overflow-hidden" id="demo-video">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-10" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[2.5px] text-accent px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full mb-4">
            <Play size={12} className="fill-accent" /> Watch it in Action
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-text-primary">
            See How GhostHire Works
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed mb-8">
            Watch the complete demonstration to understand how the Copilot listens and generates instant answers during an interview.
          </p>

          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-4 bg-bg-secondary border border-black/[0.08] p-1.5 rounded-2xl w-max mx-auto shadow-sm">
            <button
              onClick={() => setLanguage('English')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                language === 'English' 
                  ? 'bg-text-primary text-white shadow-md' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-black/[0.04]'
              }`}
            >
              <Languages size={16} /> English
            </button>
            <button
              onClick={() => setLanguage('Hindi')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                language === 'Hindi' 
                  ? 'bg-text-primary text-white shadow-md' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-black/[0.04]'
              }`}
            >
              <Languages size={16} /> Hindi
            </button>
          </div>
        </motion.div>

        {/* Video Player Box */}
        <motion.div 
          className="relative rounded-3xl overflow-hidden bg-black/[0.03] border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.1)] aspect-video"
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {/* Top Bar matching the clean white theme */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-bg-secondary/90 backdrop-blur-md border-b border-black/[0.05] flex items-center px-4 z-10 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
            <span className="ml-3 text-[0.68rem] font-bold text-text-tertiary font-mono">
              GhostHire_Demo_{language}.mp4
            </span>
          </div>
          
          <iframe 
            src={videoSources[language]} 
            className="w-full h-full pt-10 object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`GhostHire Demo - ${language}`}
          ></iframe>
        </motion.div>
      </div>
    </section>
  )
}
