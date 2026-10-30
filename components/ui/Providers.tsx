"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __lenis?: Lenis;
    __calm?: { velocity: number };
  }
}

/** Smooth scroll, entrance reveals and a shared scroll velocity for the calm meter. */
export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.__calm = { velocity: 0 };
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    window.__lenis = lenis;
    lenis.on("scroll", (l: Lenis) => {
      if (window.__calm) window.__calm.velocity = Math.abs(l.velocity);
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // scroll to top on route change
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  // entrance reveals: [data-reveal] gets .is-in once, staggered by --i.
  // Clip reveals are watched through their parent (a fully clipped box never "intersects").
  useEffect(() => {
    const owner = new Map<Element, Element[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (owner.get(e.target) ?? []).forEach((t) => t.classList.add("is-in"));
          owner.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in):not([data-watch])").forEach((el) => {
        el.setAttribute("data-watch", "");
        const watch = el.dataset.reveal === "clip" && el.parentElement ? el.parentElement : el;
        const list = owner.get(watch);
        if (list) list.push(el);
        else {
          owner.set(watch, [el]);
          io.observe(watch);
        }
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      document.querySelectorAll("[data-watch]").forEach((el) => el.removeAttribute("data-watch"));
    };
  }, [pathname]);

  return <>{children}</>;
}
