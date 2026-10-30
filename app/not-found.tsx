import Link from "next/link";
import NapThread from "@/components/ui/NapThread";
import Image from "next/image";
import Wordmark from "@/components/ui/Wordmark";

export default function NotFound() {
  return (
    <div className="nf wrap">
      <div className="nf__text">
        <Wordmark className="nf__mark" intro />
        <h1 className="head" data-reveal>
          This page went to take a nap.
        </h1>
        <p className="lead" data-reveal style={{ ["--i" as string]: 1 }}>
          We'd wake it, but it looked so comfortable.
        </p>
        <Link href="/" className="btn btn--ink" data-reveal style={{ ["--i" as string]: 2 }}>
          Back to the home page
        </Link>
      </div>
      <div className="nf__shell" aria-hidden="true">
        <Image src="/brand/shell.webp" alt="" width={794} height={528} preload sizes="(max-width: 760px) 70vw, 40vw" />
        <NapThread />
      </div>
    </div>
  );
}
