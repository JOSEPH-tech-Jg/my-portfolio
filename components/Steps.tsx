'use client'
import { motion } from 'framer-motion'

const STEPS = [
  { i: '01', t: 'Recon & Threat Modeling', d: 'We map your attack surface, assets and crown jewels, then agree on scope and real business risk.' },
  { i: '02', t: 'Assess & Exploit', d: 'I run controlled offensive tests across web, API, cloud and network using proven methodology.' },
  { i: '03', t: 'Defend & Harden', d: 'Vulnerabilities become prioritized fixes, plus detection rules, logging and access controls.' },
  { i: '04', t: 'Verify & Rally', d: 'Re-test and report with a clear risk dashboard your team and board can trust.' }
]

export default function Steps() {
  return (
    <section id="process" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
          <span className="h-px w-8 bg-cyan-400/60" />
          How I work
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          A proven path from risk to resilience
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, idx) => (
            <motion.div
              key={s.i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="glass relative p-6"
            >
              <div className="font-mono text-4xl font-bold text-cyan-400/40">{s.i}</div>
              <h3 className="mt-3 text-base font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}