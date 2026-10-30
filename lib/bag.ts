"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { bySlug, type Size } from "./products";

export type BagLine = { slug: string; size: Size; qty: number };

type BagState = {
  lines: BagLine[];
  open: boolean;
  lastAdded: string | null;
  /** the thank-you code earned in "Breathe out first"; carried to the bag, checkout and WhatsApp */
  code: string | null;
  setCode: (code: string | null) => void;
  add: (slug: string, size: Size) => void;
  setQty: (slug: string, size: Size, qty: number) => void;
  remove: (slug: string, size: Size) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
};

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      lastAdded: null,
      code: null,
      setCode: (code) => set({ code }),
      add: (slug, size) =>
        set((s) => {
          const i = s.lines.findIndex((l) => l.slug === slug && l.size === size);
          const lines = [...s.lines];
          if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(9, lines[i].qty + 1) };
          else lines.push({ slug, size, qty: 1 });
          return { lines, open: true, lastAdded: `${slug}:${size}` };
        }),
      setQty: (slug, size, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (slug, size) =>
        set((s) => ({ lines: s.lines.filter((l) => !(l.slug === slug && l.size === size)) })),
      setOpen: (open) => set({ open }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "clam-bag",
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          // private mode or blocked storage: keep the bag in memory only
          const mem: Record<string, string> = {};
          return {
            getItem: (k) => mem[k] ?? null,
            setItem: (k, v) => void (mem[k] = v),
            removeItem: (k) => void delete mem[k],
          };
        }
      }),
      partialize: (s) => ({ lines: s.lines, code: s.code }),
    }
  )
);

export const bagCount = (lines: BagLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const bagTotal = (lines: BagLine[]) =>
  lines.reduce((n, l) => n + (bySlug(l.slug)?.price ?? 0) * l.qty, 0);

/** CALMDOWN: 10% off one tee (the first line in the bag), rounded to the rupee. */
export const CALM_CODE = "CALMDOWN";
export const bagDiscount = (lines: BagLine[], code: string | null) => {
  if (code !== CALM_CODE || !lines.length) return 0;
  return Math.round((bySlug(lines[0].slug)?.price ?? 0) * 0.1);
};

/** Payment adapter seam. Wire Razorpay / Shopify here before launch. */
export async function startCheckout(_lines: BagLine[]): Promise<{ ok: false; reason: string }> {
  return { ok: false, reason: "payments-not-connected" };
}
