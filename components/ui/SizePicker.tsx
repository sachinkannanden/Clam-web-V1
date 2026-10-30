"use client";
import { forwardRef, useRef } from "react";
import { SIZES, type Size } from "@/lib/products";

type Props = { value: Size | null; onChange: (s: Size) => void; label: string; small?: boolean };

/**
 * Sizes as one radio group: a single Tab stop, arrow keys move between sizes (WAI-ARIA radio pattern).
 * No size is chosen for the visitor; "Add to bag" asks for one instead.
 */
const SizePicker = forwardRef<HTMLDivElement, Props>(function SizePicker({ value, onChange, label, small }, ref) {
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const focusable = value ? SIZES.indexOf(value) : 0;
  const move = (i: number) => {
    const n = (i + SIZES.length) % SIZES.length;
    onChange(SIZES[n]);
    btns.current[n]?.focus();
  };
  return (
    <div ref={ref} className={`sizes${small ? " sizes--small" : ""}`} role="radiogroup" aria-label={label} tabIndex={-1}>
      {SIZES.map((s, i) => (
        <button
          key={s}
          ref={(el) => void (btns.current[i] = el)}
          type="button"
          role="radio"
          className="size"
          aria-checked={s === value}
          tabIndex={i === focusable ? 0 : -1}
          onClick={() => onChange(s)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              move(i + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              move(i - 1);
            }
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
});
export default SizePicker;
