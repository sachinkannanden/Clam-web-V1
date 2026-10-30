# CLAM — Site map as built (baseline v1.0, 29 Oct 2026)

**Status:** about 60% complete (Sachin, 29 Oct). Sachin approved this as the baseline. From now on we don't rebuild or restyle the site; we add, change or remove specific sections inside it (see `change-protocol.md`).
Each section has an **ID** (e.g. `HOME-3`) so requests can name it exactly. Code: `~/Claude/Projects/clam-website`.

## Global (every page)
| ID | Part | Files | What it does |
|---|---|---|---|
| G-NAV | Nav bar | `components/ui/Nav.tsx`, `app/chrome.css` (nav) | Wordmark (clam ↔ calm on hover), The drop / Our story / Say hello, Bag (count). Hides on scroll down, shows on focus. Pearl over dark product fields (an item that straddles the edge gets a pearl ground). Phone: Menu → full-screen dialog sheet (Escape, focus trap, page behind inert). |
| G-BAG | Bag drawer | `components/ui/BagDrawer.tsx`, `lib/bag.ts`, `app/chrome.css` (bag drawer) | Slide-in dialog; qty, remove, CALMDOWN line, total, Check out. Persists in localStorage. |
| G-FOOT | Footer | `components/ui/Footer.tsx`, `app/chrome.css` (footer) | Knit photo + "Join the slow lane" newsletter (stub), links, contacts (placeholders), giant clam wordmark, legal + photo credits link. |
| G-METER | Calm meter | `components/ui/CalmMeter.tsx`, `app/chrome.css` (calm meter) | Blender shell, bottom right: fills when you scroll slowly; "Easy. Nothing's on fire." when rushing; "You're officially calm." when full. Hidden near the footer, on phone product pages and at checkout. Sleeps when idle. |
| G-CURSOR | Custom cursor | `components/ui/Cursor.tsx`, `app/chrome.css` (cursor) | Desktop only: dot that grows into a label over `[data-cursor]`. |
| G-SKIP | Skip link, Lenis, providers | `app/layout.tsx`, `components/ui/Providers.tsx` | Smooth scroll (off under reduced motion), reveal observer for `[data-reveal]`. `suppressHydrationWarning` on html/body (browser extensions). |
| G-SEAM | Sewing motif | `components/ui/Seam.tsx`, `NapThread.tsx`, `app/globals.css` (seam) | Shared needle-and-thread engine (`useSeam`, `<Seam>`, `<HoverSeam>`). Used in HOME-1 hover, HOME-2, HOME-3/HOME-6 join seams, HOME-6 portrait hover, STORY hero, 404. Assets `public/brand/needle.webp`, `button.webp` from `blender/notions.blend`. |
| G-TOKENS | Design tokens | `app/globals.css` | Colours pearl/shell/sand/blush/ink/ink-soft/tide; Fraunces (display) + Instrument Sans (text); 5 type steps; easings; buttons, links, reveal system. |

## Home `/` (`app/page.tsx`, styles in `app/home.css`)
| ID | Section | Component | Content and interaction |
|---|---|---|---|
| HOME-1 | Hero: "Wear it / anywhere." | `Hero.tsx` | A sentence split by a frame. The reel shows one day (07:10 bed → 23:05 studio), driven by scroll on desktop and landscape tablets; on phones and upright tablets it stacks and autoplays with "Pause the day". Sub-line + "See the drop". Photos in `DAY` (also reused on the product page's "Wear it to"). Desktop hover (`FrameHover.tsx`): a pearl seam is sewn round the photo and the caption becomes a sewn-on label. |
| HOME-2 | Manifesto | `Manifesto.tsx`, `Stitch.tsx` | "Comfy was never meant to stay home." Words darken with scroll (200svh pin); small photos pass; blush field. A needle sews a tailored seam round the sentence from a knot and closes it with a button (scroll-scrubbed; straight left-margin seam on phones). |
| HOME-3 | Touch test | `TouchTest.tsx`, `components/three/Tee.tsx` | 3D Blender tee on a knit field tinted to the chosen tee. Drag to stretch (a counter tracks it), Turn/Poke keys, 8 colour-tees, size picker (no default size), "Pick a size" → Add. Falls back to a still render on slow devices. |
| HOME-4 | Made slowly (promises) | `Promises.tsx` | Four cards dealt into a fan: Soft first (collar render), Cut loose (sway loop + Pause), Fair price, Made nearby. Ink field. |
| HOME-5 | A very short film | `Film.tsx` | Intro + three full-screen sticky frames (park, curtain video with Play/Pause, sofa) with time captions. |
| HOME-6 | For the unhurried | `People.tsx` | Four portraits (`p6`, `p2`, `p4`, `field`) in a staggered row that drift slightly; persona captions. |
| HOME-7 | The first drop | `DropList.tsx` (also `/drop`) | Sticky three-quarter render on the tee's colour field + list of 8. The row opens on scroll/hover/focus (and stays put once chosen); size radio group; Add; Details. |
| HOME-8 | Breathe out first | `Breathe.tsx` | Photo `unwind.webp` + hold-to-breathe ring (4 s; Space/Enter work) → code CALMDOWN (10% off first tee) saved to the bag; "Take the code anyway"; "Or skip… see the drop". |

## Other pages (styles in `app/pages.css` unless noted)
| ID | Page | Files | Sections |
|---|---|---|---|
| DROP | `/drop` | `app/drop/page.tsx` | DropList (standalone h1) + "Finding your size" table (`SIZE_CHART` in `lib/products.ts`). |
| PDP | `/tee/[slug]` ×8 | `app/tee/[slug]/page.tsx`, `components/ui/ProductView.tsx` | PDP-1 stage (3D tee on colour field) + info (name, line, price, the rest of the drop by colour, size picker + fit line, Add, accordions: story / fabric / size guide / care); PDP-2 Every angle (front, three, back renders + collar detail); PDP-3 Wear it to (day photos); PDP-4 Next tee card; phone buy bar. JSON-LD Product + OG. |
| STORY | `/story` | `app/story/page.tsx`, `components/ui/Credits.tsx` | Hero "Calm, rearranged." (lounge photo); Why the name; The barrier (split); What we care about (4 values); Photo credits (folded). |
| CHECKOUT | `/checkout` | `app/checkout/page.tsx`, `layout.tsx` | Lines with qty/remove, CALMDOWN line, total, 3 steps, "Order on WhatsApp" (pre-written message). Empty state shows the photo plus any saved code. `startCheckout()` in `lib/bag.ts` is the payment seam. |
| CONTACT | `/contact` | `app/contact/page.tsx`, `layout.tsx` | Curtain loop (Pause), email / WhatsApp / Instagram (placeholders), mailto form with an inline error. |
| CARE / PRIVACY / TERMS | `/care` `/privacy` `/terms` | `components/ui/TextPage.tsx` | Text pages with a picture; copy is placeholder (review before launch). |
| 404 | not found | `app/not-found.tsx` | "This page went to take a nap." + floating Blender shell. |
| (internal) | `/render` | `app/render/page.tsx` | Tool page used to render the tee; not linked. |
| SEO | — | `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` metadata, `public/og.jpg` | |

## Data and assets
- `lib/products.ts`: 8 tees (slug, name, colour, hex, field, ink, gsm, price, line, story), `SIZES`, `SIZE_CHART`, `teeImg(slug, view)`.
- `lib/bag.ts`: bag store, `CALM_CODE`, `bagDiscount`, `startCheckout` (stub).
- `public/tees/<slug>-{front,three,back}.webp` (Blender, colour-calibrated), `public/models/clam-tee.glb`, `public/video/{sway,breeze}.mp4`, `public/brand/shell*`, `public/img/*` (Unsplash placeholders; credits in STORY).
- Blender source: `blender/clam-tee.blend` (`clam_cal2(slug, hex)` calibrates the colours; export only `TeeWeb`).

## Housekeeping notes (not urgent)
- `_to_delete/` and old `public/tees/*.png` on Sachin's PC can be deleted.
- Before launch: real photos, contacts, fabric and size facts, policy copy, payments, newsletter, domain, host (Vercel for image optimisation and 404 mapping).
