import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GravityBackground from '@/components/GravityBackground';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Joseph Well - Application Developer',
  description: 'Building Intelligence That Works for People',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <GravityBackground />
        {children}
      </body>
    </html>
  )
}