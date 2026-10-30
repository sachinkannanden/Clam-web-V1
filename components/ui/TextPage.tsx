import Image from "next/image";

export default function TextPage({
  title,
  intro,
  sections,
  image,
}: {
  title: string;
  intro: string;
  sections: { h: string; p: string[] }[];
  image?: { src: string; alt: string };
}) {
  return (
    <article className="textpage wrap">
      <header className="textpage__head">
        <h1 className="head">
          {title}
        </h1>
        <p className="lead" data-reveal style={{ ["--i" as string]: 1 }}>
          {intro}
        </p>
        {image && (
          <div className="textpage__ph" data-reveal="clip">
            <Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 800px) 100vw, 40vw" />
          </div>
        )}
      </header>
      <div className="textpage__body">
        {sections.map((s, i) => (
          <section key={s.h} data-reveal style={{ ["--i" as string]: i }}>
            <h2 className="textpage__h">{s.h}</h2>
            {s.p.map((t, k) => (
              <p key={k}>{t}</p>
            ))}
          </section>
        ))}
        {/* Placeholder policy text: have it reviewed before going live. */}
      </div>
    </article>
  );
}
