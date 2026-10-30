"use client";
import Image from "next/image";
import { useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import Stitch from "./Stitch";

const WORDS = "Comfy was never meant to stay home.".split(" ");

/**
 * Intro — a pinned sentence while photographs of ordinary places pass at its sides.
 * Each word darkens as the visitor scrolls, so the sentence is read at the pace of the scroll.
 */
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref);
  return (
    <section className="mani" ref={ref} aria-labelledby="mani-title" style={{ ["--w" as string]: WORDS.length }}>
      <div className="mani__stage">
        <Stitch section={ref} />
        <h2 id="mani-title" className="mani__title">
          {WORDS.map((w, i) => (
            <span key={i} className="mani__word" style={{ ["--k" as string]: i }}>
              {w}{" "}
            </span>
          ))}
        </h2>
        <p className="mani__sub lead">
          Somebody decided soft was for Sundays. We politely disagreed, and made t-shirts you can wear to everything else too.
        </p>
      </div>
      <figure className="mani__ph mani__ph--1">
        <Image src="/img/bedbw.webp" alt="A man asleep on his back, one arm over his face" width={800} height={534} sizes="26vw" />
        <figcaption className="small">Home, 7am.</figcaption>
      </figure>
      <figure className="mani__ph mani__ph--2">
        <Image src="/img/citystreet.webp" alt="A busy market street in an Indian city, shops and umbrellas" width={900} height={675} sizes="30vw" />
        <figcaption className="small">Out, 6pm.</figcaption>
      </figure>
      <figure className="mani__ph mani__ph--3">
        <Image src="/img/window.webp" alt="A cup of tea on a wooden sill by an open window" width={1070} height={1600} sizes="18vw" />
        <figcaption className="small">Anywhere, whenever.</figcaption>
      </figure>
    </section>
  );
}
