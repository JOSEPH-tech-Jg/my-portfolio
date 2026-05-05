'use client'
import React, { useEffect, useRef } from 'react';

const GravityBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const particleCount = 120;
    const proximityLimit = 150; // How close mouse needs to be to "capture" particles

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; color: string;
      angle: number; orbitRadius: number;
      isOrbiting: boolean;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.color = Math.random() > 0.5 ? '#00d4ff' : '#d4af37';
        this.angle = Math.random() * Math.PI * 2;
        this.orbitRadius = proximityLimit;
        this.isOrbiting = false;
      }

      update() {
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < proximityLimit) {
          // SATELLITE MODE: Revolve around the mouse
          this.isOrbiting = true;
          this.angle += 0.02; // Speed of revolution
          this.x = mouse.current.x + Math.cos(this.angle) * (distance * 0.98);
          this.y = mouse.current.y + Math.sin(this.angle) * (distance * 0.98);
        } else {
          // RANDOM MODE: Drift towards random points
          this.isOrbiting = false;
          this.x += this.vx;
          this.y += this.vy;

          // Bounce off edges
          if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
          if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.isOrbiting ? 15 : 5;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    });

    resize();
    init();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#000308] overflow-hidden">
      {/* Keeping your Cinematic Neural Web SVG here as a static layer */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
         <path d="M-100 400 Q 600 800 1300 400" stroke="#00d4ff" strokeWidth="2" fill="none" opacity="0.3" />
      </svg>
      
      {/* THE PARTICLE PHYSICS LAYER */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
};

export default GravityBackground;
