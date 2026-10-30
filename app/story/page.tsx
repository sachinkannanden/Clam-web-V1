import type { Metadata } from "next";
import Seam from "@/components/ui/Seam";
import Image from "next/image";
import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import Credits from "@/components/ui/Credits";

export const metadata: Metadata = {
  title: "Our story",
  description: "Why clam is calm, rearranged: comfortable clothing that doesn't care where you're going.",
};

const CREDITS = [
  ["Day reel, bed", "home.webp", "photo-1688127827739-b59c5f1f2bb0"],
  ["Day reel, steps", "street.webp", "photo-1622445270936-5dcb604970e7"],
  ["Day reel, office", "desk.webp", "photo-1771054244002-4445dc1da2eb"],
  ["Day reel, café", "date.webp", "photo-1644446770253-5c6b45c38ba8"],
  ["Day reel, poster wall", "studio.webp", "photo-1622445272461-c6580cab8755"],
  ["Asleep, black and white", "bedbw.webp", "photo-1502666689584-945597854f01"],
  ["Market street", "citystreet.webp", "photo-1728325444513-f6f7bdd0950a"],
  ["Tea by the window", "window.webp", "photo-1758347262341-61a99a04e17a"],
  ["Cotton weave", "weave.webp", "photo-1615799998603-7c6270a45196"],
  ["Knit close-up", "knit.webp", "photo-1643313260651-9c335822ecde"],
  ["Tee on a hanger", "hanging.webp", "photo-1581655353564-df123a1eb820"],
  ["White tee, hands in pockets", "torso.webp", "photo-1574180566232-aaad1b5b8450"],
  ["Reading in the park", "park2.webp", "photo-1785412723041-97d74677dd0c"],
  ["On the sofa", "lounge.webp", "photo-1590072454220-561046bbb667"],
  ["Evening on the sofa", "unwind.webp", "photo-1641573231816-d152f08ea665"],
  ["Reading on the sofa", "sofa.webp", "photo-1614273662376-29d8ce44b829"],
  ["Portraits", "p6, p2, p4, field", "photo-1780566758129 · 1785613592382 · 1586790170083 · 1535643302794"],
];

export default function StoryPage() {
  return (
    <div className="story">
      <header className="story__hero wrap">
        <h1 className="display" data-reveal>
          Calm,
          <br />
          rearranged.
          <Seam mode="view" delay={700} speed={520} className="story__seam" />
        </h1>
        <p className="lead story__lede" data-reveal style={{ ["--i" as string]: 1 }}>
          clam is a clothing label with one idea: comfortable clothes shouldn't need permission to leave the house.
        </p>
        <div className="story__heroph" data-reveal="clip">
          <Image src="/img/lounge.webp" alt="A woman in a white t-shirt stretched out on a grey sofa by the window" fill preload sizes="(max-width: 800px) 100vw, 40vw" />
        </div>
      </header>

      <section className="story__name wrap" aria-labelledby="name-title">
        <div className="story__mark" aria-hidden="true">
          <Wordmark />
        </div>
        <div>
          <h2 id="name-title" className="head">
            Why the name
          </h2>
          <p>
            Move two letters in <em>calm</em> and you get <em>clam</em>: the same calm, rearranged to fit a working day. A
            clam is also very good at staying put and unbothered, which we admire. Hover over the word above, or tap it,
            and watch it change its mind.
          </p>
        </div>
      </section>

      <section className="story__split" aria-labelledby="barrier-title">
        <div className="story__ph" data-reveal="clip">
          <Image src="/img/desk.webp" alt="A woman in a white t-shirt laughing at her desk" fill sizes="(max-width: 800px) 100vw, 50vw" />
        </div>
        <div className="story__text">
          <h2 id="barrier-title" className="head" data-reveal>
            The barrier
          </h2>
          <p>
            Somewhere along the way we were told that soft clothes are for home, and that the office, the date and the
            dinner each need their own uniform. So we spend the day slightly uncomfortable, then change the moment we get
            home.
          </p>
          <p>
            We think one good t-shirt can do the whole day. Cut with a little room, in colours that sit as well under a
            blazer as they do on a sofa.
          </p>
        </div>
      </section>

      <section className="story__values wrap" aria-labelledby="values-title">
        <h2 id="values-title" className="head" data-reveal>
          What we care about
        </h2>
        <ul className="story__dl">
          <li data-reveal>
            <div className="story__vph" data-reveal="clip">
              <Image src="/img/knit.webp" alt="Soft knitted cotton, close up" fill sizes="(max-width: 800px) 100vw, 22vw" />
            </div>
            <h3>Comfort before trend</h3>
            <p>If it itches, pinches or needs adjusting, it doesn't ship. We'd rather be late than itchy.</p>
          </li>
          <li data-reveal style={{ ["--i" as string]: 1 }}>
            <div className="story__vph" data-reveal="clip">
              <Image src="/img/window.webp" alt="A cup of tea on a wooden sill by an open window" fill sizes="(max-width: 800px) 100vw, 22vw" />
            </div>
            <h3>Slow, on purpose</h3>
            <p>Small drops, made in India, restocked when they run out. We don't do flash sales or countdown timers.</p>
          </li>
          <li data-reveal style={{ ["--i" as string]: 2 }}>
            <div className="story__vph" data-reveal="clip">
              <Image src="/img/hanging.webp" alt="A plain white t-shirt on a hanger against a dark wall" fill sizes="(max-width: 800px) 100vw, 22vw" />
            </div>
            <h3>Honest prices</h3>
            <p>₹1,049 to ₹1,399, the same price every day. That covers what it costs to make well, plus what it takes to keep going.</p>
          </li>
          <li data-reveal style={{ ["--i" as string]: 3 }}>
            <div className="story__vph" data-reveal="clip">
              <Image src="/img/sofa.webp" alt="Someone reading on a sofa, book open on their lap" fill sizes="(max-width: 800px) 100vw, 22vw" />
            </div>
            <h3>Room for everyone</h3>
            <p>One unisex fit from XS to XXL. Take your usual size for a neat fit, or one up if you like it roomy. Both are fine for bed.</p>
          </li>
        </ul>
        <p className="small soft">Production details are being finalised with our makers; this page will name them when they are.</p>
        <Link href="/drop" className="btn btn--ink">
          See the drop
        </Link>
      </section>

      <section className="story__credits wrap" id="credits" aria-labelledby="credits-title">
        <h2 id="credits-title" className="story__credits-title">
          Photo credits
        </h2>
        <p className="small soft">
          Photographs are placeholders from Unsplash (Unsplash License) and the curtain clip from Pexels (Pexels License),
          used until clam's own shoots are ready. The 3D tee and product images are rendered in Blender.
        </p>
        <Credits rows={[...CREDITS.map((c) => [c[0], `Unsplash ${c[2]}`] as [string, string]), ["Brand film", "Pexels video 38781080"]]} />
      </section>
    </div>
  );
}
