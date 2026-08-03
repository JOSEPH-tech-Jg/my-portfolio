'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const competencies = [
  'Penetration Testing', 'SOC Operations', 'Incident Response', 'Zero-Trust Architecture',
  'Cloud Security', 'Secure SDLC', 'Threat Hunting', 'Detection Engineering',
  'IAM & Privileged Access', 'Cryptography & Key Management', 'Malware Analysis', 'Risk Frameworks'
]

const exp = [
  {
    y: '2022 - Present',
    r: 'Security Engineer',
    o: 'Independent & Contract · Nairobi',
    d: 'Lead offensive & defensive engagements for clients in fintech and e-commerce. Build detection pipelines, run red-team simulations and harden cloud estates to production standard.'
  },
  {
    y: '2020 - 2022',
    r: 'Application Developer · Security Focused',
    o: 'Enterprise',
    d: 'Developed and secured production applications. Integrated OWASP-aligned code review, dependency scanning and CI/CD security gates into the delivery pipeline.'
  },
  {
    y: '2018 - 2020',
    r: 'Full-Stack Developer',
    o: 'Startups',
    d: 'Shipped web products end to end while introducing automated security checks and hardening core infrastructure.'
  }
]

const certs = ['CompTIA Security+', 'CEH', 'AWS Security Speciality', 'OSCP (in view)']

export default function CV() {
  return (
    <main className="relative min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400 hover:text-cyan-300">
            &larr; Back to home
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 pb-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-400">Curriculum Vitae</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Joseph Githinji
          </h1>
          <p className="mt-2 text-lg text-slate-300">Cybersecurity Engineer</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm text-slate-400">
            <span>Nairobi, Kenya</span>
            <span>hello@josephgithinji.dev</span>
            <span>github.com/josephgithinji</span>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-12"
        >
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Profile</h2>
            <p className="mt-3 leading-relaxed text-slate-300">
              Cybersecurity engineer with 5+ years across offensive and defensive security. I help
              organizations understand, reduce and respond to risk &mdash; aligning technical defenses
              with business priorities under a zero-trust mindset.
            </p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Core Competencies</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {competencies.map((c) => (
                <span key={c} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Experience</h2>
            <div className="mt-4 space-y-6">
              {exp.map((e) => (
                <div key={e.y} className="border-l border-white/10 pl-6">
                  <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">{e.y}</div>
                  <h3 className="mt-1 text-base font-semibold text-white">{e.r}</h3>
                  <div className="text-sm text-slate-500">{e.o}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{e.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Certifications &amp; Education</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              {certs.map((c) => (
                <li key={c} className="font-mono text-sm">{c}</li>
              ))}
            </ul>
          </div>
        </motion.section>

        <footer className="mt-14 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">
          JG_sec &middot; 2026
        </footer>
      </div>
    </main>
  )
}