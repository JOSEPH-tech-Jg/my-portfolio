'use client'
import { motion } from 'framer-motion'
import Avatar from './Avatar'

const QUOTES = [
  {
    q: 'In a single assessment they mapped our whole attack surface and closed a hole our team never saw. The report was so clear our board finally understood the risks.',
    n: 'A. Kavita', r: 'CTO, Fintech Startup'
  },
  {
    q: 'They code and they hack — a rare combination. We trust their architecture reviews as much as their red-team work.',
    n: 'M. Ochieng', r: 'Engineering Lead, E-commerce'
  },
  {
    q: 'Beyond professional. Responds fast, explains simply, and our platform has never had an incident since they took over security.',
    n: 'S. Wanjiku', r: 'Founder, SaaS'
  }
]

export default function Quotes() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
          <span className="h-px w-8 bg-cyan-400/60" />
          What clients say
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Trusted to keep teams secure
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {QUOTES.map((q, idx) => (
            <motion.figure
              key={q.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass flex flex-col justify-between p-6"
            >
              <blockquote className="text-sm leading-relaxed text-slate-300">&ldquo;{q.q}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar size={48} />
                <div>
                  <div className="text-sm font-semibold text-white">{q.n}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">{q.r}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}