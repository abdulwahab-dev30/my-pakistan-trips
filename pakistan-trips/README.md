# My Pakistan Trips — Luxury Travel Website

Award-winning premium React website with cinematic animations powered by Framer Motion and GSAP.

## Features

- **Cinematic Hero** — Staggered word-by-word text reveals, slow zoom background, floating location labels, premium scroll indicator
- **Advanced Scroll Animations** — Parallax image layers, staggered card entrances, elegant section reveals
- **Luxury Destination Cards** — Hover zooms, layered movement, sophisticated shadow transitions
- **Tour Filtering** — Smooth AnimatePresence + layout animations for category filters
- **Premium Gallery** — Masonry layout with full-screen animated lightbox (keyboard navigation)
- **FAQ Accordion** — Fluid height animations
- **Testimonial Carousel** — Smooth crossfade transitions
- **Elegant Loader** — Minimal mountain illustration + progress bar
- **Floating WhatsApp** — Subtle entrance + restrained pulse
- **Responsive** — Fully mobile-optimized with polished mobile menu
- **Accessibility** — Respects `prefers-reduced-motion`

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- Framer Motion
- GSAP (cinematic background zoom)
- Lucide React icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Design Notes

- Color palette: deep charcoal (#1A1612), warm gold (#C4A35A), cream (#F7F3EB)
- Typography: Cormorant Garamond (serif headings) + Outfit (body)
- Easing: custom cubic-bezier [0.22, 1, 0.36, 1] for premium feel
- Animations prioritize transform & opacity for 60fps performance
