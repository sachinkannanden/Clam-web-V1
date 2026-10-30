import type { Metadata } from "next";
import TextPage from "@/components/ui/TextPage";

export const metadata: Metadata = { title: "Care & returns", description: "Shipping, returns and how to look after your clam tee." };

export default function Care() {
  return (
    <TextPage
      title="Care & returns"
      intro="Free shipping across India, free returns for 30 days, and a few tips to keep your tee soft for years."
      image={{ src: "/img/hanging.webp", alt: "A plain white t-shirt on a hanger against a dark wall" }}
      sections={[
        { h: "Shipping", p: ["Free on every order across India. Orders leave us in 1 to 2 working days and usually arrive within 3 to 7.", "We'll send a tracking link on WhatsApp or email, whichever you prefer."] },
        { h: "Returns and exchanges", p: ["Changed your mind, or the size isn't right? Return or exchange within 30 days of delivery, unworn and unwashed, with tags. Pickup is free.", "Refunds go back to your original payment method within 5 to 7 working days of the tee reaching us."] },
        { h: "Looking after your tee", p: ["Cold wash, inside out, with similar colours. Mild detergent, no bleach.", "Line dry in the shade. Skip the tumble dryer; it's not you, it's the heat.", "Iron on low, inside out, if you must."] },
      ]}
    />
  );
}
