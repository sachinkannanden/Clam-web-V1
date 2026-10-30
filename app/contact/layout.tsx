import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Say hello",
  description: "Write to clam by email, WhatsApp or Instagram. We reply within a day or two. Slowly, but properly.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
