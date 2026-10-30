# CLAM — Change protocol (from 29 Oct 2026)

Sachin's direction: the site is about 60% done and the baseline is approved. **We no longer rebuild or restyle.** All work happens inside the existing site: add, change or remove specific sections. Each request is narrow and precise.

## How a request is handled
1. **Pin the target.** Name the section by its ID from `site-map-as-built.md` (e.g. `HOME-4`, `PDP-2`, `G-FOOT`). If the request is ambiguous, ask which section before touching code.
2. **Read before writing.** Open that section's component and CSS block, plus anything it shares (tokens, `lib/products.ts`, `lib/bag.ts`, shared components such as SizePicker, LoopVideo or Wordmark).
3. **Change only that.** Keep the art direction, tokens, type scale, motion language and voice. No new fonts, colours or patterns unless Sachin asks. Shared code changes must keep every other user of it working.
4. **New sections** follow the same system: one idea per section, a layout that differs from its neighbours, real pictures, an entrance on every part, reduced motion handled, phone layout designed rather than squeezed.
5. **Removing a section** also removes its CSS block, unused assets (moved to `_to_delete/`, not deleted), credits and anything else that referenced it.
6. **3D or rendered imagery** → Blender MCP (Standing rule #2).
7. **Verify, scoped to what changed** (Standing rule #1 in `skills-playbook.md`):
   - Taste lint + inspector on the affected pages at 1440/768/390; look at the screenshots.
   - Impeccable detect on those pages (desktop + mobile).
   - Emil Before/After/Why for any motion touched.
   - Playwright on Sachin's PC with the real GPU (window not minimized).
   - Shared-code changes widen the check to every page that uses that code.
8. **Ship.** Sync to `~/Claude/Projects/clam-website`, refresh `.preview`, add one entry to `change-log.md`, and update `site-map-as-built.md` if a section was added, renamed or removed. Report exactly which checks ran.

## Voice reminders
Calm as a clam: quiet, unhurried, witty, never shouty. No fake urgency, no fake reviews, no invented business numbers. Renders are labelled as renders.
