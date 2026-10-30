"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { SeamSvg, clamp, reducedMotion, roundRect, useSeam } from "@/components/ui/Seam";

/**
 * HOME-2: a tailored seam sewn round the manifesto as it is read. The needle comes up through
 * the fabric at a knot under the words, sews all the way round at an even distance from them,
 * and closes the seam by sewing a button over the knot. Scroll-scrubbed: scroll back to unpick.
 * Phones: one straight seam down the left margin, ending in the button.
 */

type Geo = { w: number; h: number; d: string; mobile: boolean };

export default function Stitch({ section }: { section: RefObject<HTMLElement | null> }) {
  const seam = useSeam();
  const host = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const last = useRef(0);

  useEffect(() => {
    const measure = () => {
      const sec = section.current;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const box = mobile ? sec : host.current?.parentElement;
      if (!box || !sec) return;
      const W = box.clientWidth, H = box.clientHeight;
      if (mobile) {
        // a straight seam in the margin, from the top padding to just above the section's end
        setGeo({ w: W, h: H, d: `M 12 88 V ${H - 56}`, mobile });
        return;
      }
      const br = box.getBoundingClientRect();
      // the text's own bounds (the blocks are wider than their centred lines)
      const rects = [".mani__title", ".mani__sub"].flatMap((s) => {
        const el = box.querySelector(s);
        if (!el) return [];
        const range = document.createRange();
        range.selectNodeContents(el);
        return [range.getBoundingClientRect()];
      });
      if (!rects.length) return;
      // keep 40px clear of the photos that pass at the sides (margin + 19vw wide)
      const side = Math.min(40, Math.max(16, W * 0.026)) + W * 0.19 + 40;
      const l = Math.max(side, Math.min(...rects.map((r) => r.left)) - br.left - 48);
      const r = Math.min(W - side, Math.max(...rects.map((r) => r.right)) - br.left + 48);
      const t = Math.min(...rects.map((r) => r.top)) - br.top - 40;
      const b = Math.max(...rects.map((r) => r.bottom)) - br.top + 44;
      setGeo({ w: W, h: H, d: roundRect(l, t, r - l, b - t, 30), mobile });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (host.current?.parentElement) ro.observe(host.current.parentElement);
    if (section.current) ro.observe(section.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [section]);

  useEffect(() => {
    if (!geo) return;
    seam.measure();
    draw(last.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const draw = useCallback(
    (raw: number) => {
      last.current = raw;
      if (!geo) return;
      if (reducedMotion()) return seam.draw(1, { calm: true, button: 1 });
      // phones scroll the section past ("pass" progress): finish while it is still on screen
      const p = geo.mobile ? clamp((raw - 0.1) / 0.6) : raw;
      seam.draw(clamp((p - 0.02) / 0.74), { button: clamp((p - 0.72) / 0.2), leave: clamp((p - 0.93) / 0.06) });
    },
    [geo, seam]
  );

  useScrollProgress(section, draw, geo?.mobile ? "pass" : "pin");

  return (
    <span ref={host} className="stitch" aria-hidden="true">
      {geo && <SeamSvg seam={seam} d={geo.d} w={geo.w} h={geo.h} button />}
    </span>
  );
}
