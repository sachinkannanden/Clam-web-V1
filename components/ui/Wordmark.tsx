"use client";
import { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";

const CLAM = ["c", "l", "a", "m"];
const CALM = ["c", "a", "l", "m"];

type Props = {
  className?: string;
  /** start as "calm" and settle into "clam" once mounted */
  intro?: boolean;
  /** rearrange on hover / focus / tap */
  interactive?: boolean;
  /** controlled state; overrides internal hover */
  calm?: boolean;
  as?: "span" | "div";
};

/**
 * The brand wordmark. Its letters quietly swap between "clam" and "calm".
 * FLIP animation on transform only; no layout thrash, reduced motion respected via CSS.
 */
export default function Wordmark({ className = "", intro = false, interactive = true, calm, as = "span" }: Props) {
  const [internal, setInternal] = useState(intro);
  const isCalm = calm ?? internal;
  const order = isCalm ? CALM : CLAM;
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  const prev = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!intro) return;
    const t = setTimeout(() => setInternal(false), 650);
    return () => clearTimeout(t);
  }, [intro]);

  useLayoutEffect(() => {
    const els = refs.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Object.entries(els).forEach(([k, el]) => {
      if (!el) return;
      const x = el.offsetLeft;
      const before = prev.current[k];
      if (before !== undefined && before !== x && !reduce) {
        const dx = before - x;
        el.animate(
          [
            { transform: `translate3d(${dx}px,0,0)` },
            { transform: `translate3d(${dx * 0.45}px,${k === "a" ? -0.18 : k === "l" ? 0.12 : 0}em,0)`, offset: 0.5 },
            { transform: "translate3d(0,0,0)" },
          ],
          { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      }
      prev.current[k] = x;
    });
  }, [isCalm]);

  const on = useCallback(() => interactive && calm === undefined && setInternal(true), [interactive, calm]);
  const off = useCallback(() => interactive && calm === undefined && setInternal(false), [interactive, calm]);

  const Tag = as;
  return (
    <Tag
      className={`wordmark ${className}`}
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      aria-label="clam"
      data-calm={isCalm || undefined}
    >
      {order.map((k) => (
        <span key={k} ref={(el) => void (refs.current[k] = el)} aria-hidden="true" className="wordmark__l">
          {k}
        </span>
      ))}
    </Tag>
  );
}
