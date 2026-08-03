'use client'
import React, { useEffect, useRef } from 'react'

const CyberBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []

    const dpr = () => Math.min(globalThis.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = globalThis.innerWidth * dpr()
      canvas.height = globalThis.innerHeight * dpr()
      ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0)
    }

    const seed = () => {
      const count = Math.max(28, Math.floor((globalThis.innerWidth * globalThis.innerHeight) / 28000))
      nodes = Array.from({ length: count }, () => ({
        x: globalThis.innerWidth * Math.random(),
        y: globalThis.innerHeight * Math.random(),
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.1 + 0.3
      }))
    }

    const frame = () => {
      const W = globalThis.innerWidth
      const H = globalThis.innerHeight
      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        a.x += a.vx
        a.y += a.vy
        if (a.x < 0 || a.x > W) a.vx *= -1
        if (a.y < 0 || a.y > H) a.vy *= -1

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          if (dx * dx + dy * dy < 175 * 175) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(56, 132, 200, 0.10)'
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(110, 180, 240, 0.28)'
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    const onResize = () => { resize(); seed() }

    globalThis.addEventListener('resize', onResize)
    resize()
    seed()
    frame()

    return () => {
      cancelAnimationFrame(raf)
      globalThis.removeEventListener('resize', onResize)
    }
  }, [])

return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-[#04070d]">
      <div className="absolute inset-0 opacity-70"
        style={{ background: 'radial-gradient(circle at 20% 30%, rgba(8,20,50,0.8), transparent 50%), radial-gradient(circle at 80% 80%, rgba(12,34,70,0.6), transparent 50%)' }}
      />
      <div className="cyber-grid absolute inset-0 opacity-30" />
      <div className="cyber-grid absolute inset-0 opacity-20" style={{ transform: 'perspective(700px) rotateX(60deg) scale(1.9)', transformOrigin: 'center bottom' }} />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
      <div className="cyg-scanline sf-sweep absolute inset-0 opacity-60" />
    </div>
  )
}

export default CyberBackground