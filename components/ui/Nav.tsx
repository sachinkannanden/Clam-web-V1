"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import { useBag, bagCount } from "@/lib/bag";

const LINKS = [
  { href: "/drop", label: "The drop" },
  { href: "/story", label: "Our story" },
  { href: "/contact", label: "Say hello" },
];

export default function Nav() {
  const lines = useBag((s) => s.lines);
  const setOpen = useBag((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const rawPath = usePathname();
  const pathname = rawPath.replace(/\/$/, "") || "/"; // the static export adds trailing slashes
  const toggle = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const count = mounted ? bagCount(lines) : 0;

  useEffect(() => setMounted(true), []);

  // on a dark product field, only the nav items that actually sit over the field switch to pearl
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const mark = () => {
      const h = header.current;
      if (!h) return;
      const stage = document.querySelector<HTMLElement>(".pdp__stage");
      const dark = document.documentElement.dataset.navInk === "light" && stage;
      const edge = dark ? stage.getBoundingClientRect().right : -1;
      h.querySelectorAll<HTMLElement>(".nav__mark, .nav__links a, .nav__bag, .nav__menu").forEach((el) => {
        const r = el.getBoundingClientRect();
        const on = dark && r.right <= edge + 2;
        const straddle = dark && r.left < edge && r.right > edge + 2; // half on the field, half off: give it a ground
        if (on) el.dataset.onDark = "";
        else delete el.dataset.onDark;
        if (straddle) el.dataset.straddle = "";
        else delete el.dataset.straddle;
      });
    };
    const t = setTimeout(mark, 60);
    window.addEventListener("resize", mark);
    // the product page announces its ink on <html>; re-check whenever that changes
    const mo = new MutationObserver(mark);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-nav-ink"] });
    return () => {
      clearTimeout(t);
      mo.disconnect();
      window.removeEventListener("resize", mark);
    };
  }, [rawPath]);
  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    if (menu) window.__lenis?.stop();
    else window.__lenis?.start();
    // while the menu is open, the page behind it is out of reach (keyboard and screen readers too)
    const behind = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => (el.inert = menu));
    if (!menu) return;
    requestAnimationFrame(() => sheet.current?.querySelector<HTMLElement>("a")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      behind.forEach((el) => (el.inert = false));
    };
  }, [menu]);

  return (
    <>
      <header ref={header} className="nav" data-hidden={hidden && !menu ? "" : undefined} data-solid={solid || menu ? "" : undefined}>
        <Link href="/" className="nav__mark" aria-label="clam, home">
          <Wordmark intro={pathname === "/"} />
        </Link>
        <nav aria-label="Main" className="nav__links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="link" aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav__end">
          <button className="nav__bag" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}>
            Bag
            <span className="nav__count tnum" data-pop={count || undefined} key={count}>
              {count}
            </span>
          </button>
          <button
            ref={toggle}
            className="nav__menu"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? "Close" : "Menu"}
          </button>
        </div>
      </header>
      <div id="mobile-menu" ref={sheet} className="sheet" role="dialog" aria-modal="true" aria-label="Menu" data-open={menu || undefined} aria-hidden={!menu} inert={!menu}>
        <ul>
          {[{ href: "/", label: "Home" }, ...LINKS, { href: "/care", label: "Care & returns" }].map((l, i) => (
            <li key={l.href} style={{ ["--i" as string]: i }}>
              <Link href={l.href} className="sheet__link" aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="small sheet__note">Comfortable clothing. No rush.</p>
      </div>
    </>
  );
}
