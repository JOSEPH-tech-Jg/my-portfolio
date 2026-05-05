'use client'
import React, { useEffect, useRef } from 'react';

const WarpBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    const starCount = 400;
    let velocity = 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Star {
      x: number; y: number; z: number;
      px: number; py: number;
      color: string;

      // FIXED: Removed mandatory arguments that were causing the error
      constructor() {
        this.x = (Math.random() - 0.5) * (canvas?.width || window.innerWidth) * 2;
        this.y = (Math.random() - 0.5) * (canvas?.height || window.innerHeight) * 2;
        this.z = Math.random() * (canvas?.width || window.innerWidth);
        this.px = 0; 
        this.py = 0;
        this.color = Math.random() > 0.8 ? '#d4af37' : '#00d4ff';
      }

      update() {
        // Accelerate based on mouse position
        const accel = (mouse.current.x / canvas!.width) * 5;
        this.z -= (velocity + accel);
        
        if (this.z <= 0) {
          this.z = canvas!.width;
          this.x = (Math.random() - 0.5) * canvas!.width * 2;
          this.y = (Math.random() - 0.5) * canvas!.height * 2;
        }
      }

      draw() {
        if (!ctx) return;
        const sx = (this.x / this.z) * canvas!.width + canvas!.width / 2;
        const sy = (this.y / this.z) * canvas!.height + canvas!.height / 2;
        const r = (1 - this.z / canvas!.width) * 3;

        if (this.px !== 0) {
          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = r;
          ctx.lineCap = 'round';
          ctx.moveTo(sx, sy);
          ctx.lineTo(this.px, this.py);
          ctx.stroke();
        }

        this.px = sx;
        this.py = sy;
      }
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 3, 8, 0.2)'; // Tail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    });

    resize();
    // FIXED: Now calling new Star() with no arguments, matching the constructor
    stars = Array.from({ length: starCount }, () => new Star());
    animate();
    
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#000308]" />;
};

export default WarpBackground;
