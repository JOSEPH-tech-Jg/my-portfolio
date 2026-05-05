'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GravityBackground from '@/components/GravityBackground'

export default function CVPage() {
  return (
    <main className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30">
      {/* THE BACKGROUND ALLOCATION */}
      <GravityBackground />

      <div className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          
          {/* HEADER AREA */}
          <header className="mb-16">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-amber-400 hover:text-white transition-all duration-300"
            >
              <span className="group-hover:-translate-x-2 transition-transform duration-300">←</span> Back to home
            </Link>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-10 space-y-4"
            >
              <p className="text-[10px] uppercase tracking-[0.5em] text-amber-500 font-black">JOSEPH githinji</p>
              <h1 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter text-white">
                AI SYSTEMS <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  ARCHITECT.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl font-light leading-relaxed">
                Bridging the Human-AI Divide through <span className="text-white">Neural Automation</span> & Scalable Architecture.
              </p>
            </motion.div>
          </header>

          {/* CV CONTENT BLOCKS */}
          <section className="grid gap-8">
            
            {/* VALUE PROPOSITION - Full Width Glass */}
            <motion.div 
              whileHover={{ translateY: -5 }}
              className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-10 transition-all duration-500 hover:border-amber-500/30"
            >
              <h2 className="text-[10px] font-black tracking-[0.3em] text-amber-500 mb-6 uppercase">⚡ THE VALUE PROPOSITION</h2>
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
                Specialized in translating high-level <span className="text-amber-400 font-medium">Neural Networks</span> and LLMs into production-ready applications. I engineer <span className="text-white italic">Human Liberation</span> by automating the mundane.
              </p>
            </motion.div>

            {/* TWO COLUMN GRID */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* EXPERTISE */}
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-lg p-10 hover:border-blue-500/30 transition-colors duration-500">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-amber-500 mb-8 uppercase">🚀 CORE EXPERTISE</h3>
                <ul className="space-y-6">
                  {[
                    { label: "AI & ML", desc: "LLM Integration (OpenAI, LangChain), Neural Automation." },
                    { label: "Full-Stack", desc: "Next.js, TypeScript, Java (Spring Boot), Python." },
                    { label: "Architecture", desc: "Scalable Backends, Microservices, Cloud (AWS/GCP)." },
                    { label: "UI/UX", desc: "Cinematic Design, Motion Graphics, Responsive Flow." }
                  ].map((item, i) => (
                    <li key={i} className="group">
                      <span className="block text-xs font-bold text-white mb-1 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm text-gray-400 font-light group-hover:text-gray-200 transition-colors">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* IMPACT */}
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-lg p-10 hover:border-amber-500/30 transition-colors duration-500">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-amber-500 mb-8 uppercase">🛠 TECHNICAL IMPACT</h3>
                <ul className="space-y-6">
                  <li className="text-sm leading-relaxed text-gray-300">
                    <span className="text-white font-bold block mb-2">Neural Automation:</span> Reduced manual entry by <span className="text-amber-400">85%</span> via AI-driven workflows.
                  </li>
                  <li className="text-sm leading-relaxed text-gray-300">
                    <span className="text-white font-bold block mb-2">LLM Integration:</span> Handles <span className="text-amber-400">3,000+</span> monthly inquiries with 92% satisfaction.
                  </li>
                  <li className="text-sm leading-relaxed text-gray-300">
                    <span className="text-white font-bold block mb-2">Scalable Systems:</span> Rebuilt Java backends, increasing uptime to <span className="text-amber-400">99.99%</span>.
                  </li>
                </ul>
              </div>
            </div>

            {/* FOOTER GLASS - CONTACT */}
            <footer className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-amber-500 mb-2 uppercase">💡 THE PHILOSOPHY</h3>
                <p className="text-gray-400 text-sm italic">&ldquo;Technology should never be a barrier; it should be a bridge.&rdquo;</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="px-6 py-3 rounded-full border border-white/10 text-[10px] font-bold tracking-widest hover:bg-white hover:text-black transition-all text-center uppercase">LinkedIn</a>
                <a href="#" className="px-6 py-3 rounded-full border border-white/10 text-[10px] font-bold tracking-widest hover:bg-white hover:text-black transition-all text-center uppercase">GitHub</a>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  )
}
