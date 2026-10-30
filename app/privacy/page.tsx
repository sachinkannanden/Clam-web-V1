import type { Metadata } from "next";
import TextPage from "@/components/ui/TextPage";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <TextPage
      title="Privacy"
      intro="We collect as little as we can, and we never sell it."
      image={{ src: "/img/knit-closeup.webp", alt: "A close-up render of the soft cotton knit" }}
      sections={[
        { h: "What we keep", p: ["Your bag is stored in your own browser so it's there when you come back. It never reaches our servers until you place an order.", "If you join the newsletter we keep your email address, and nothing else, to send you up to two emails a month."] },
        { h: "Orders", p: ["When you order we use your name, address and phone number to deliver your tee and nothing else."] },
        { h: "Your choices", p: ["Unsubscribe from any email in one click, or write to hello@wearclam.in to have your details removed."] },
      ]}
    />
  );
}
