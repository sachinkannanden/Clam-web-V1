export const dynamic = "force-static";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/render", "/checkout"] }], sitemap: "https://wearclam.in/sitemap.xml" };
}
