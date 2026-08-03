import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import CyberBackground from '@/components/CyberBackground'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Joseph Githinji — Cybersecurity Engineer',
    template: '%s · Joseph Githinji'
  },
  description:
    'Professional cybersecurity engineer specializing in penetration testing, secure architecture, SOC operations, cloud security and zero-trust network design.',
  keywords: [
    'cybersecurity',
    'security engineer',
    'penetration testing',
    'zero trust',
    'cloud security',
    'SOC',
    'cryptography'
  ],
  openGraph: {
    title: 'Joseph Githinji — Cybersecurity Engineer',
    description: 'Designing, hardening, and defending resilient systems with a zero-trust mindset.',
    type: 'website'
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050810'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-background text-foreground font-sans`}
      >
        <CyberBackground />
        {children}
      </body>
    </html>
  )
}
