"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import FrameHover from "./FrameHover";
import Seam, { around } from "@/components/ui/Seam";

export const DAY = [
  { src: "/img/home.webp", time: "07:10", place: "Still in bed.", alt: "A man in a blue t-shirt lying across rumpled white sheets", pos: "50% 40%" },
  { src: "/img/street.webp", time: "09:40", place: "The walk to work.", alt: "A woman in a white t-shirt with a leather bag on city steps", pos: "50% 35%" },
  { src: "/img/desk.webp", time: "11:15", place: "Third meeting. Still soft.", alt: "A woman in a white t-shirt smiling at her laptop in an office", pos: "40% 40%" },
  { src: "/img/date.webp", time: "19:30", place: "A table for two.", alt: "A couple talking at a pavement café table, he in a white t-shirt", pos: "50% 50%" },
  { src: "/img/studio.webp", time: "23:05", place: "One more idea.", alt: "A man in a white t-shirt leaning against a wall covered in posters", pos: "50% 30%" },
];

/**
 * Hero — "sentence split by a frame". The headline holds still at the edges while a reel of one
 * day passes through the frame between its halves: the same kind of tee, from bed to the studio.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const phone = useRef(false);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const onP = useCallback((p: number) => {
    if (phone.current) return;
    const i = Math.min(DAY.length - 1, Math.round(p * (DAY.length - 1)));
    setActive((a) => (a === i ? a : i));
  }, []);
  useScrollProgress(ref, onP);

  // on phones the day plays by itself, slowly, instead of being scrolled through
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px), (max-width: 1100px) and (orientation: portrait)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    const apply = () => {
      phone.current = mq.matches;
      clearInterval(t);
      if (mq.matches && !reduce && !paused && visible) t = setInterval(() => setActive((a) => (a + 1) % DAY.length), 3200);
    };
    // only play while the hero is on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      apply();
    });
    if (ref.current) io.observe(ref.current);
    apply();
    mq.addEventListener("change", apply);
    return () => {
      clearInterval(t);
      io.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, [paused]);

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-title" style={{ ["--n" as string]: DAY.length }}>
      <div className="hero__stage">
        <h1 id="hero-title" className="hero__title">
          <span className="hero__half hero__half--a">Wear it</span>
          <span className="sr-only"> </span>
          <span className="hero__half hero__half--b">anywhere.</span>
        </h1>

        <FrameHover root={ref} onHover={setHover} />
        <div className="hero__reel-window">
          <ol className="hero__reel" aria-label="One day in one tee">
            {DAY.map((d, i) => (
              <li key={d.src} className="hero__frame" data-active={i === active || undefined} data-hover={i === hover || undefined}>
                <Image
                  src={d.src}
                  alt={d.alt}
                  fill
                  preload={i < 2}
                  sizes="(max-width: 760px) 92vw, 28vw"
                  style={{ objectPosition: d.pos }}
                />
                <p className="hero__cap small">
                  <span className="tnum">{d.time}</span> {d.place}
                </p>
                {/* hover: a seam is sewn round the photo and the caption becomes a sewn-on label */}
                <Seam mode="on" on={i === hover} shape={around(16, 12)} speed={1500} className="hero__seam" />
                <span className="hero__label small" aria-hidden="true">
                  <span className="tnum">{d.time}</span> {d.place}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <button className="hero__pause small" onClick={() => setPaused((v) => !v)} aria-pressed={paused}>
          {paused ? "Play the day" : "Pause the day"}
        </button>

        <div className="hero__aside">
          <p className="hero__sub">
            clam makes soft, unisex t-shirts for bed, the street, the desk and the date. One tee, the whole day. From ₹1,049.
          </p>
          <Link href="/drop" className="btn btn--ink" data-cursor="see">
            See the drop
          </Link>
        </div>

        <div className="hero__clock small tnum" aria-hidden="true">
          <span>{DAY[active].time}</span>
          <span className="hero__ticks">
            {DAY.map((d, i) => (
              <i key={d.time} data-on={i <= active || undefined} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
