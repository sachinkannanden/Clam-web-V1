import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, bySlug, teeImg } from "@/lib/products";
import ProductView from "@/components/ui/ProductView";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name}, ${p.colourName}`,
    description: `${p.line} A soft, unisex ${p.gsm} gsm cotton t-shirt in ${p.colourName}. ₹${p.price.toLocaleString("en-IN")}.`,
    openGraph: { images: [{ url: teeImg(p.slug), width: 900, height: 900 }] },
  };
}

export default async function TeePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.story,
    color: p.colourName,
    image: ["front", "three", "back"].map((v) => `https://wearclam.in/tees/${p.slug}-${v}.webp`),
    brand: { "@type": "Brand", name: "clam" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: "https://schema.org/PreOrder" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView slug={p.slug} />
    </>
  );
}
