"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  PRODUCTS,
  SIZES,
  SIZE_CHART,
  bySlug,
  inr,
  type Size,
  teeImg,
} from "@/lib/products";
import { useBag } from "@/lib/bag";
import SizePicker from "./SizePicker";
import { DAY } from "@/components/home/Hero";

const Tee = dynamic(() => import("@/components/three/Tee"), { ssr: false });

export default function ProductView({ slug }: { slug: string }) {
  const p = bySlug(slug)!;
  const idx = PRODUCTS.findIndex((q) => q.slug === slug);
  const next = PRODUCTS[(idx + 1) % PRODUCTS.length];
  const [size, setSize] = useState<Size | null>(null);
  const [ask, setAsk] = useState(false);
  const sizesRef = useRef<HTMLDivElement>(null);
  const [slow, setSlow] = useState(false);
  const [added, setAdded] = useState(false);
  const add = useBag((s) => s.add);
  const buy = useRef<HTMLButtonElement>(null);
  const [showBar, setShowBar] = useState(false);
  const [nearFoot, setNearFoot] = useState(false);
  const [guide, setGuide] = useState(false);

  // the nav sits on this product's colour field until it turns solid: tell it which ink reads there
  useEffect(() => {
    document.documentElement.dataset.navInk = p.ink;
    return () => {
      delete document.documentElement.dataset.navInk;
    };
  }, [p.ink]);

  // phones: once the main button has scrolled away, a small bar keeps "add to bag" one thumb away
  useEffect(() => {
    const el = buy.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    // and steps aside for the footer, whose links and form need that space
    const foot = document.querySelector("footer");
    const io2 = new IntersectionObserver(([e]) =>
      setNearFoot(e.isIntersecting),
    );
    if (foot) io2.observe(foot);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);
  const bar = showBar && !nearFoot;

  const addNow = () => {
    if (!size) {
      setAsk(true);
      sizesRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      sizesRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });
      return;
    }
    add(p.slug, size);
    setAdded(true);
  };
  const fit = size ? SIZE_CHART[size] : null;

  return (
    <article
      className="pdp"
      style={{ ["--field" as string]: p.field }}
      data-ink={p.ink}
    >
      <div className="pdp__top">
        <div className="pdp__stage" data-cursor="pull">
          {!slow ? (
            <Tee colour={p.hex} interactive onSlow={() => setSlow(true)} />
          ) : (
            <Image
              src={teeImg(p.slug, "three")}
              alt={`${p.name} t-shirt in ${p.colourName}`}
              width={900}
              height={900}
              preload
            />
          )}
          {!slow && (
            <p className="pdp__hint small">
              Pull the fabric. It always comes back.
            </p>
          )}
        </div>

        <div className="pdp__info">
          <h1 className="pdp__name">
            {p.name}
          </h1>
          <p className="pdp__what" data-reveal style={{ ["--i" as string]: 1 }}>
            Unisex t-shirt in {p.colourName.toLowerCase()}, {p.gsm} gsm cotton.
          </p>
          <p className="lead" data-reveal style={{ ["--i" as string]: 2 }}>
            {p.line}
          </p>
          <p className="pdp__price tnum">{inr(p.price)}</p>

          <fieldset>
            <legend className="small">This one is {p.colourName.toLowerCase()}. The rest of the drop, by colour:</legend>
            <div className="swatches">
              {PRODUCTS.map((q) => (
                <Link
                  key={q.slug}
                  href={`/tee/${q.slug}`}
                  className="swatch"
                  style={{ background: q.hex }}
                  aria-label={`${q.colourName}, ${q.name}`}
                  aria-current={q.slug === p.slug ? "page" : undefined}
                  scroll={false}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="small">Size, one relaxed unisex fit</legend>
            <SizePicker
              ref={sizesRef}
              small
              value={size}
              label="Size"
              onChange={(z) => {
                setSize(z);
                setAsk(false);
                setAdded(false);
              }}
            />
            <p className="pdp__fit small soft" aria-live="polite">
              {fit && size
                ? `${size}: ${fit.chest} cm chest, ${fit.length} cm long, measured flat.`
                : ask
                  ? "Pick a size first. Not sure? M fits most; the size guide is below."
                  : "Pick a size to see its measurements."}
            </p>
          </fieldset>

          <button
            ref={buy}
            className="btn btn--ink btn--block"
            onClick={addNow}
          >
            {added ? "In the bag. No rush." : size ? `Add to bag · ${size} · ${inr(p.price)}` : "Pick a size"}
          </button>
          <p className="small soft">
            Free shipping across India. Free returns for 30 days. Between sizes?
            Go one up.
          </p>

          <div className="pdp__details">
            <details open>
              <summary>The story</summary>
              <p>{p.story}</p>
            </details>
            <details>
              <summary>Fabric and fit</summary>
              <p>
                {p.gsm} gsm combed cotton, pre-washed. Relaxed unisex fit with a
                slightly dropped shoulder and a ribbed collar that keeps its
                shape. (Fabric details are placeholders until production samples
                are final.)
              </p>
            </details>
            <details onToggle={(e) => setGuide(e.currentTarget.open)}>
              <summary>Size guide</summary>
              {guide && (
                <table className="pdp__sizes tnum">
                  <caption className="sr-only">
                    Garment measurements in centimetres, measured flat
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Size</th>
                      <th scope="col">Chest</th>
                      <th scope="col">Length</th>
                      <th scope="col">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES.map((z) => (
                      <tr key={z} aria-current={z === size || undefined}>
                        <th scope="row">{z}</th>
                        <td>{SIZE_CHART[z].chest}</td>
                        <td>{SIZE_CHART[z].length}</td>
                        <td>{SIZE_CHART[z].sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="small soft">
                Sample measurements, to be confirmed with production.
              </p>
            </details>
            <details>
              <summary>Care</summary>
              <p>
                Cold wash, inside out, with similar colours. Line dry in the
                shade. Iron if you must; we won't tell.
              </p>
            </details>
          </div>
        </div>
      </div>

      <section className="pdp__angles" aria-labelledby="angles-title">
        <h2 id="angles-title" className="head" data-reveal>
          Every angle
        </h2>
        <ul className="pdp__anglelist">
          {(["front", "three", "back"] as const).map((v, i) => (
            <li
              key={v}
              data-reveal
              style={{ ["--i" as string]: i, background: p.field }}
            >
              <Image
                src={teeImg(p.slug, v)}
                alt={`${p.name} in ${p.colourName}, ${v === "three" ? "three-quarter" : v} view`}
                width={900}
                height={900}
                sizes="(max-width: 760px) 80vw, 30vw"
              />
              <p className="small">
                {v === "front"
                  ? "Front"
                  : v === "three"
                    ? "Three-quarter"
                    : "Back"}
              </p>
            </li>
          ))}
          <li
            data-reveal
            style={{ ["--i" as string]: 3 }}
            className="pdp__detail"
          >
            <Image
              src="/img/collar-detail.webp"
              alt="Close-up of the ribbed collar and soft shoulder seam"
              fill
              sizes="(max-width: 760px) 80vw, 30vw"
            />
            <p className="small">The collar, up close (shown in Shell)</p>
          </li>
        </ul>
        <p className="small soft pdp__note">
          3D renders made in Blender until our product shoot is ready.
        </p>
      </section>

      <section className="pdp__wear" aria-labelledby="wear-title">
        <h2 id="wear-title" className="head" data-reveal>
          Wear it to
        </h2>
        <ul className="pdp__places">
          {DAY.map((d, i) => (
            <li key={d.src} data-reveal style={{ ["--i" as string]: i }}>
              <div className="pdp__place">
                <Image
                  src={d.src}
                  alt={d.alt}
                  fill
                  sizes="(max-width: 760px) 70vw, 20vw"
                  style={{ objectPosition: d.pos }}
                />
              </div>
              <p className="small">
                <span className="tnum">{d.time}</span> {d.place}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Link
        href={`/tee/${next.slug}`}
        className="pdp__next"
        style={{
          background: next.field,
          color: next.ink === "light" ? "var(--pearl)" : "var(--ink)",
        }}
        scroll={false}
        data-reveal
      >
        <span className="pdp__nextname">{next.name}</span>
        <span className="small">Next tee, {inr(next.price)}</span>
        <Image
          src={teeImg(next.slug, "three")}
          alt=""
          width={240}
          height={240}
        />
      </Link>
      <div
        className="pdp__bar"
        data-show={bar || undefined}
        aria-hidden={!bar}
        inert={!bar}
      >
        <p className="small">
          <span className="pdp__barname">{p.name}</span> · {size ?? "no size yet"} ·{" "}
          <span className="tnum">{inr(p.price)}</span>
        </p>
        <button className="btn btn--ink" onClick={addNow}>
          {added ? "In the bag" : size ? "Add to bag" : "Pick a size"}
        </button>
      </div>
    </article>
  );
}
