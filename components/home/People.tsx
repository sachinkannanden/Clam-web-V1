"use client";
import Image from "next/image";
import Seam, { HoverSeam } from "@/components/ui/Seam";
import { useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

const PEOPLE = [
  {
    src: "/img/p6.webp",
    alt: "A young woman in an oversized white t-shirt, hand in pocket, against a white wall",
    role: "For the late coder",
    text: "Stand-up at ten, nap at three, deploy at two in the morning. One tee covers all three.",
  },
  {
    src: "/img/p2.webp",
    alt: "A man in a beige t-shirt sitting on a stool among potted plants",
    role: "For the plant parent",
    text: "Repotting at noon, dinner out at nine. Nobody needs to know about the soil.",
  },
  {
    src: "/img/p4.webp",
    alt: "A bearded man in a white t-shirt against a pale wall",
    role: "For the reluctant meeting-goer",
    text: "Looks put together on camera. Feels like pyjamas everywhere the camera can't see.",
  },
  {
    src: "/img/field.webp",
    alt: "A man in a white cap and a pale t-shirt standing on grass under trees",
    role: "For the second date",
    text: "Relaxed enough to be yourself, considered enough to get you a third.",
  },
];

/** About — who it's for. Four portraits in one loose, staggered row, each drifting at its own pace. */
export default function People() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, undefined, "pass");
  return (
    <section className="people" ref={ref} aria-labelledby="people-title">
      {/* the seam that joins the film to this section, sewn as it scrolls in */}
      <Seam mode="scroll" className="seam--join" />
      <h2 id="people-title" className="people__title display" data-reveal>
        For the unhurried
      </h2>
      <ul className="people__list">
        {PEOPLE.map((p, i) => (
          <li key={p.src} className="people__item" style={{ ["--k" as string]: i }}>
            <div className="people__ph" data-reveal="clip">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 760px) 72vw, 28vw" />
              <HoverSeam />
            </div>
            <h3 className="people__role">{p.role}</h3>
            <p className="people__text">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
