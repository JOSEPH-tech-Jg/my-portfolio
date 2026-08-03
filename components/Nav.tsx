'use client'
import Link from 'next/link'

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' }
]

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050810]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-lg font-bold tracking-[0.3em] text-cyan-400">
          JG<span className="text-white">_sec</span>
        </Link>
        <div className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest text-slate-400 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-cyan-400">
              {l.label}
            </a>
          ))}
          <Link
            href="/cv"
            className="rounded-full border border-cyan-400/40 px-4 py-1.5 text-cyan-300 transition-colors hover:bg-cyan-400/10"
          >
            CV
          </Link>
        </div>
      </nav>
    </header>
  )
}
