"use client";
import dynamic from "next/dynamic";
import Seam from "@/components/ui/Seam";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, inr, type Size, teeImg } from "@/lib/products";
import { useBag } from "@/lib/bag";
import SizePicker from "@/components/ui/SizePicker";

const Tee = dynamic(() => import("@/components/three/Tee"), {
  ssr: false,
  loading: () => null,
});

const PULL_LINES = [
  "Go on, pull the fabric. It doesn't mind.",
  "A little more…",
  "That's the good stretch.",
  "It always comes back. Like Mondays.",
];

/**
 * Showcase — the live thing. A full-bleed close-up of the knit, tinted in the chosen colour,
 * with the tee in 3D: pull the fabric, it springs back; pick a colour, the whole room changes.
 */
export default function TouchTest() {
  const [i, setI] = useState(0);
  const p = PRODUCTS[i];
  const [size, setSize] = useState<Size | null>(null);
  const [ask, setAsk] = useState(false);
  const sizesRef = useRef<HTMLDivElement>(null);
  const addOrAsk = () => {
    if (!size) {
      setAsk(true);
      sizesRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
      return;
    }
    add(p.slug, size);
  };
  const [pull, setPull] = useState(0);
  const [stretches, setStretches] = useState(0);
  const [cmd, setCmd] = useState<{ kind: "poke" | "turn"; dir?: number; n: number } | null>(null);
  const [inView, setInView] = useState(false);
  const [slow, setSlow] = useState(false);
  const [squish, setSquish] = useState(false);
  const add = useBag((s) => s.add);
  const ref = useRef<HTMLElement>(null);

  // mount the 3D only when the section comes near
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { rootMargin: "60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the still fallback answers the same way the 3D tee does: a squish that springs back
  const squishOnce = () => {
    setSquish(true);
    setPull(0.5);
    setStretches((n) => n + 1);
    window.setTimeout(() => {
      setSquish(false);
      setPull(0);
    }, 320);
  };
  const press = useRef(false);

  const line = pull > 0.75 ? PULL_LINES[3] : pull > 0.45 ? PULL_LINES[2] : pull > 0.1 ? PULL_LINES[1] : PULL_LINES[0];

  return (
    <section
      className="touch"
      ref={ref}
      aria-labelledby="touch-title"
      style={{ ["--field" as string]: p.field, ["--tee" as string]: p.hex }}
      data-ink={p.ink}
    >
      {/* the seam that joins the manifesto to this section, sewn as it scrolls in */}
      <Seam mode="scroll" className="seam--join" />
      <div className="touch__bg" aria-hidden="true">
        <Image src="/img/weave-gray.webp" alt="" fill sizes="100vw" />
      </div>

      <div className="touch__canvas" data-cursor="pull">
        {inView && !slow && (
          <Tee
            colour={p.hex}
            interactive
            onStretch={() => setStretches((n) => n + 1)}
            onPull={(a) => setPull(a)}
            command={cmd}
            onSlow={() => setSlow(true)}
            distance={8.6}
          />
        )}
        {slow && (
          <button
            className="touch__still"
            data-squish={squish || undefined}
            onPointerDown={() => {
              press.current = true;
              setSquish(true);
              setPull(0.5);
            }}
            onPointerUp={() => {
              if (press.current) setStretches((n) => n + 1);
              press.current = false;
              setSquish(false);
              setPull(0);
            }}
            onPointerCancel={() => {
              // the visitor was scrolling, not squishing
              press.current = false;
              setSquish(false);
              setPull(0);
            }}
            onPointerLeave={() => {
              press.current = false;
              setSquish(false);
              setPull(0);
            }}
            onClick={(e) => e.detail === 0 && squishOnce() /* Enter or Space */}
            aria-label={`Squish the ${p.name}`}
          >
            <Image src={teeImg(p.slug, "three")} alt="" width={900} height={900} sizes="60vw" />
          </button>
        )}
        <div className="touch__note">
          <p className="touch__hint" aria-live="polite">
            {line}
          </p>
          <p className="small touch__count tnum" aria-live="polite">
            {stretches === 0
            ? "Not stretched yet. Go easy."
              : `Stretched ${stretches} ${stretches === 1 ? "time" : "times"}. Still fine.`}
          </p>
        </div>
      </div>

      <div className="touch__card">
        <h2 id="touch-title" className="touch__name">
          {p.name}
        </h2>
        <p className="touch__variant">
          {p.colourName} · {p.gsm} gsm cotton · unisex
        </p>
        <p className="touch__price tnum">{inr(p.price)}</p>

        <fieldset className="touch__swatches">
          <legend className="small">Eight tees, by colour: {p.name}, {p.colourName.toLowerCase()}</legend>
          <div className="swatches">
            {PRODUCTS.map((q, k) => (
              <button
                key={q.slug}
                className="swatch"
                style={{ background: q.hex }}
                aria-label={`${q.colourName}, ${q.name}`}
                aria-pressed={k === i}
                onClick={() => setI(k)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="touch__sizes">
          <legend className="small">Size{size ? `: ${size}` : ""}</legend>
          <SizePicker
            ref={sizesRef}
            value={size}
            label="Size"
            onChange={(z) => {
              setSize(z);
              setAsk(false);
            }}
          />
          {ask && <p className="small size-ask touch__ask">Pick a size first. Not sure? M fits most.</p>}
        </fieldset>

        <button className="btn btn--pearl btn--block" onClick={addOrAsk}>
          {size ? `Add to bag · ${size}` : "Pick a size"}
        </button>
      </div>

      <div className="touch__keys" role="group" aria-label="Move the tee">
        {!slow && (
          <button className="link small" onClick={() => setCmd({ kind: "turn", dir: -1, n: Date.now() })}>
            Turn left
          </button>
        )}
        <button className="link small" onClick={() => (slow ? squishOnce() : setCmd({ kind: "poke", n: Date.now() }))}>
          Poke it
        </button>
        {!slow && (
          <button className="link small" onClick={() => setCmd({ kind: "turn", dir: 1, n: Date.now() })}>
            Turn right
          </button>
        )}
      </div>
    </section>
  );
}
