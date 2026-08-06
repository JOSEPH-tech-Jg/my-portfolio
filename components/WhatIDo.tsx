'use client'
import { motion } from 'framer-motion'

type Domain = { title: string; blurb: string; lines: string }

type Group = {
  label: string
  tag: string
  domains: Domain[]
}

const groups: Group[] = [
  {
    label: 'Foundations & Core',
    tag: 'CORE',
    domains: [
      { title: 'Security Foundations', blurb: 'CIA triad, AAA, risk math, zero trust, controls & governance.', lines: '1.4K' },
      { title: 'Cryptography', blurb: 'AES / RSA math, hashing, PKI, TLS and applied crypto policy.', lines: '1.5K' },
      { title: 'Networking & Infrastructure', blurb: 'OSI/TCP, segmentation, firewalls, VPN and DNS security.', lines: '1.6K' }
    ]
  },
  {
    label: 'Domain Mastery',
    tag: 'DOMAIN',
    domains: [
      { title: 'Application & Web Security', blurb: 'OWASP Top 10, API security, secure coding, SAST/DAST, WAF.', lines: '2.3K' },
      { title: 'Cloud & Container Security', blurb: 'AWS / Azure / GCP, Docker & Kubernetes hardening, DevSecOps.', lines: '1.7K' },
      { title: 'Endpoint, OS & Mobile', blurb: 'OS hardening, EDR, mobile security and malware persistence.', lines: '1.6K' },
      { title: 'Identity & Access Management', blurb: 'MFA, RBAC/ABAC, SSO/OIDC, AD attack paths and PAM.', lines: '1.5K' },
      { title: 'IoT, OT & ICS', blurb: 'Purdue Model, SCADA/PLC, IEC 62443 and industrial ransomware.', lines: '1.3K' }
    ]
  },
  {
    label: 'Operations & Defense',
    tag: 'DEFENSE',
    domains: [
      { title: 'SOC & Threat Hunting', blurb: 'SIEM, detection engineering, Sigma rules and SOAR playbooks.', lines: '3.0K' },
      { title: 'Incident Response & Forensics', blurb: 'NIST 800-61 lifecycle, chain of custody and disk/memory forensics.', lines: '2.1K' },
      { title: 'Threat Intelligence', blurb: 'Kill Chain, MITRE ATT&CK, IoCs and STIX/TAXII feeds.', lines: '1.5K' }
    ]
  },
  {
    label: 'Governance & Program',
    tag: 'GRC',
    domains: [
      { title: 'Governance, Risk & Compliance', blurb: 'RMF/FAIR, ISO 27001, NIST CSF, GDPR/HIPAA and audit.', lines: '1.9K' },
      { title: 'Security Awareness', blurb: 'Social engineering, phishing programs and security culture.', lines: '1.9K' }
    ]
  },
  {
    label: 'Offense & Specialized',
    tag: 'OFFENSE',
    domains: [
      { title: 'Offensive Security & Red Team', blurb: 'PTES/OWASP methodology, recon to exploitation and reporting.', lines: '2.1K' },
      { title: 'Emerging Tech Security', blurb: 'AI/ML adversarial, LLM prompt injection and quantum/PQC.', lines: '2.5K' }
    ]
  }
]

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
            <span className="h-px w-8 bg-cyan-400/60" />
            What I Do
          </div>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A full-spectrum security practice, built on a 16-domain deep-dive library
          </h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            From cryptography to red teaming, GRC to AI security — every discipline is studied,
            documented and practiced. No black boxes, no hand-waving. Just working knowledge you can
            verify.
          </p>
        </motion.div>

        <div className="mt-12 space-y-12">
          {groups.map((group, gi) => (
            <div key={group.label}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                  {group.tag}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </motion.div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.domains.map((d, di) => (
                  <motion.article
                    key={d.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: (gi + di) * 0.04, duration: 0.45 }}
                    whileHover={{ y: -4 }}
                    className="glass group relative overflow-hidden p-5 transition-colors hover:border-cyan-400/50"
                  >
                    <div className="absolute right-4 top-4 font-mono text-[10px] text-slate-600 transition-colors group-hover:text-emerald-400">
                      {d.lines} LOC
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">
                      0{gi + 1}.{di + 1}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white group-hover:text-cyan-300">
                      {d.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{d.blurb}</p>
                    <div className="mt-4 h-px w-0 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500 group-hover:w-full" />
                  </motion.article>
                ))}
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 font-mono text-xs uppercase tracking-[0.25em] text-slate-500"
        >
          <span>16 domains</span>
          <span className="text-cyan-400/40">&middot;</span>
          <span>~28.9K lines</span>
          <span className="text-cyan-400/40">&middot;</span>
          <span>offense &rarr; defense &rarr; GRC</span>
        </motion.div>
      </div>
    </section>
  )
}
