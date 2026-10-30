"use client";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";

/**
 * The site's one sewing motif. A tide running stitch is sewn along a path by a Blender-rendered
 * needle: the needle comes up through the fabric at a small knot, rocks in and out with each
 * stitch, and either pulls away or sews on a four-hole button at the end.
 *
 * `useSeam` is the engine (refs + draw). `<Seam>` drives it: when it scrolls into view, while
 * `on` is true, or scrubbed by the scroll. Reduced motion: the finished seam, no needle.
 */

export const NEEDLE_SRC = "/brand/needle.webp";
export const BUTTON_SRC = "/brand/button.webp";
const STITCH = 17; // one stitch + gap, matches .seam__thread's dasharray (10 7)

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export type Shape = (w: number, h: number) => string;

/** A straight seam across the middle of the box. */
export const across: Shape = (w, h) => `M 0 ${h / 2} H ${w}`;
/** A rounded rectangle path, sewn from the bottom centre clockwise all the way round. */
export const roundRect = (x: number, y: number, W: number, H: number, r: number) => {
  const k = Math.min(r, W / 2, H / 2);
  const f = (n: number) => n.toFixed(1);
  return `M ${f(x + W / 2)} ${f(y + H)} H ${f(x + k)} A ${k} ${k} 0 0 1 ${f(x)} ${f(y + H - k)} V ${f(y + k)} A ${k} ${k} 0 0 1 ${f(x + k)} ${f(y)} H ${f(x + W - k)} A ${k} ${k} 0 0 1 ${f(x + W)} ${f(y + k)} V ${f(y + H - k)} A ${k} ${k} 0 0 1 ${f(x + W - k)} ${f(y + H)} H ${f(x + W / 2)}`;
};
/** The same, inset from the box. */
export const around =
  (inset = 0, r = 12): Shape =>
  (w, h) =>
    roundRect(inset, inset, w - inset * 2, h - inset * 2, r);

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type DrawOpts = { button?: number; leave?: number; calm?: boolean };

export function useSeam() {
  const id = useId().replace(/:/g, "");
  const reveal = useRef<SVGPathElement>(null);
  const needle = useRef<SVGGElement>(null);
  const knot = useRef<SVGCircleElement>(null);
  const button = useRef<SVGGElement>(null);
  const cross = useRef<SVGPathElement>(null);
  const len = useRef(0);

  const measure = useCallback(() => {
    const p = reveal.current;
    if (!p) return;
    len.current = p.getTotalLength();
    p.style.strokeDasharray = `${len.current} ${len.current}`;
  }, []);

  /** q 0–1: how much is sewn. button 0–1: the button arrives (0–0.5) then is cross-stitched (0.5–1). leave 0–1: the needle goes. */
  const draw = useCallback((q: number, { button: b = 0, leave = 0, calm = false }: DrawOpts = {}) => {
    const p = reveal.current;
    const L = len.current;
    if (!p || !L) return;
    if (calm) {
      q = 1;
      b = b > 0 ? 1 : 0;
    }
    p.style.strokeDashoffset = String(L * (1 - q));
    if (knot.current) knot.current.style.opacity = q > 0.001 ? "1" : "0";

    // the needle rides the tip of the thread, rocking in and out once per stitch
    const at = clamp(L * q, 0.5, L - 0.5);
    const a = p.getPointAtLength(at);
    const c = p.getPointAtLength(Math.min(L, at + 2));
    const tan = (Math.atan2(c.y - a.y, c.x - a.x) * 180) / Math.PI;
    let x = a.x, y = a.y, ang = tan + Math.sin(((L * q) / STITCH) * Math.PI * 2) * 6, s = 1, op = 1;
    // it comes up through the fabric at the knot: grows out from its point over the first stitches
    const rise = clamp((L * q) / (STITCH * 2.5));
    s = 0.25 + 0.75 * easeOut(rise);
    op = rise > 0.35 ? clamp((rise - 0.35) * 3) : 0;
    const bb = button.current;
    if (bb) {
      const end = p.getPointAtLength(L);
      const arrive = easeOut(clamp(b / 0.5));
      bb.style.opacity = String(arrive);
      bb.style.transform = `translate(${end.x}px, ${end.y}px) scale(${1.2 - 0.2 * arrive}) rotate(${(1 - arrive) * -30}deg)`;
      const sew = clamp((b - 0.5) / 0.5);
      if (cross.current) cross.current.style.strokeDashoffset = String(100 * (1 - sew));
      if (sew > 0 && sew < 1) {
        // through the four holes: dips in a small cross over the button
        const k = sew * Math.PI * 4;
        x = end.x + Math.sin(k) * 4;
        y = end.y + Math.cos(k) * 4 - 2;
        ang = -50 + Math.sin(k) * 18;
      } else if (sew >= 1) {
        x = end.x;
        y = end.y;
        ang = -50;
      }
    }
    if (leave > 0) {
      // pulls the thread through and away along its last direction
      const r = (ang * Math.PI) / 180;
      x += Math.cos(r) * 70 * easeOut(leave);
      y += Math.sin(r) * 70 * easeOut(leave);
      op *= 1 - leave;
    }
    const n = needle.current;
    if (n) {
      n.style.opacity = calm || q <= 0 ? "0" : String(op);
      n.style.transform = `translate(${x}px, ${y}px) rotate(${ang}deg) scale(${s})`;
    }
  }, []);

  return { id, reveal, needle, knot, button, cross, len, measure, draw };
}

type SeamRefs = ReturnType<typeof useSeam>;

/** The SVG for a seam: thread (masked by the sewn length), knot, optional button, needle. */
export function SeamSvg({
  seam,
  d,
  w,
  h,
  button = false,
  needle = true,
  knot = true,
  className = "",
  style,
}: {
  seam: SeamRefs;
  d: string;
  w: number;
  h: number;
  button?: boolean;
  needle?: boolean;
  knot?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const start = d.match(/^M\s*([-\d.]+)[ ,]+([-\d.]+)/);
  return (
    <svg className={`seam ${className}`} style={style} aria-hidden="true" focusable="false" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <mask id={`m${seam.id}`} maskUnits="userSpaceOnUse" x={-40} y={-40} width={w + 80} height={h + 80}>
          <path ref={seam.reveal} d={d} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="butt" style={{ strokeDasharray: "0 1000000" }} />
        </mask>
      </defs>
      <path d={d} className="seam__thread" mask={`url(#m${seam.id})`} />
      {/* the thread's ply: a fine highlight on each stitch so it reads as thread, not a dashed line */}
      <path d={d} className="seam__ply" mask={`url(#m${seam.id})`} />
      {knot && start && <circle ref={seam.knot} className="seam__knot" cx={start[1]} cy={start[2]} r={2.4} style={{ opacity: 0 }} />}
      {button && (
        <g ref={seam.button} className="seam__button" style={{ opacity: 0 }}>
          <image href={BUTTON_SRC} x={-15} y={-15} width={30} height={30} />
        </g>
      )}
      {needle && (
        <g ref={seam.needle} className="seam__needle" style={{ opacity: 0 }}>
          <image href={NEEDLE_SRC} x={-108} y={-12} width={120} height={24} />
        </g>
      )}
    </svg>
  );
}

/** Measures its own box and redraws the path when it changes. */
function useBox<T extends Element>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setBox((b) => (b && Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

type SeamProps = {
  /** view: sews once when it scrolls into view · on: sews while `on`, gone when not · scroll: scrubbed by the scroll */
  mode: "view" | "on" | "scroll";
  on?: boolean;
  shape?: Shape;
  /** px per second of thread while sewing */
  speed?: number;
  delay?: number;
  button?: boolean;
  needle?: boolean;
  /** the needle stays where it stopped, as if put down mid-seam */
  rest?: boolean;
  knot?: boolean;
  className?: string;
};

/** A seam that fills its (absolutely positioned) box. */
export default function Seam({ mode, on = false, shape = across, speed = 420, delay = 0, button = false, needle = true, rest = false, knot = true, className = "" }: SeamProps) {
  const seam = useSeam();
  const [wrap, box] = useBox<HTMLSpanElement>();
  const q = useRef(0);
  const raf = useRef(0);
  const d = box ? shape(box.w, box.h) : "";

  // play from the current point to the end at a steady sewing pace
  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (reducedMotion()) {
      q.current = 1;
      seam.draw(1, { calm: true, button: 1 });
      return;
    }
    const L = seam.len.current || 1;
    const sewMs = (L / speed) * 1000;
    const tail = button ? 700 : 0;
    const leaveMs = 320;
    const from = q.current;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.max(0, now - t0);
      const k = clamp(t / (sewMs * (1 - from)));
      q.current = from + (1 - from) * easeInOut(k);
      const b = button ? clamp((t - sewMs * (1 - from) + 200) / tail) : 0;
      const after = t - sewMs * (1 - from) - tail;
      seam.draw(q.current, { button: b, leave: rest ? 0 : clamp(after / leaveMs) });
      if (after < (rest ? 0 : leaveMs)) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [seam, speed, delay, button, rest]);

  useEffect(() => {
    if (!box) return;
    seam.measure();
    seam.draw(q.current, { button: q.current >= 1 ? 1 : 0, leave: q.current >= 1 ? 1 : 0, calm: reducedMotion() && q.current >= 1 });
  }, [box, d, seam]);

  // view: once, when most of it is on screen
  useEffect(() => {
    if (mode !== "view" || !box) return;
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, box, play, wrap]);

  // on: sew while on; when off, the seam fades (CSS) and resets
  useEffect(() => {
    if (mode !== "on" || !box) return;
    if (on) play();
    else {
      cancelAnimationFrame(raf.current);
      const t = setTimeout(() => {
        q.current = 0;
        seam.draw(0);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [mode, on, box, play, seam]);

  // scroll: sewn as the seam travels from the bottom of the screen to just above the middle
  useEffect(() => {
    if (mode !== "scroll" || !box) return;
    const el = wrap.current;
    if (!el) return;
    const calm = reducedMotion();
    let running = false;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.92 - r.top) / (vh * 0.5));
      if (calm) seam.draw(p > 0 ? 1 : 0, { calm: true, button: 1 });
      else {
        const sew = clamp(p / (button ? 0.8 : 0.88));
        seam.draw(sew, { button: button ? clamp((p - 0.74) / 0.22) : 0, leave: clamp((p - (button ? 0.94 : 0.88)) / 0.08) });
      }
      if (running) raf.current = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf.current = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf.current);
        tick();
      }
    });
    io.observe(el);
    return () => {
      running = false;
      cancelAnimationFrame(raf.current);
      io.disconnect();
    };
  }, [mode, box, seam, button, wrap]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <span ref={wrap} className={`seam-box ${className}`} data-on={mode !== "on" || on ? "" : undefined} aria-hidden="true">
      {box && d && <SeamSvg seam={seam} d={d} w={box.w} h={box.h} button={button} needle={needle} knot={knot} />}
    </span>
  );
}

/** A seam sewn round its parent while the mouse is over it (desktop pointers only). */
export function HoverSeam({ inset = 12, radius = 12, speed = 1500, className = "" }: { inset?: number; radius?: number; speed?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reducedMotion()) return;
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && setOn(true);
    const leave = () => setOn(false);
    parent.addEventListener("pointerenter", enter);
    parent.addEventListener("pointerleave", leave);
    return () => {
      parent.removeEventListener("pointerenter", enter);
      parent.removeEventListener("pointerleave", leave);
    };
  }, []);
  const shape = useRef(around(inset, radius)).current;
  return (
    <span ref={ref} className={`seam-hover ${className}`} aria-hidden="true">
      <Seam mode="on" on={on} shape={shape} speed={speed} />
    </span>
  );
}
