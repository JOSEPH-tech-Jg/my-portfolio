'use client'
import { useEffect, useState } from 'react'

const EVENTS = [
  'BLOCKED — SQLi attempt from 45.9.148.x',
  'PATCHED — Log4Shell CVE-2021-44228 on staging',
  'TRIAGED — phishing campaign re: fake SSO page',
  'HARDENED — S3 bucket ACL set to private',
  'ANALYZED — new ransomware family IoCs added',
  'SECURED — 2FA enforced across 40 accounts',
  'REPORTED — exposure to client, remediated same day'
]

export default function Hud() {
  const [tick, setTick] = useState(0)
  const [traffic, setTraffic] = useState(62)

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1)
      setTraffic(30 + Math.floor(Math.random() * 60))
    }, 2200)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="glass relative overflow-hidden p-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="uppercase tracking-[0.3em] text-cyan-400">Live Security Console</span>
        <span className="flex items-center gap-2 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> ON
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-white/10 py-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Threats Blocked</div>
          <div className="mt-1 text-xl font-bold text-cyan-300">{1240 + tick}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Traffic</div>
          <div className="mt-1 text-xl font-bold text-white">{traffic}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Uptime</div>
          <div className="mt-1 text-xl font-bold text-emerald-300">99.99%</div>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {EVENTS.slice(0, 4).map((e, i) => (
          <li
            key={`${i}-${Math.floor((tick + i) / 8)}`}
            className="flex items-start gap-2 text-slate-300"
          >
            <span className="mt-0.5 text-emerald-400">&gt;</span>
            <span className="truncate">{e}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
