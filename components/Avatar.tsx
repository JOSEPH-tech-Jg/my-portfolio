'use client'

export default function Avatar({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="avgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <g className="sf-orb" style={{ transformOrigin: '60px 60px' }}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth={1.5} strokeDasharray="6 7" />
        <circle cx="60" cy="60" r="43" fill="none" stroke="rgba(52,211,153,0.3)" strokeWidth={1} />
        <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(34,211,238,0.45)" strokeWidth={1} strokeDasharray="2 6" />
      </g>
      <circle cx="60" cy="60" r="26" fill="url(#avgrad)" stroke="rgba(148,220,255,0.6)" strokeWidth={1} />
      <circle cx="60" cy="60" r="22" fill="#0b1220" />
      <path d="M 45 72 Q 52 55 60 55 Q 68 55 75 72 Z" fill="rgba(34,211,238,0.15)" />
      <circle cx="54" cy="48" r="4" fill="#22d3ee" />
      <circle cx="66" cy="48" r="4" fill="#34d399" />
    </svg>
  )
}
