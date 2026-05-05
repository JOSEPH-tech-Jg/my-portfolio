'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Cursor from '../components/Cursor'

const NeuralBackground = () => (
  <div className="fixed inset-0 -z-10 bg-[#000308] overflow-hidden">
    {/* Atmospheric Depth Gradients */}
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,_rgba(0,212,255,0.1)_0%,_transparent_50%)]" />
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.05)_0%,_transparent_40%)]" />

    <svg 
      className="w-full h-full opacity-60" 
      viewBox="0 0 1200 800" 
      preserveAspectRatio="xMidYMid slice" 
      xmlns="http://w3.org"
    >
      <defs>
        {/* Neon Glow Filter */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Dynamic Multi-tone Gradient */}
        <linearGradient id="fiberFlow" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="20%" stopColor="#00d4ff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#00d4ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g filter="url(#neonGlow)">
        {/* Massive Primary Weaving Fibers */}
        {[...Array(12)].map((_, i) => (
          <path 
            key={`thick-${i}`} 
            d={`M -100 ${100 + i * 60} C 400 ${-100 + i * 20}, 800 ${900 - i * 20}, 1300 ${400 + i * 30}`}
            stroke="url(#fiberFlow)" 
            strokeWidth="2.5" 
            fill="none"
          >
            <animate 
              attributeName="stroke-dasharray" 
              values="0,1000; 1000,0; 0,1000" 
              dur={`${10 + i}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="opacity" 
              values="0.2;0.6;0.2" 
              dur={`${5 + i}s`} 
              repeatCount="indefinite" 
            />
          </path>
        ))}

        {/* Secondary Fine Detailed Strands */}
        {[...Array(20)].map((_, i) => (
          <path 
            key={`fine-${i}`} 
            d={`M -100 ${50 + i * 40} C 300 ${600 - i * 10}, 900 ${200 + i * 10}, 1300 ${750 - i * 20}`}
            stroke="#00d4ff" 
            strokeWidth="0.5" 
            fill="none" 
            opacity="0.2"
          >
            <animate 
              attributeName="d" 
              values={`
                M -100 ${50 + i * 40} C 300 ${600 - i * 10}, 900 ${200 + i * 10}, 1300 ${750 - i * 20};
                M -100 ${100 + i * 40} C 400 ${500 - i * 10}, 800 ${300 + i * 10}, 1300 ${700 - i * 20};
                M -100 ${50 + i * 40} C 300 ${600 - i * 10}, 900 ${200 + i * 10}, 1300 ${750 - i * 20}
              `} 
              dur={`${15 + i}s`} 
              repeatCount="indefinite" 
            />
          </path>
        ))}
      </g>

      {/* Floating Data Synapses (The "Glow Spots") */}
      <circle cx="20%" cy="40%" r="4" fill="#fff" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="70%" cy="60%" r="3" fill="#d4af37" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" begin="1s" />
      </circle>
      <circle cx="45%" cy="20%" r="2" fill="#00d4ff" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" begin="2s" />
      </circle>
    </svg>
  </div>
);




const NeuralIcon= () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 800 450" 
    preserveAspectRatio="xMidYMid slice" 
    xmlns="http://w3.org"
  >
    <defs>
      <filter id="coreRefraction" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <linearGradient id="cyanFiber" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
        <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />
        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="amberFiber" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
        <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* BACKGROUND: Pulsing Glow */}
    <circle cx="400" cy="225" r="180" fill="#00d4ff" fillOpacity="0.08" filter="url(#coreRefraction)">
      <animate attributeName="r" values="160;190;160" dur="4s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.05;0.1;0.05" dur="4s" repeatCount="indefinite" />
    </circle>

    {/* THICK FIBERS - Cyan (Right) */}
    <g stroke="url(#cyanFiber)" fill="none" filter="url(#coreRefraction)">
      <path id="pathCyan1" d="M 400 225 C 550 50, 750 150, 850 180" strokeWidth="4" />
      <path id="pathCyan2" d="M 400 225 C 500 350, 700 300, 850 250" strokeWidth="3" opacity="0.7" />
    </g>

    {/* THICK FIBERS - Amber (Left) */}
    <g stroke="url(#amberFiber)" fill="none" filter="url(#coreRefraction)">
      <path id="pathAmber1" d="M 400 225 C 250 50, 50 150, -50 180" strokeWidth="4" />
      <path id="pathAmber2" d="M 400 225 C 300 350, 100 300, -50 250" strokeWidth="3" opacity="0.7" />
    </g>

    {/* RANDOM MOVING PARTICLES (Data Packets) */}
    <g filter="url(#coreRefraction)">
      {/* Particle 1: Moves out to the right */}
      <circle r="3" fill="#ffffff">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#pathCyan1" />
        </animateMotion>
        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Particle 2: Moves out to the left */}
      <circle r="3" fill="#d4af37">
        <animateMotion dur="4s" repeatCount="indefinite" begin="1s">
          <mpath href="#pathAmber1" />
        </animateMotion>
        <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* Particle 3: Fast moving cyan node */}
      <circle r="2" fill="#00d4ff">
        <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s">
          <mpath href="#pathCyan2" />
        </animateMotion>
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Particle 4: Random drifting center node */}
      <circle r="2" fill="#ffffff">
        <animate attributeName="cx" values="380;420;380" dur="5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="210;240;210" dur="7s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* CENTRAL CORE: Rotating Mesh */}
    <g filter="url(#coreRefraction)">
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 400 225" to="360 400 225" dur="20s" repeatCount="indefinite" />
        <ellipse cx="400" cy="225" rx="60" ry="100" stroke="#00d4ff" fill="none" strokeWidth="2" opacity="0.9" transform="rotate(0 400 225)" />
        <ellipse cx="400" cy="225" rx="60" ry="100" stroke="#d4af37" fill="none" strokeWidth="2" opacity="0.9" transform="rotate(45 400 225)" />
        <ellipse cx="400" cy="225" rx="60" ry="100" stroke="#00d4ff" fill="none" strokeWidth="2" opacity="0.9" transform="rotate(90 400 225)" />
        <ellipse cx="400" cy="225" rx="60" ry="100" stroke="#d4af37" fill="none" strokeWidth="2" opacity="0.9" transform="rotate(135 400 225)" />
      </g>
      
      {/* Heartbeat center */}
      <circle cx="400" cy="225" r="10" fill="#ffffff" filter="url(#coreRefraction)">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);





const ChatIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 500 400" 
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://w3.org"
  >
    <defs>
      {/* Cinematic Glow Filters */}
      <filter id="cinematicGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Pulsing Path Gradient */}
      <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
        <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />
        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
      </linearGradient>

      {/* Glassmorphism Fill */}
      <linearGradient id="glassFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#111827" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#030712" stopOpacity="0.95" />
      </linearGradient>
    </defs>

    {/* BACKGROUND: Cinematic "Digital Mist" */}
    <circle cx="250" cy="200" r="150" fill="#00d4ff" fillOpacity="0.03" filter="url(#cinematicGlow)" />

    {/* CINEMATIC CONNECTORS: Pulsing Logic Paths */}
    <g fill="none" strokeWidth="2" opacity="0.6">
      {/* Path 1: Top to Center */}
      <path id="cinemPath1" d="M 150 80 L 150 150 L 220 150" stroke="#1f2937" />
      <path d="M 150 80 L 150 150 L 220 150" stroke="url(#pulseGradient)" strokeWidth="3" filter="url(#cinematicGlow)">
        <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Path 2: Center to Right */}
      <path id="cinemPath2" d="M 330 180 L 380 180 L 380 250" stroke="#1f2937" />
      
      {/* Path 3: Horizontal Base */}
      <path id="cinemPath3" d="M 80 300 L 420 300" stroke="#1f2937" opacity="0.3" />
    </g>

    {/* BUBBLE 1: The "Input" (Top Left - Cyan) */}
    <g filter="url(#cinematicGlow)" transform="translate(60, 30)">
      <path d="M 0 10 Q 0 0 10 0 L 110 0 Q 120 0 120 10 L 120 50 Q 120 60 110 60 L 25 60 L 5 80 L 5 60 Q 0 60 0 50 Z" 
            fill="url(#glassFill)" stroke="#00d4ff" strokeWidth="1.5" />
      {/* Animated Text Lines */}
      <rect x="20" y="20" width="80" height="4" rx="2" fill="#00d4ff" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
      </rect>
    </g>

    {/* BUBBLE 2: The "Process" (Center - Cyan/Gold) */}
    <g filter="url(#cinematicGlow)" transform="translate(200, 130)">
      <path d="M 0 10 Q 0 0 10 0 L 140 0 Q 150 0 150 10 L 150 80 Q 150 90 140 90 L 25 90 L 5 110 L 5 90 Q 0 90 0 80 Z" 
            fill="url(#glassFill)" stroke="#00d4ff" strokeWidth="2.5" />
      {/* "Thinking" Dots Animation */}
      <circle cx="30" cy="30" r="3" fill="#d4af37"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" /></circle>
      <circle cx="50" cy="30" r="3" fill="#d4af37"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.2s" repeatCount="indefinite" /></circle>
      <circle cx="70" cy="30" r="3" fill="#d4af37"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.4s" repeatCount="indefinite" /></circle>
      
      <rect x="20" y="55" width="110" height="4" rx="2" fill="#00d4ff" opacity="0.7">
        <animate attributeName="width" values="0;110" dur="2s" repeatCount="indefinite" />
      </rect>
    </g>

    {/* BUBBLE 3: The "Output" (Bottom Right - Gold) */}
    <g filter="url(#cinematicGlow)" transform="translate(300, 260)">
      <path d="M 0 10 Q 0 0 10 0 L 120 0 Q 130 0 130 10 L 130 70 Q 130 80 120 80 L 25 80 L 5 100 L 5 80 Q 0 80 0 70 Z" 
            fill="url(#glassFill)" stroke="#d4af37" strokeWidth="2" />
      <rect x="20" y="25" width="90" height="4" rx="2" fill="#d4af37" opacity="0.6" />
      <rect x="20" y="45" width="60" height="4" rx="2" fill="#d4af37" opacity="0.6" />
    </g>

    {/* CINEMATIC DATA NODES: Floating light fragments */}
    <g filter="url(#cinematicGlow)">
      <circle r="4" fill="#ffffff">
        <animateMotion dur="3s" repeatCount="indefinite" path="M 150 80 L 150 150 L 220 150" />
      </circle>
      <circle r="3" fill="#00d4ff">
        <animateMotion dur="5s" repeatCount="indefinite" path="M 330 180 L 380 180 L 380 250" />
      </circle>
    </g>
  </svg>
);


const PhoneStackIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 600 350" 
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://w3.org"
  >
    <defs>
      {/* Cinematic Shadow & Glow */}
      <filter id="deviceGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Screen Reflection Gradient */}
      <linearGradient id="screenGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* Animated Sweep Gradient */}
      <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* LAYER 1: Far Left & Far Right (Deep Background) */}
    <g opacity="0.4" transform="scale(0.7) translate(100, 150)">
       <rect x="0" y="0" width="100" height="180" rx="15" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
       <rect x="8" y="10" width="84" height="160" rx="10" fill="#020617" />
    </g>
    <g opacity="0.4" transform="scale(0.7) translate(650, 150)">
       <rect x="0" y="0" width="100" height="180" rx="15" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
       <rect x="8" y="10" width="84" height="160" rx="10" fill="#020617" />
    </g>

    {/* LAYER 2: Mid Left & Mid Right (Secondary Devices) */}
    <g opacity="0.7" transform="scale(0.85) translate(150, 60)">
       <rect x="0" y="0" width="110" height="210" rx="18" fill="#1e293b" stroke="#334155" strokeWidth="2" />
       <rect x="10" y="12" width="90" height="186" rx="12" fill="#020617" />
       {/* Button details */}
       <circle cx="55" cy="198" r="6" fill="#1e293b" />
    </g>
    <g opacity="0.7" transform="scale(0.85) translate(460, 60)">
       <rect x="0" y="0" width="110" height="210" rx="18" fill="#1e293b" stroke="#334155" strokeWidth="2" />
       <rect x="10" y="12" width="90" height="186" rx="12" fill="#020617" />
       <rect x="40" y="6" width="30" height="2" rx="1" fill="#334155" />
    </g>

    {/* LAYER 3: The Primary Center Device (Hero) */}
    <g filter="url(#deviceGlow)" transform="translate(235, 30)">
      {/* Device Frame */}
      <rect x="0" y="0" width="130" height="260" rx="22" fill="#1e293b" stroke="#00d4ff" strokeWidth="2.5" />
      {/* Black Screen */}
      <rect x="8" y="10" width="114" height="240" rx="16" fill="#020617" />
      
      {/* Dynamic Screen Content */}
      <rect x="8" y="10" width="114" height="240" rx="16" fill="url(#screenGlass)" />
      
      {/* ANIMATION: The "Glass Sweep" Reflection */}
      <rect x="0" y="0" width="130" height="260" rx="22" fill="url(#sweep)" pointerEvents="none">
        <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" from="-200,-200" to="400,400" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* Sensor Notch */}
      <path d="M 40 10 L 90 10 L 85 22 Q 85 25 82 25 L 48 25 Q 45 25 45 22 Z" fill="#1e293b" />
      
      {/* System Sync Pulse (Amber/Gold center) */}
      <circle cx="65" cy="130" r="10" fill="#d4af37" fillOpacity="0.1">
        <animate attributeName="r" values="8;15;8" dur="3s" repeatCount="indefinite" />
        <animate attributeName="fillOpacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="65" cy="130" r="3" fill="#d4af37" filter="url(#deviceGlow)" />
    </g>

    {/* Ambient Particles */}
    <g opacity="0.5">
      <circle r="2" fill="#00d4ff">
        <animate attributeName="cx" values="100;500" dur="10s" repeatCount="indefinite" />
        <animate attributeName="cy" values="100;250" dur="10s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);



const CubesIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 600 400" 
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://w3.org"
  >
    <defs>
      <filter id="blockGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Surface Gradients for Depth */}
      <linearGradient id="cyanFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      
      <linearGradient id="amberFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* CONNECTION RODS - Diagonal Backbone */}
    <g stroke="#334155" strokeWidth="2" fill="none">
      <path d="M 50 350 L 550 50" opacity="0.4" />
      <path d="M 300 100 L 300 300" opacity="0.3" /> {/* Vertical Center Axis */}
      
      {/* Animated Data Packets on the Rods */}
      <circle r="2" fill="#00d4ff">
        <animateMotion dur="4s" repeatCount="indefinite" path="M 50 350 L 550 50" />
      </circle>
    </g>

    {/* ISOMETRIC BLOCKS GENERATOR FUNCTION */}
    {/* Let's define the blocks based on the image positions */}
    
    {/* Lower Left Block */}
    <g transform="translate(100, 300)">
      <path d="M 0 -20 L 30 0 L 30 40 L 0 20 Z" fill="#1e293b" stroke="#334155" /> {/* Left Face */}
      <path d="M 30 0 L 60 -20 L 60 20 L 30 40 Z" fill="#0f172a" stroke="#334155" /> {/* Right Face */}
      <path d="M 0 -20 L 30 -40 L 60 -20 L 30 0 Z" fill="#334155" stroke="#475569" /> {/* Top Face */}
    </g>

    {/* Central Vertical Pillar (The Hero Section) */}
    <g filter="url(#blockGlow)">
      {/* Top Gold Block */}
      <g transform="translate(270, 100)">
        <path d="M 0 -20 L 30 0 L 30 40 L 0 20 Z" fill="#d4af37" fillOpacity="0.3" stroke="#d4af37" />
        <path d="M 30 0 L 60 -20 L 60 20 L 30 40 Z" fill="#d4af37" fillOpacity="0.1" stroke="#d4af37" />
        <path d="M 0 -20 L 30 -40 L 60 -20 L 30 0 Z" fill="#f0e6bc" fillOpacity="0.5" stroke="#fff" />
        {/* Lego Studs */}
        <ellipse cx="20" cy="-25" rx="5" ry="3" fill="#fff" opacity="0.8" />
        <ellipse cx="40" cy="-25" rx="5" ry="3" fill="#fff" opacity="0.8" />
      </g>

      {/* Middle Cyan Block */}
      <g transform="translate(270, 200)">
        <path d="M 0 -20 L 30 0 L 30 40 L 0 20 Z" fill="#00d4ff" fillOpacity="0.2" stroke="#00d4ff" />
        <path d="M 30 0 L 60 -20 L 60 20 L 30 40 Z" fill="#00d4ff" fillOpacity="0.1" stroke="#00d4ff" />
        <path d="M 0 -20 L 30 -40 L 60 -20 L 30 0 Z" fill="#00d4ff" fillOpacity="0.4" stroke="#fff" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </g>

      {/* Bottom Gold Block */}
      <g transform="translate(270, 300)">
        <path d="M 0 -20 L 30 0 L 30 40 L 0 20 Z" fill="#d4af37" fillOpacity="0.3" stroke="#d4af37" />
        <path d="M 30 0 L 60 -20 L 60 20 L 30 40 Z" fill="#d4af37" fillOpacity="0.1" stroke="#d4af37" />
        <path d="M 0 -20 L 30 -40 L 60 -20 L 30 0 Z" fill="#f0e6bc" fillOpacity="0.5" stroke="#fff" />
      </g>
    </g>

    {/* Far Right Block */}
    <g transform="translate(440, 100)">
      <path d="M 0 -20 L 30 0 L 30 40 L 0 20 Z" fill="#1e293b" stroke="#334155" />
      <path d="M 30 0 L 60 -20 L 60 20 L 30 40 Z" fill="#0f172a" stroke="#334155" />
      <path d="M 0 -20 L 30 -40 L 60 -20 L 30 0 Z" fill="#334155" stroke="#475569" />
    </g>

    {/* Vertical Connectors (Double Rods) */}
    <g stroke="#00d4ff" strokeWidth="1.5" opacity="0.4">
      <line x1="290" y1="120" x2="290" y2="180" />
      <line x1="310" y1="120" x2="310" y2="180" />
      <line x1="290" y1="220" x2="290" y2="280" />
      <line x1="310" y1="220" x2="310" y2="280" />
    </g>
  </svg>
);


export default function Home() {
  const heroRef = useRef(null)
  const portfolioRef = useRef(null)
  const ctaRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true })
  const portfolioInView = useInView(portfolioRef, { once: true })
  const ctaInView = useInView(ctaRef, { once: true })

  const portfolioHighlights = [
    {
      title: 'NEURAL AUTOMATION:',
      subtitle: 'Freeing Human Time.',
      description: 'Advanced AI-powered systems that automate complex workflows.',
      icon: NeuralIcon
    },
    {
      title: 'LLM INTEGRATION:',
      subtitle: 'Instant, Human-Centric Answers.',
      description: 'Seamless language model integration for intelligent responses.',
      icon: ChatIcon
    },
    {
      title: 'WEB APPLICATIONS:',
      subtitle: 'Responsive & Intuitive Journeys.',
      description: 'Modern web experiences that adapt to user needs.',
      icon: PhoneStackIcon
    },
    {
      title: 'JAVA BACKEND:',
      subtitle: 'Reliable, Scalable Architecture.',
      description: 'Robust backend systems built for performance and scale.',
      icon: CubesIcon
    }
  ]

  return (
    <>
      <Cursor />
      {/* 
          EXACT BACKGROUND ALLOCATION: 
          Replaced the old static shapes with the Cinematic Neural Web 
      */}
      <NeuralBackground />

      <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30">
        
        {/* Navigation Header */}
        <header className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-[0.3em] text-white">JG</div>
            <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Link href="/vision" className="hover:text-amber-400 transition-all duration-300 text-gray-400 border border-white/20 px-4 py-1 rounded-full hover:border-amber-400">Vision</Link>
              <a href="#impact" className="hover:text-amber-400 transition-all duration-300 text-gray-400 border border-white/20 px-4 py-1 rounded-full hover:border-amber-400">Impact</a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center z-10 px-6 max-w-6xl"
          >
            <p className="text-[10px] tracking-[0.4em] text-amber-500 mb-10 uppercase font-bold">
              Joseph githinji | Application Developer & AI Innovator
            </p>
            <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              I BUILD DIGITAL EXPERIENCES
              <br />
              THAT BRIDGE THE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500">HUMAN-AI DIVIDE.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
              Translating Complex Neural Networks and LLMs into Practical, Seamless Applications.
            </p>
            <p className="text-sm text-gray-500 font-mono tracking-widest uppercase">
              Crafting clean code that just works.
            </p>
          </motion.div>
        </section>

        {/* Portfolio Highlights */}
        <section ref={portfolioRef} id="impact" className="relative py-20 px-4 z-20">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-sm font-light tracking-[0.2em] mb-16 text-gray-400 uppercase"
            >
              Portfolio Highlights
            </motion.h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
              {portfolioHighlights.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={portfolioInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative rounded-xl border border-blue-900/50 hover:border-amber-400/50 transition-all duration-300 overflow-hidden bg-gradient-to-br from-blue-950/30 to-slate-950/30 backdrop-blur-sm p-6"
                  >
                    {/* Icon Area */}
                    <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl bg-[#0a0f1a]">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-50"/>
                      <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <IconComponent />
                      </div>
                    </div>
                    
                    {/* Text Content */}
                    <h3 className="text-sm font-semibold text-white mb-2 tracking-wide uppercase">{item.title}</h3>
                    <p className="text-amber-400 mb-3 text-xs font-light tracking-wide uppercase">{item.subtitle}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* CTA Button */}
            <motion.div
              ref={ctaRef}
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex justify-center items-center gap-6"
            >
                <Link
                href="/cv"
                className="border-2 border-amber-400 text-amber-400 px-8 py-3 rounded-full font-light tracking-widest hover:bg-amber-400/10 transition-all duration-300 text-xs uppercase shadow-lg hover:shadow-amber-400/20"
              >
                View My Full CV & Hire Me
              </Link>
              <div className="text-4xl text-amber-400 font-light">✦</div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}