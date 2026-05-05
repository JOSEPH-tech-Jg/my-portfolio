'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import WarpBackground from '@/components/WarpBackground' // The futuristic tunnel we built

export default function VisionPage() {
  return (
    <main className="relative min-h-screen text-white overflow-x-hidden selection:bg-cyan-500/30">
      {/* THE FUTURISTIC BACKGROUND */}
      <WarpBackground />

      <div className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          
          {/* HEADER AREA */}
          <header className="mb-20">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-amber-400 hover:text-white transition-all duration-300"
            >
              <span className="group-hover:-translate-x-2 transition-transform duration-300">←</span> Back to home
            </Link>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-12 space-y-6"
            >
              <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter uppercase">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Vision.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed">
                A future built around <span className="text-white">human liberation</span>, not imitation.
              </p>
            </motion.div>
          </header>

          <section className="space-y-12">
            {/* INTRO MANIFESTO */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xl md:text-2xl leading-relaxed text-gray-200 font-light border-l-2 border-amber-500 pl-8 py-2"
            >
              We are not just building faster processors; we are crafting partners designed to shoulder the burden of repetitive, dangerous, and dull tasks. When we <span className="text-amber-400">automate the mundane</span>, we unlock human potential.
            </motion.p>

            {/* THE WORLD CARD - High Transparency Glass */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 shadow-2xl"
            >
              <h2 className="text-[10px] font-black tracking-[0.4em] text-amber-500 mb-12 uppercase">Imagine a world where:</h2>

              <div className="grid gap-12">
                {[
                  {
                    title: "Healthcare is a Right",
                    desc: "Precision robotics allow medical professionals to focus on empathy while machines handle high-risk logistics."
                  },
                  {
                    title: "Labor is Opportunity",
                    desc: "In agriculture and manufacturing, robotics fill gaps, ensuring stability without forcing humans into hazards."
                  },
                  {
                    title: "Innovation is Democratized",
                    desc: "Advanced technology becomes affordable for every independent researcher, ensuring a smarter future for all."
                  }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-light text-lg">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CLOSING PHILOSOPHY */}
            <div className="grid md:grid-cols-2 gap-12 pt-10">
              <div className="space-y-6 text-gray-300 font-light leading-relaxed">
                <p>
                  my vision is to ensure that technology become ubiquitous, it serve to enhance our capabilities and improve our quality of life.
                </p>
                <p>
                  Technology should eliminate pain, not create it. 
                </p>
              </div>

              <div className="flex flex-col justify-end items-end text-right">
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Signed with Purpose</p>
                <p className="text-3xl font-black text-white leading-none">Joseph githinji</p>
                <p className="text-amber-500 text-[10px] font-bold tracking-[0.2em] mt-2 uppercase">
                  AI Innovator & Application Developer
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
