export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wearclam.in";
  const pages = ["", "/drop", "/story", "/contact", "/care", "/privacy", "/terms"].map((p) => ({ url: base + p, changeFrequency: "weekly" as const }));
  return [...pages, ...PRODUCTS.map((p) => ({ url: `${base}/tee/${p.slug}`, changeFrequency: "weekly" as const }))];
}
