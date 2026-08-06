# Joseph Githinji — Cybersecurity Engineer Portfolio

A professional, denoised cybersecurity portfolio built with Next.js, TypeScript, Tailwind CSS and Framer Motion. Clean dark aesthetic with focused, low-noise motion.

## Pages

- `/` — Home: capabilities, "What I Do" domain library, expertise, experience timeline, selected work and contact
- `/cv` — Professional cybersecurity resume

## What I Do section

The home page includes an animated **What I Do** section that visualises the 16-domain, ~28,900-line cybersecurity library maintained at [`cybersecurity_complete/`](cybersecurity_complete/INDEX.md). Domains are grouped by practice area:

- **Foundations & Core** — security foundations, cryptography, networking & infrastructure
- **Domain Mastery** — web/app, cloud & containers, endpoint & mobile, IAM, IoT/OT/ICS
- **Operations & Defense** — SOC & threat hunting, incident response & forensics, threat intelligence
- **Governance & Program** — GRC, security awareness
- **Offense & Specialized** — offensive security & red team, emerging tech security

Each card shows the domain, its coverage and a line-count badge, with scroll-triggered animations and hover glow.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Custom canvas network background + type writer terminal copy components

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deploy

Deploy to Vercel, Netlify, or any static hosting service.
