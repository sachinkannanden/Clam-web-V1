"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LoopVideo from "@/components/ui/LoopVideo";

const CARDS = [
  {
    name: "Soft first",
    img: "/img/collar-detail.webp",
    alt: "Close-up render of the ribbed collar and soft shoulder of the clam tee",
    text: "Combed cotton, 200 to 260 gsm, pre-washed so it never shrinks a size on you.",
    tone: "shell",
  },
  {
    name: "Cut loose",
    img: "/img/hanging.webp",
    video: "/video/sway.mp4",
    poster: "/video/sway-poster.webp",
    alt: "The clam tee turning slowly from side to side",
    text: "One relaxed, unisex fit with a little room at the shoulder, so it never clings or pulls.",
    tone: "sand",
  },
  {
    name: "Fair price",
    img: "/img/torso.webp",
    alt: "A white t-shirt worn with dark jeans, hands in pockets",
    text: "₹1,049 to ₹1,399, the same every week, with no sales and no made-up 'was' price.",
    tone: "blush",
  },
  {
    name: "Made nearby",
    img: "/img/citystreet.webp",
    alt: "A busy street of shops in an Indian city",
    text: "Knitted, cut and sewn in India by people we've met. Shipping and returns are free.",
    tone: "tide",
  },
];

/** Features — four promises dealt onto the table like cards, in a loose fan. */
export default function Promises() {
  const ref = useRef<HTMLElement>(null);
  const [dealt, setDealt] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setDealt(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="fan" ref={ref} aria-labelledby="fan-title" data-dealt={dealt || undefined}>
      <div className="fan__head">
        <h2 id="fan-title" className="head" data-reveal>
          Made slowly
        </h2>
        <p className="fan__sub" data-reveal style={{ ["--i" as string]: 1 }}>
          Four things we won't rush, whatever the season says.
        </p>
      </div>
      <ul className="fan__table">
        {CARDS.map((c, i) => (
          <li key={c.name} className={`fan__card fan__card--${c.tone}`} style={{ ["--k" as string]: i }}>
            <h3 className="fan__name">{c.name}</h3>
            <div className="fan__pic">
              {"video" in c && c.video ? (
                <LoopVideo src={c.video} poster={c.poster} aria-label={c.alt} />
              ) : (
                <Image src={c.img} alt={c.alt} fill sizes="200px" />
              )}
            </div>
            <p className="fan__text">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
