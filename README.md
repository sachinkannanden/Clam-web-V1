# clam — comfortable clothing

The website for **clam**, a comfort-first clothing label. Built as an experience first and a shop second.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
npm run lint       # TypeScript check
```

Needs Node 20+. Deploys as-is to Vercel (import the folder, no settings needed).

## What's where

| Path | What |
|---|---|
| `app/page.tsx` | Home: the 8-part experience |
| `components/home/` | Hero (one day, one tee), Manifesto, TouchTest (3D tee), Promises, Film, People, DropList, Breathe |
| `components/three/` | The interactive 3D tee (Blender model `public/models/clam-tee.glb`, recoloured live). Breathes, sways, stretches when pulled |
| `components/ui/` | Nav, bag drawer, footer, wordmark (clam ↔ calm), cursor, calm meter, product page, `Seam.tsx` (the needle-and-thread motif used across the site) |
| `lib/products.ts` | **The catalogue.** Names, colours, prices, fabric copy. Edit here |
| `lib/bag.ts` | Bag state (saved in the visitor's browser) + `startCheckout()` payment seam |
| `app/globals.css` | Design tokens: colours, type scale, spacing, easing |
| `public/img/` | Placeholder photos (Unsplash). Swap with real shoots, same file names |
| `public/tees/` | Product renders of the 3D tee in each colour |
| `public/video/breeze.mp4` | Brand-film placeholder clip (Pexels) |

## Before launch (placeholders to replace)

- Photos and the film clip: replace files in `public/img` and `public/video` (credits are listed on `/story#credits`).
- Product renders: replace `public/tees/*.webp` with real product shots (700×700, transparent or on the tee's field colour).
- Contact details: `hello@wearclam.in`, WhatsApp `+91 00000 00000`, `@wearclam` (search the code for them).
- Fabric facts, size chart, shipping/returns, privacy and terms copy.
- Payments: wire Razorpay or Shopify into `startCheckout()` in `lib/bag.ts` and the `/checkout` page. Until then checkout sends the order over WhatsApp.
- Newsletter: connect the footer form to your email provider.
- Domain: `metadataBase` in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` assume `wearclam.in`.

## 3D and renders (Blender)

Everything 3D comes from `blender/clam-tee.blend` (scenes: main tee, Shell). Made with the Blender MCP.

| Output | Where it's used |
|---|---|
| `public/models/clam-tee.glb` (~430 KB) | The interactive tee on the home page and every product page. The site recolours it live and adds breathing, sway and the fabric stretch in a shader. |
| `public/tees/<slug>-front/three/back.webp` | The drop list, bag, checkout, product "Every angle" gallery, next-tee card, social images |
| `public/img/collar-detail.webp` | "Soft first" card and the product gallery close-up |
| `public/video/sway.mp4` | "Cut loose" card (the tee turning slowly side to side) |
| `public/brand/shell.webp`, `shell-96.png` | 404 page and the calm meter |
| `public/brand/needle.webp`, `button.webp` (from `blender/notions.blend`) | The sewing motif: needle and four-hole button |

To add a colour or a new product: open the .blend, set the Fabric/Rib/Inside base colour, render front (rig 0°), three-quarter (rig −30°) and back (rig 180°) at 1200×1200 with a transparent film, then crop to 900×900 WebP.
Renders are clearly placeholders for real product photography on listings; the interactive 3D tee stays.

## Project docs

`docs/` holds the working record: `site-map-as-built.md` (every section by ID), `change-log.md` (every change since the v1.0 baseline and the checks run), `change-protocol.md` and `skills-playbook.md`.
