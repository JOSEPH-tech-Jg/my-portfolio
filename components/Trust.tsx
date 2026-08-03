const FRAMEWORKS = ['OWASP Top 10', 'NIST CSF', 'MITRE ATT&CK', 'ISO 27001', 'CIS Controls', 'SOC 2']

const STATS = [
  { v: '120+', l: 'Assessments Delivered' },
  { v: '60', l: 'Critical Flaws Found' },
  { v: '99.99%', l: 'Platform Uptime' },
  { v: '24h', l: 'Avg. Time-to-Mitigate' }
]

export default function Trust() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="glass grid gap-8 p-8 md:grid-cols-[1fr_2fr] md:items-center">
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <span key={f} className="rounded-md border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 font-mono text-xs text-cyan-200">
                {f}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="text-center md:text-right">
                <div className="font-mono text-2xl font-bold text-white">{s.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}