"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, inr, type Size, teeImg } from "@/lib/products";
import { useBag } from "@/lib/bag";
import SizePicker from "@/components/ui/SizePicker";

/**
 * List — the drop. A sticky picture of the tee on its own colour field; the list of eight on the
 * right. The row in the middle of the screen (or the one you point at) opens and takes the picture.
 */
export default function DropList({ standalone = false }: { standalone?: boolean }) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  const add = useBag((s) => s.add);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  // a row the visitor chose (click, tap, focus, hover) stays open until they scroll on by about a row
  const lockY = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    let visible = false;
    const pick = () => {
      raf = 0;
      if (list.current?.contains(document.activeElement)) return; // never move a keyboard user
      if (lockY.current !== null) {
        if (Math.abs(window.scrollY - lockY.current) < 120) return;
        lockY.current = null;
      }
      const mid = window.innerHeight * (window.innerWidth < 760 ? 0.62 : 0.5);
      let best = -1,
        bd = Infinity;
      rows.current.forEach((r, i) => {
        if (!r) return;
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.top + Math.min(b.height, 72) / 2 - mid);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best >= 0) setActive((a) => (a === best ? a : best));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(pick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    if (section.current) io.observe(section.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const choose = (i: number) => {
    lockY.current = window.scrollY;
    setActive(i);
  };
  const p = PRODUCTS[active];

  return (
    <section className="drop" ref={section} aria-labelledby="drop-title" data-ink={p.ink} style={{ ["--field" as string]: p.field }}>
      <div className="drop__pic">
        {PRODUCTS.map((q, i) => (
          <div key={q.slug} className="drop__img" data-on={i === active || undefined} style={{ background: q.field }}>
            <Image src={teeImg(q.slug, "three")} alt={i === active ? `${q.name} t-shirt in ${q.colourName}` : ""} width={900} height={900} sizes="(max-width: 760px) 60vw, 34vw" preload={standalone && i === 0} />
          </div>
        ))}
        <p className="drop__picname small">
          {p.name} · {p.colourName}
        </p>
      </div>
      <div className="drop__side">
        {standalone ? (
          <h1 id="drop-title" className="head drop__title">
            The first drop
          </h1>
        ) : (
          <h2 id="drop-title" className="head drop__title">
            The first drop
          </h2>
        )}
        <p className="drop__intro">Eight tees in one fit, each colour named after a moment. Pick the one that sounds like your week.</p>
        <ul className="drop__list" ref={list}>
          {PRODUCTS.map((q, i) => {
            const on = i === active;
            return (
              <li
                key={q.slug}
                ref={(el) => void (rows.current[i] = el)}
                className="drop__row"
                data-on={on || undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && choose(i)}
              >
                <button className="drop__head" aria-expanded={on} aria-controls={`drop-${q.slug}`} onClick={() => choose(i)} onFocus={() => choose(i)}>
                  <span className="drop__name">{q.name}</span>
                  <span className="drop__price tnum">{inr(q.price)}</span>
                </button>
                <div className="drop__body" id={`drop-${q.slug}`} hidden={!on}>
                  <p>
                    {q.line} {q.colourName}, {q.gsm} gsm.
                  </p>
                  <div className="drop__actions">
                    <SizePicker
                      small
                      value={size}
                      label={`Size for ${q.name}`}
                      onChange={(z) => {
                        setSize(z);
                        setAsk(null);
                      }}
                    />
                    <button
                      className="btn btn--ink"
                      onClick={(e) => {
                        if (!size) {
                          setAsk(q.slug);
                          e.currentTarget.parentElement?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus();
                          return;
                        }
                        add(q.slug, size);
                      }}
                    >
                      {size ? `Add · ${size}` : "Pick a size"}
                    </button>
                    <Link href={`/tee/${q.slug}`} className="link small">
                      Details
                    </Link>
                  </div>
                  {ask === q.slug && <p className="small size-ask">Pick a size first. Not sure? M fits most.</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
