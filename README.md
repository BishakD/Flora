# Flora — Boutique Palazzo Hotel

A multi-page Next.js marketing and booking prototype for **Flora**, a fictional five-star boutique palazzo hotel concept in Florence.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Hero media

The supplied hero video is stored at `public/hero.mp4`. `components/Hero.tsx` uses it as a muted, looping, `playsInline` film and falls back to `public/images/hero-palazzo.jpg` when video cannot load or the visitor prefers reduced motion.

## Content and booking boundaries

- Property address, contact information, exact amenities and operating details remain visible placeholders because final hotel facts were not supplied.
- Room photography is licensed editorial placeholder material and is explicitly marked as swappable.
- Rates, date availability, cart actions and form submissions are UI demonstrations only. No inventory, payment, CRM or email provider is connected.
- Connect a real booking engine and replace all bracketed placeholders before launch.

## Key implementation

- Next.js App Router + TypeScript + Tailwind CSS
- Framer Motion for entrances, galleries and overlays
- GSAP + ScrollTrigger for scroll-scrubbed word reveals, image parallax and blur-to-sharp media
- Keyboard-operable galleries, room modal and calendar controls
- Reduced-motion fallbacks and responsive single-column mobile layouts
