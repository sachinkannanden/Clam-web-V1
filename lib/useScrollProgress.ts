"use client";
import { useEffect, type RefObject } from "react";

/**
 * Writes the scroll progress of a tall wrapper (0 when its top meets the viewport top,
 * 1 when its bottom meets the viewport bottom) into the CSS variable --p on the element,
 * and calls an optional callback. Native scrolling only: nothing is hijacked.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress?: (p: number) => void,
  mode: "pin" | "pass" = "pin"
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "pin") {
        const span = r.height - vh;
        p = span > 0 ? -r.top / span : r.top < 0 ? 1 : 0;
      } else {
        // 0 when the element's top enters from the bottom, 1 when its bottom leaves the top
        p = (vh - r.top) / (vh + r.height);
      }
      p = Math.min(1, Math.max(0, p));
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        el.style.setProperty("--p", p.toFixed(4));
        onProgress?.(p);
      }
      if (running) raf = requestAnimationFrame(tick);
    };
    let running = false;
    // only run the loop while the wrapper is near the viewport
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
          tick(); // settle final value
        }
      },
      { rootMargin: "50% 0px 50% 0px" }
    );
    io.observe(el);
    tick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ref, onProgress, mode]);
}
