"use client";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

/** First-visit loader: "calm" rearranges into "clam", then the page breathes in. Pure CSS fallback hides it. */
export default function Loader() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.setItem("clam-seen", "1");
    } catch {}
    const t = setTimeout(() => setGone(true), 2100);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div className="loader" aria-hidden="true">
      <Wordmark intro interactive={false} className="loader__mark" />
      <p className="loader__note small">breathing in…</p>
    </div>
  );
}
