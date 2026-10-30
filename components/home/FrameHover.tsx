"use client";
import { useEffect, type RefObject } from "react";

/**
 * The reel's frames sit under the headline and take no pointer events, so the hovered frame is
 * found by position. Reports its index (or null). Desktop mouse only; off under reduced motion.
 */
export default function FrameHover({ root, onHover }: { root: RefObject<HTMLElement | null>; onHover: (i: number | null) => void }) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const win = host.querySelector(".hero__reel-window") as HTMLElement | null;
    const frames = [...host.querySelectorAll<HTMLElement>(".hero__frame")];
    let mx = -1, my = -1, cur: number | null = null;
    const set = (i: number | null) => {
      if (i !== cur) onHover((cur = i));
    };
    const hit = () => {
      if (mx < 0) return set(null);
      const w = win?.getBoundingClientRect();
      if (w && (mx < w.left || mx > w.right || my < w.top || my > w.bottom)) return set(null);
      const i = frames.findIndex((el) => {
        const r = el.getBoundingClientRect();
        return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
      });
      set(i < 0 ? null : i);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      hit();
    };
    const out = () => {
      mx = my = -1;
      set(null);
    };
    const scroll = () => mx >= 0 && hit();
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", out);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", out);
      window.removeEventListener("scroll", scroll);
    };
  }, [root, onHover]);
  return null;
}
