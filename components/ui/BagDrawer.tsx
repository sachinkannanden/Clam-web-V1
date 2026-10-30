"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useBag, bagTotal, bagDiscount } from "@/lib/bag";
import { bySlug, inr, teeImg } from "@/lib/products";

export default function BagDrawer() {
  const { lines, open, setOpen, setQty, remove, code } = useBag();
  const [mounted, setMounted] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      window.__lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());
    } else {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
      returnFocus.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!mounted) return null;
  const discount = bagDiscount(lines, code);
  const total = bagTotal(lines) - discount;
  // after a line disappears, keep keyboard focus inside the bag instead of dropping it to the page
  const refocus = () => requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("#bag-title")?.focus());

  return (
    <div className="bag" data-open={open || undefined} aria-hidden={!open} inert={!open}>
      <button className="bag__scrim" aria-label="Close bag" tabIndex={-1} onClick={() => setOpen(false)} />
      <div className="bag__panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="bag-title">
        <div className="bag__top">
          <h2 id="bag-title" className="bag__title" tabIndex={-1}>
            Your bag
          </h2>
          <button className="link small" onClick={() => setOpen(false)} data-autofocus>
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="bag__empty">
            <p className="lead">Your bag is empty. Very zen of you.</p>
            {code && <p className="small bag__saved">CALMDOWN is saved here: 10% off your first tee.</p>}
            <Link href="/drop" className="btn btn--ink" onClick={() => setOpen(false)}>
              See the drop
            </Link>
          </div>
        ) : (
          <>
            <ul className="bag__lines">
              {lines.map((l) => {
                const p = bySlug(l.slug);
                if (!p) return null;
                return (
                  <li key={l.slug + l.size} className="bag__line">
                    <div className="bag__thumb" style={{ background: p.field }}>
                      <Image src={teeImg(p.slug)} alt="" width={160} height={160} />
                    </div>
                    <div className="bag__info">
                      <p className="bag__name">{p.name}</p>
                      <p className="small soft">
                        {p.colourName} · size {l.size}
                      </p>
                      <div className="bag__qty" role="group" aria-label={`Quantity of ${p.name}`}>
                        <button
                          onClick={() => {
                            setQty(l.slug, l.size, l.qty - 1);
                            if (l.qty === 1) refocus();
                          }}
                          aria-label="One less"
                        >
                          −
                        </button>
                        <span className="tnum" aria-live="polite">
                          {l.qty}
                        </span>
                        <button onClick={() => setQty(l.slug, l.size, Math.min(9, l.qty + 1))} aria-label="One more">
                          +
                        </button>
                      </div>
                    </div>
                    <div className="bag__right">
                      <p className="tnum">{inr(p.price * l.qty)}</p>
                      <button
                        className="small soft link"
                        onClick={() => {
                          remove(l.slug, l.size);
                          refocus();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="bag__foot">
              {code && (
                <div className="bag__code small">
                  <span>
                    Code <strong className="tnum">CALMDOWN</strong>, for breathing
                  </span>
                  <span className="tnum">−{inr(discount)}</span>
                </div>
              )}
              <div className="bag__total">
                <span>Total</span>
                <span className="tnum">{inr(total)}</span>
              </div>
              <p className="small soft">Free shipping across India. Free returns for 30 days.</p>
              <Link href="/checkout" className="btn btn--block" onClick={() => setOpen(false)}>
                Check out
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
