"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useBag, CALM_CODE } from "@/lib/bag";

const HOLD_MS = 4000;

/**
 * CTA — breathe out, then get dressed. Holding the button for four seconds (one slow breath)
 * fills the ring and reveals a small thank-you code. Space/Enter work too.
 */
export default function Breathe() {
  const [state, setState] = useState<"idle" | "holding" | "done">("idle");
  const [phase, setPhase] = useState("Hold to breathe");
  const start = useRef(0);
  const raf = useRef(0);
  const ring = useRef<SVGCircleElement>(null);
  const setCode = useBag((s) => s.setCode);

  const stop = (finished = false) => {
    cancelAnimationFrame(raf.current);
    if (finished) {
      if (ring.current) ring.current.style.strokeDashoffset = "0";
      setState("done");
      setCode(CALM_CODE);
      return;
    }
    setState((s) => (s === "done" ? s : "idle"));
    setPhase("Hold to breathe");
    if (ring.current) {
      ring.current.style.transition = "stroke-dashoffset 300ms cubic-bezier(0.23,1,0.32,1)";
      ring.current.style.strokeDashoffset = "100";
    }
  };

  const begin = () => {
    if (state === "done") return;
    setState("holding");
    start.current = performance.now();
    if (ring.current) ring.current.style.transition = "none";
    const loop = (t: number) => {
      const k = Math.min(1, (t - start.current) / HOLD_MS);
      if (ring.current) ring.current.style.strokeDashoffset = String(100 - k * 100);
      setPhase(k < 0.5 ? "Breathe in…" : k < 1 ? "…and out" : "Done");
      if (k >= 1) return stop(true);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <section className="breathe" aria-labelledby="breathe-title">
      <div className="breathe__ph" data-reveal="clip">
        <Image src="/img/unwind.webp" alt="A man in a charcoal t-shirt leaning back on a sofa in warm evening light, hand behind his head" fill sizes="(max-width: 800px) 100vw, 56vw" style={{ objectPosition: "38% 40%" }} />
      </div>
      <div className="breathe__text">
        <h2 id="breathe-title" className="head" data-reveal>
          Breathe out first.
        </h2>
        <p data-reveal style={{ ["--i" as string]: 1 }}>
          Then get dressed. Take one slow breath with us, and if you make it all the way through, there is a small thank-you for your first tee.
        </p>
        <div className="breathe__row" data-reveal style={{ ["--i" as string]: 2 }}>
          <button
            className="hold"
            data-state={state}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              begin();
            }}
            onPointerUp={() => state !== "done" && stop()}
            onPointerCancel={() => state !== "done" && stop()}
            onBlur={() => state === "holding" && stop()}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                begin();
              }
            }}
            onKeyUp={(e) => (e.key === " " || e.key === "Enter") && state !== "done" && stop()}
            onContextMenu={(e) => e.preventDefault()}
            aria-describedby="breathe-result"
          >
            <svg viewBox="0 0 36 36" aria-hidden="true" className="hold__ring">
              <circle cx="18" cy="18" r="15.9" pathLength="100" className="hold__track" />
              <circle ref={ring} cx="18" cy="18" r="15.9" pathLength="100" className="hold__fill" />
            </svg>
            <span className="hold__label">{state === "done" ? "Thank you" : phase}</span>
          </button>
          <p id="breathe-result" className="breathe__result" role="status">
            {state === "done" ? (
              <>
                Code <strong className="tnum">CALMDOWN</strong> takes 10% off your first tee. It's already waiting in your bag.
              </>
            ) : (
              ""
            )}
          </p>
        </div>
        <div className="breathe__alt" data-reveal style={{ ["--i" as string]: 3 }}>
          <Link href="/drop" className="link">
            Or skip the breathing and see the drop
          </Link>
          {state !== "done" && (
            <button className="link small soft" onClick={() => stop(true)}>
              Can't hold right now? Take the code anyway.
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
