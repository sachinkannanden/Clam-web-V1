"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Gallery — a very short film, told in three full-screen frames that slide over each other
 * like curtains. The middle frame moves: a curtain in a breeze, which is the whole plot.
 */
export default function Film() {
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    const v = vid.current;
    if (!v) return;
    if (r) {
      v.pause();
      setPlaying(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => setPlaying(false));
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="film" aria-labelledby="film-title">
      <div className="film__intro">
        <h2 id="film-title" className="head" data-reveal>
          A very short film
        </h2>
        <p className="film__lock" data-reveal style={{ ["--i" as string]: 1 }}>
          Three quiet moments from one day, the kind where nobody is rushing you. We'd like more of those. Running
          time: as long as you like.
        </p>
      </div>
      <div className="film__stack">
        <figure className="film__frame">
          <div className="film__media">
            <Image src="/img/park2.webp" alt="Someone lying on the grass in a park, reading, legs crossed" fill sizes="100vw" style={{ objectPosition: "50% 88%" }} />
          </div>
          <figcaption className="film__cap">12:40. Nowhere in particular.</figcaption>
        </figure>
        <figure className="film__frame">
          <video
            ref={vid}
            className="film__video"
            src="/video/breeze.mp4"
            poster="/video/breeze.webp"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="A sheer curtain lifting in the breeze by an open window"
          />
          <figcaption className="film__cap">
            15:10. The breeze, mostly.
            <button className="film__toggle small" onClick={toggle} aria-pressed={!playing} data-cursor={playing ? "pause" : "play"}>
              {playing && !reduce ? "Pause" : "Play"}
            </button>
          </figcaption>
        </figure>
        <figure className="film__frame">
          <div className="film__media">
            <Image src="/img/lounge.webp" alt="A woman in a white t-shirt stretched out on a grey sofa by the window" fill sizes="100vw" style={{ objectPosition: "50% 50%" }} />
          </div>
          <figcaption className="film__cap">18:55. Sat down. Stayed a while.</figcaption>
        </figure>
      </div>
    </section>
  );
}
