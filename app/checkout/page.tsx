"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useBag, bagTotal, bagDiscount } from "@/lib/bag";
import { bySlug, inr, teeImg } from "@/lib/products";

export default function CheckoutPage() {
  const lines = useBag((s) => s.lines);
  const code = useBag((s) => s.code);
  const setQty = useBag((s) => s.setQty);
  const remove = useBag((s) => s.remove);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const discount = bagDiscount(lines, code);
  const total = bagTotal(lines) - discount;
  const summary = lines
    .map((l) => {
      const p = bySlug(l.slug);
      return p ? `${l.qty} × ${p.name} (${p.colourName}, ${l.size})` : "";
    })
    .join(", ");
  const wa = `https://wa.me/910000000000?text=${encodeURIComponent(`Hi clam, I'd like to order: ${summary}.${discount ? ` Code CALMDOWN (−${inr(discount)}).` : ""} Total ${inr(total)}.`)}`;

  return (
    <div className="checkout wrap">
      <h1 className="head" data-reveal>
        Your bag
      </h1>
      {!mounted ? null : lines.length === 0 ? (
        <div className="checkout__empty">
          <div className="checkout__emptyph" data-reveal="clip">
            <Image src="/img/bedbw.webp" alt="Someone asleep, sheets pulled up, in black and white" fill preload sizes="(max-width: 800px) 100vw, 50vw" />
          </div>
          <div className="checkout__emptytext">
            <p className="lead" data-reveal>
              Your bag is empty. Very zen of you.
            </p>
            {code && (
              <p className="small" data-reveal>
                CALMDOWN is saved for you: 10% off your first tee.
              </p>
            )}
            <p data-reveal style={{ ["--i" as string]: 1 }}>
              When you're ready, the first drop is eight soft tees from ₹1,049, with free shipping across India.
            </p>
            <Link href="/drop" className="btn btn--ink" data-reveal style={{ ["--i" as string]: 2 }}>
              See the drop
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout__grid">
          <ul className="checkout__lines">
            {lines.map((l) => {
              const p = bySlug(l.slug);
              if (!p) return null;
              return (
                <li key={l.slug + l.size} className="checkout__line">
                  <div className="checkout__thumb" style={{ background: p.field }}>
                    <Image src={teeImg(p.slug)} alt="" width={200} height={200} />
                  </div>
                  <div>
                    <p className="checkout__name">{p.name}</p>
                    <p className="soft">
                      {p.colourName} · size {l.size}
                    </p>
                    <div className="bag__qty" role="group" aria-label={`Quantity of ${p.name}`}>
                      <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} aria-label="One less">
                        −
                      </button>
                      <span className="tnum" aria-live="polite">
                        {l.qty}
                      </span>
                      <button onClick={() => setQty(l.slug, l.size, Math.min(9, l.qty + 1))} aria-label="One more">
                        +
                      </button>
                    </div>
                    <button className="link small soft checkout__remove" onClick={() => remove(l.slug, l.size)}>
                      Remove
                    </button>
                  </div>
                  <p className="tnum">{inr(p.price * l.qty)}</p>
                </li>
              );
            })}
          </ul>
          <aside className="checkout__panel" aria-labelledby="pay-title">
            {discount > 0 && (
              <p className="checkout__code small">
                <span>
                  Code <strong className="tnum">CALMDOWN</strong>, for breathing
                </span>
                <span className="tnum">−{inr(discount)}</span>
              </p>
            )}
            <h2 id="pay-title" className="checkout__total">
              <span>Total</span> <span className="tnum">{inr(total)}</span>
            </h2>
            <p>Online payments open soon. Your bag will wait.</p>
            <ol className="checkout__steps small">
              <li>Tap below. WhatsApp opens with your order already written{discount ? ", code included" : ""}.</li>
              <li>A real person replies within a day to confirm sizes and the delivery address.</li>
              <li>You pay by UPI or card through a link we send. Then the tee leaves within two working days.</li>
            </ol>
            <a className="btn btn--block" href={wa} target="_blank" rel="noopener">
              Order on WhatsApp
            </a>
            <Link href="/drop" className="link small">
              Keep looking
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
