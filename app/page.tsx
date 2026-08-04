'use client'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'
import Typewriter from '../components/Typewriter'
import Hud from '../components/Hud'
import Trust from '../components/Trust'
import Steps from '../components/Steps'
import Quotes from '../components/Quotes'

const services = [
  { t: 'Penetration Testing', d: 'Scope-driven ethical hacking of web, mobile, API and network surfaces following OWASP, NIST and MITRE methodology to surface risk before attackers do.' },
  { t: 'Zero-Trust Architecture', d: 'Identity-first network design with microsegmentation, least privilege and continuous verification enforced at every trust boundary.' },
  { t: 'SOC & Incident Response', d: 'Detection engineering, 24/7 monitoring and coordinated response playbooks that contain, eradicate and recover from incidents fast.' },
  { t: 'Cloud Security', d: 'Hardening AWS, Azure and GCP estates with posture management, IAM review and runtime workload protection.' },
  { t: 'Secure Development', d: 'Embedding security into the SDLC with SAST, DAST, dependency scanning and threat modeling so vulnerabilities never ship.' },
  { t: 'Threat Intelligence', d: 'IoC hunting, adversary tracking and applied cryptography with sound key management across the estate.' }
]

const skills = [
  { g: 'Offensive Security', items: ['Web App Pentesting', 'API Security', 'Network Pentesting', 'Social Engineering', 'Red Teaming'] },
  { g: 'Defensive Security', items: ['SIEM / EDR / XDR', 'Detection Engineering', 'Threat Hunting', 'Incident Response', 'Malware Analysis'] },
  { g: 'Architecture', items: ['Zero-Trust', 'IAM / PAM', 'Cloud Security', 'Container / K8s', 'Microsegmentation'] },
  { g: 'Engineering', items: ['Python', 'Bash / PowerShell', 'Go', 'SQL', 'Terraform', 'AWS / Azure'] }
]

const timeline = [
  { y: '2022 - Present', r: 'Security Engineer', o: 'Independent & Contract', d: 'Leading offensive assessments, building detection pipelines and hardening cloud estates for clients across fintech and e-commerce.' },
  { y: '2020 - 2022', r: 'Application Developer', o: 'Enterprise', d: 'Built and secured production applications, integrating OWASP-aligned review and CI/CD security gates.' },
  { y: '2018 - 2020', r: 'Full-Stack Developer', o: 'Startups', d: 'Shipped products end to end while introducing automated security checks into the delivery pipeline.' }
]

const projects = [
  { n: 'Honeypot Mesh', t: 'SOC', d: 'A distributed honeypot network that captures attacker TTPs and feeds a live threat-intel dashboard.' },
  { n: 'Zero-Trust Lab', t: 'Architecture', d: 'Reference microsegmented network with IDP-enforced access, documented for small teams to adopt.' },
  { n: 'Detection Playbook', t: 'Engineering', d: 'Open-source Sigma rules and detection queries for common adversary behavior, mapped to MITRE ATT&CK.' }
]

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <section className="flex min-h-screen flex-col justify-center px-6 pt-24 pb-16">
          <div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14">
            <div className="max-w-3xl">
              <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Security Engineer &mdash; Nairobi &middot; Kenya
              </p>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Designing, hardening &amp; defending
                <span className="block bg-gradient-to-r from-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                  resilient systems.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                I specialize in <Typewriter /> From cloud estates to critical web applications, I
                plan, automate and lead the offensive and defensive work that keeps teams secure.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  className="rounded-full bg-cyan-500 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-slate-900 transition-colors hover:bg-cyan-400"
                >
                  Start a Project
                </a>
                <a
                  href="/cv"
                  className="rounded-full border border-white/15 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-300"
                >
                  Read the CV
                </a>
              </div>
            </div>
            <div className="mt-12 w-full lg:mt-0 lg:max-w-md">
              <Hud />
            </div>
          </div>
        </section>

        <Trust />

        <section id="services" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Services that harden your attack surface
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="glass group p-6 transition-colors hover:border-cyan-400/40"
                >
                  <div className="mb-4 font-mono text-xs uppercase tracking-widest text-cyan-400">
                    0{i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="expertise" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Expertise</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A full-spectrum security skill set
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {skills.map((g, i) => (
                <motion.div
                  key={g.g}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass p-6"
                >
                  <h3 className="font-mono text-xs uppercase tracking-widest text-cyan-400">{g.g}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Experience</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A track record of finding &amp; fixing risk
            </h2>
            <div className="mt-12 space-y-0">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.y}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="relative border-l border-white/10 pl-8 pb-12"
                >
                  <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">{t.y}</div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{t.r}</h3>
                  <div className="text-sm text-slate-500">{t.o}</div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{t.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Selected Work</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Projects &amp; open contributions
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {projects.map((p, i) => (
                <motion.div
                  key={p.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass flex flex-col p-6 transition-colors hover:border-cyan-400/40"
                >
                  <div className="font-mono text-xs uppercase tracking-widest text-emerald-400">{p.t}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{p.n}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Steps />

        <Quotes />

        <section id="contact" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="glass flex flex-col items-start justify-between gap-8 p-10 md:flex-row md:items-center">
              <div>
                <SectionLabel>Contact</SectionLabel>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
                  Let&rsquo;s secure something together
                </h2>
                <p className="mt-3 max-w-xl text-slate-400">
                  Available for security assessments, consulting engagements and full-time security
                  engineering roles.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a href="mailto:josephgithinji309@gmail.com" className="font-mono text-cyan-400 hover:text-cyan-300">
                  josephgithinji309@gmail.com
                </a>
                <a href="https://www.linkedin.com/in/joseph-githinji-082b8136b/" target="_blank" rel="noopener noreferrer" className="font-mono text-slate-400 hover:text-white">
                  linkedin.com/in/joseph-githinji
                </a>
                <a href="https://gitea.kood.tech/josephgithinjimwangi/" target="_blank" rel="noopener noreferrer" className="font-mono text-slate-400 hover:text-white">
                  gitea.kood.tech/josephgithinjimwangi
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600 md:flex-row">
            <div>JG_sec &mdash; Joseph Githinji</div>
            <div>Nairobi, Kenya &middot; 2026</div>
          </div>
        </footer>
      </main>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
      <span className="h-px w-8 bg-cyan-400/60" />
      {children}
    </div>
  )
}
