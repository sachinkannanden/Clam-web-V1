import type { Metadata } from "next";

export const metadata: Metadata = { title: "Render", robots: { index: false, follow: false } };

export default function RenderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
