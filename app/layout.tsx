import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./globals.css";
import "./chrome.css";
import "./home.css";
import "./pages.css";
import Providers from "@/components/ui/Providers";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import BagDrawer from "@/components/ui/BagDrawer";
import Cursor from "@/components/ui/Cursor";
import CalmMeter from "@/components/ui/CalmMeter";

export const metadata: Metadata = {
  metadataBase: new URL("https://wearclam.in"),
  title: { default: "clam · comfortable clothing", template: "%s · clam" },
  description:
    "clam makes soft, unisex t-shirts you can wear to bed, to work, on a date and everywhere in between. Comfortable clothing, from ₹1,049.",
  openGraph: {
    title: "clam · comfortable clothing",
    description: "Soft, unisex t-shirts you can wear anywhere. From ₹1,049.",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "clam, comfortable clothing" }],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f5f4f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (Grammarly, password managers, translators) add attributes to <html>/<body>
    // before React loads; suppressHydrationWarning ignores those, one level deep only.
    <html lang="en-IN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <BagDrawer />
          <Cursor />
          <CalmMeter />
        </Providers>
      </body>
    </html>
  );
}
