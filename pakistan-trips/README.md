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


## Tour CMS setup

The private tour editor lives at `/admin/tours`; login is at `/admin/login`. There is no public signup page.

1. Create a Supabase project for My Pakistan Trips.
2. In Supabase SQL Editor, run `supabase/tour-cms.sql` from this repository.
3. In Supabase Auth, create the admin user privately (do not add a signup page to the website). Disable public signups in Auth settings.
4. Copy the admin user's UUID from Supabase Auth and run the membership insert shown at the end of `supabase/tour-cms.sql`.
5. Add these Vercel environment variables for the website project: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`). Use the Supabase Project URL and publishable/anon key; never expose a service-role key in Vite/client variables.
6. Redeploy the site after setting environment variables.
7. Log in at `/admin/login`, click **Import existing tours**, and then edit or publish packages. Tour data is stored in the Supabase `tours` table.

The admin UI supports tour title/slug, page H1, duration, departure, price and pricing notes, overview, best-time guidance, WhatsApp URL, SEO title/description, Cloudinary image tag, images, itinerary, attractions, hotels, included/excluded services, FAQs, and publish/draft status. The public tours listing, homepage cards, and tour detail route read published records from Supabase once configured.

**First-time setup note:** Until the Supabase project, table, environment variables, and admin membership are configured, the public site continues to use the existing local tour data. New CMS edits are not live until the project is connected and deployed.
