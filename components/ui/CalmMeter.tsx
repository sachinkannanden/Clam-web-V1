"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The calm meter: a small shell that fills while the visitor scrolls slowly and drains if they rush.
 * Purely a wink. Never blocks anything; announces once, politely, when full.
 */
export default function CalmMeter() {
  const fill = useRef<HTMLImageElement>(null);
  const [full, setFull] = useState(false);
  const [rushed, setRushed] = useState(false);
  const [show, setShow] = useState(false);
  const [away, setAway] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let level = 0.08;
    let raf = 0;
    let announced = false;
    let lastY = window.scrollY;
    let rushT = 0;
    let wasRushed = false;
    let fastFrames = 0;
    let cooldown = 0;
    setShow(true);
    let idle = 0;
    let running = false;
    const loop = () => {
      const y = window.scrollY;
      const v = window.__calm?.velocity ?? Math.abs(y - lastY);
      lastY = y;
      // sleep when nothing is happening: no scroll, no message on screen
      idle = Math.abs(v) < 0.05 ? idle + 1 : 0;
      if (v > 0.2 && v < 18) level += 0.0018; // slow, deliberate scrolling
      if (v >= 70) {
        level -= 0.01; // rushing
        fastFrames++;
        if (fastFrames > 24 && cooldown <= 0) {
          rushT = 150; // say it once, briefly
          cooldown = 900; // then not again for ~15 seconds
        }
      } else fastFrames = 0;
      if (cooldown > 0) cooldown--;
      level = Math.max(0.04, Math.min(1, level));
      if (rushT > 0) rushT--;
      const r = rushT > 0;
      if (r !== wasRushed) {
        wasRushed = r;
        setRushed(r);
      }
      if (fill.current) fill.current.style.clipPath = `inset(${((1 - level) * 100).toFixed(1)}% 0 0 0)`;
      if (level >= 1 && !announced) {
        announced = true;
        setFull(true);
        setTimeout(() => setFull(false), 4200);
      }
      if (idle > 40 && rushT <= 0 && cooldown <= 0) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (running) return;
      running = true;
      idle = 0;
      raf = requestAnimationFrame(loop);
    };
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    // step out of the way of the footer, where the corner holds buttons and links
    const foot = document.querySelector("footer");
    const io = new IntersectionObserver(([e]) => setAway(e.isIntersecting), { rootMargin: "0px 0px -10% 0px" });
    if (foot) io.observe(foot);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      io.disconnect();
    };
  }, []);

  if (!show) return null;
  return (
    <div className="meter" data-full={full || undefined} data-rushed={rushed || undefined} data-away={away || undefined}>
      <span className="meter__icon" aria-hidden="true">
        {/* the shell is a Blender render; it fills from the hinge up as you slow down */}
        <img src="/brand/shell-96.png" alt="" width={48} height={32} className="meter__base" />
        <img ref={fill} src="/brand/shell-96.png" alt="" width={48} height={32} className="meter__fill" />
      </span>
      <p className="meter__msg small" role="status">
        {full ? "You're officially calm." : rushed ? "Easy. Nothing's on fire." : ""}
      </p>
    </div>
  );
}
