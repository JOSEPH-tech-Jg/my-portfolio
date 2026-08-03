'use client'
import { useEffect, useState } from 'react'

const phrases = [
  'penetration testing.',
  'zero-trust architecture.',
  'SOC operations.',
  'cloud security.',
  'incident response.',
  'threat intelligence.'
]

export default function Typewriter() {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[index]
    const delay = deleting ? 45 : 75
    let timer: ReturnType<typeof setTimeout>

    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), 1500)
    } else {
      timer = setTimeout(() => {
        const next = deleting
          ? current.slice(0, -1)
          : current.slice(0, text.length + 1)
        setText(next)
        if (deleting && next === '') {
          setDeleting(false)
          setIndex((index + 1) % phrases.length)
        }
      }, delay)
    }

    return () => clearTimeout(timer)
  }, [text, deleting, index])

  return (
    <span className="font-mono text-[inherit]">
      {text}
      <span className="caret text-cyan-400">|</span>
    </span>
  )
}
