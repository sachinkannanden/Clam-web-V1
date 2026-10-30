import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Your clam bag. Online payments open soon; until then, order on WhatsApp in one tap.",
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
