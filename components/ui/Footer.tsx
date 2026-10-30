"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Wordmark from "./Wordmark";

const MENU = [
  { href: "/drop", label: "The drop" },
  { href: "/story", label: "Our story" },
  { href: "/care", label: "Care & returns" },
  { href: "/contact", label: "Say hello" },
  { href: "/checkout", label: "Your bag" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("error");
      return;
    }
    // Newsletter provider is wired before launch; for now the address stays in this browser only.
    setState("done");
  };

  return (
    <footer className="foot" id="footer">
      <div className="foot__split">
        <div className="foot__photo">
          <Image src="/img/knit.webp" alt="Close-up of soft, loosely knitted cotton" fill sizes="(max-width: 800px) 100vw, 50vw" />
        </div>
        <div className="foot__field">
          <h2 className="foot__title">Join the slow lane</h2>
          <form className="foot__form" onSubmit={submit} noValidate>
            <label htmlFor="nl-email" className="small">
              Two emails a month, max. New drops and the odd good thought.
            </label>
            <div className="foot__row">
              <input
                id="nl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@somewhere.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState("idle");
                }}
                aria-invalid={state === "error"}
                aria-describedby="nl-msg"
              />
              <button className="btn btn--ink" type="submit">
                Join
              </button>
            </div>
            <p id="nl-msg" className="small foot__msg" role="status">
              {state === "done" && "You're in. We'll write when it's worth it."}
              {state === "error" && "That address looks a bit off. Try once more?"}
            </p>
          </form>
          <ul className="foot__menu">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link href={m.href}>{m.label}</Link>
              </li>
            ))}
          </ul>
          <div className="foot__blocks small">
            <div>
              <p>hello@wearclam.in</p>
              <p>WhatsApp +91 00000 00000</p>
            </div>
            <div>
              <p>
                <a className="link" href="https://instagram.com/wearclam" rel="noopener">
                  Instagram @wearclam
                </a>
              </p>
              <p>Made in India</p>
            </div>
          </div>
        </div>
      </div>
      <div className="foot__band">
        <Wordmark className="foot__mark" />
        <div className="foot__legal small">
          <p>© {new Date().getFullYear()} clam. Comfortable clothing.</p>
          <p>
            <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> ·{" "}
            <Link href="/story#credits">Photo credits</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
