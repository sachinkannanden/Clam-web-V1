# CLAM — Skills playbook (checked 28 Oct 2026, Blender added 29 Oct, verification rule 29 Oct, critique method 29 Oct, Humanizer added 30 Oct)

All skills load and their scripts run in Claude's cloud workspace (Node 22 + Chromium).
Sachin does not need to name them each time; Claude invokes them at the right steps.

## Standing rule #1: full verification after EVERY change (Sachin, 29 Oct). Not optional.
After any change to the site (code, copy, images, Blender assets, anything), and before reporting "done":
1. **Taste**:
   - `lint.mjs` on source + `inspect.mjs` on **every affected page** at 1440/768/390 (home, drop, a product page, story, contact, care, checkout, 404 when shared parts change).
   - Open and look at every screenshot. 0 FAIL.
   - Then score the screenshots with `references/critique.md` (ROUND n: design/usability/creativity/content + caps). The score, not the meter, is the grade.
2. **Impeccable**:
   - `critique` = two isolated sub-agents (A: design review without detector output; B: `impeccable detect` + live overlay), then synthesize.
   - `audit` = `reference/audit.md` with browser evidence (keyboard, focus, contrast, reflow 320/360, reduced motion, perf).
   - Fix the P0/P1s.
3. **Emil**: Before/After/Why table for every animation/interaction on the site (UI < 300ms, exit faster than enter, custom easing, transform/opacity only, hover gated, reduced motion, no keyframes on rapid triggers).
4. **Touch**: synthesized touch (Playwright context `hasTouch`, CDP `Input.dispatchTouchEvent`) on the 3D tee. A horizontal drag stretches; a vertical swipe scrolls; nothing sticks on touchcancel.
5. **Humanizer** (any new or changed copy): rewrite AI-writing tells (not-X-but-Y, one-line closers, forced triads, sayings) without changing what the copy says. Keep one joke per section and the brand's real beliefs (voice-and-copy.md).
6. **Playwright MCP on Sachin's computer (real GPU)**:
   - Load the built site, scroll every section, check console errors, the 3D tee renders and responds, videos play, the bag works, phone width.
   - Before reading fps, make sure the browser window is not minimized (CDP `Browser.setWindowBounds` → normal). A minimized window reads ~2 fps and looks like a site regression.
7. Fix what's found, re-run the checks, then report exactly which checks ran and their results.
Never claim a check that didn't run.

## Standing rule #2: use Blender MCP whenever 3D or rendered imagery is needed (Sachin, 29 Oct)
- Use it for:
  - 3D models for the web (GLB, < ~1 MB, clean UVs for live recolour)
  - product renders for every colour/view, and re-renders for new colours
  - motion loops (< ~1.5 MB)
  - brand objects (shell) and OG images
- Blender must be open (MCP server localhost:9876). Save `.blend` + outputs in `~/Claude/Projects/clam-website/blender/`. Never present a render as a real photo.
- Colour: `clam_cal2(slug, hex)` calibrates the chest to the catalogue hex (Standard view transform).
- Export the web model from `TeeWeb` only: `export_scene.gltf(use_selection=True, use_active_scene=True, export_materials='NONE')`.

## What each tool is for
| Tool | Role | Key tools |
|---|---|---|
| **Taste** | Art direction + anti-slop gate; real-browser inspector; scored critique | `draw.mjs`, `assets.mjs`, `lint.mjs`, `inspect.mjs`, `references/critique.md` |
| **Impeccable** | Design-director passes. Home = Persuade/Experience mode | `impeccable detect` (a URL needs `PUPPETEER_EXECUTABLE_PATH=/tmp/claude-0/chrome.sh`), critique, audit, polish, harden, optimize, animate |
| **Emil Kowalski** | Motion + interaction craft | Before/After/Why tables |
| **Humanizer** | Copy check: removes AI-writing tells from site copy | `humanizer` skill |
| **Blender MCP** | All 3D assets | `execute_blender_code`, renders |
| **Playwright MCP** (Sachin's PC) | Real-device/real-GPU verification; also fetches Unsplash placeholders (the cloud can't reach Unsplash) | navigate, screenshot, evaluate, run_code |

## How the Playwright check is run
1. The cloud builds a static export (`next build` with `CLAM_EXPORT=1` → `out/`).
2. It is copied to `~/Claude/Projects/clam-website/.preview/`.
3. Playwright on Sachin's PC serves it with `context.route('http://clam.preview/**')` → `route.fulfill({ path })` from that folder. Re-add the route after a browser restart.

## Conflicts resolved (Taste house rules win; brief wins on content)
- Palette: pearl/shell/sand/blush grounds, ink, deep "tide" accent (no cream + terracotta).
- Fonts: Fraunces + Instrument Sans; no monospace.
- Banned: index numerals, tiny tracked caps, hairline rules, accent words, eyebrows, gradients (except photo scrims), resting shadows, glass/pill nav, full-screen preloaders.
- Motion: UI 100–300ms, drawers open ~460ms / close ~300ms, hover gated, transform/opacity only.
- Imagery floor: ≥ 4 real pictures + one moving clip per landing page. People in pictures wear plain tees.

## Skills evaluated and not used for the website
- **Anatomy** (isometric technical figures) and **img2threejs** (photo → procedural Three.js), 29 Oct: wrong look for the brand, and Blender already covers 3D.
- **HyperFrames** (+ hyperframes-cli, hyperframes-registry), **media-use**, **figma**, **slideshow** and **remotion-to-hyperframes**, 30 Oct:
  - They make rendered videos or decks, while the site is a live page.
  - Optional later, off-site only: captions or a colour grade on the brand film once Sachin supplies it, launch or Instagram teasers, or a deck presenting the site.
  - The site itself only needs web-encoded footage + a poster (ffmpeg).

## Workflow
Develop and gate in the cloud workspace, then sync to `~/Claude/Projects/clam-website` after each milestone. Blender work happens on Sachin's computer and writes straight into that folder.
