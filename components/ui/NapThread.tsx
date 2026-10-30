"use client";
import Seam from "./Seam";

const NAP = (w: number, h: number) => `M ${w * 0.08} ${h * 0.02} C ${w * 0.02} ${h * 0.45}, ${w * 0.42} ${h * 0.3}, ${w * 0.5} ${h * 0.62}`;

/** 404: a few stitches from the shell, and the needle put down mid-seam. Whoever was sewing went for a nap too. */
export default function NapThread() {
  return <Seam mode="view" delay={900} speed={260} rest knot={false} shape={NAP} className="nf__thread" />;
}
