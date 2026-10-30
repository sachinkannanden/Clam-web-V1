import type { Metadata } from "next";
import TextPage from "@/components/ui/TextPage";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <TextPage
      title="Terms"
      intro="The short version: be kind, and we'll do our best to be too."
      image={{ src: "/img/sea.webp", alt: "A calm, flat sea under a pale sky" }}
      sections={[
        { h: "Using this site", p: ["Everything here, from the words to the 3D tee, belongs to clam unless credited otherwise. Please don't copy it without asking."] },
        { h: "Prices and orders", p: ["Prices are in Indian rupees and include taxes. If something is priced wrongly, we'll tell you before we take any payment."] },
        { h: "Codes", p: ["Codes like CALMDOWN apply once per customer, to your first tee, and can't be combined with other offers."] },
      ]}
    />
  );
}
