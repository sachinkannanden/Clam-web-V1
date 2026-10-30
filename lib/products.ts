// Placeholder catalogue. Swap names, prices, fabric facts and imagery here when the real drop is ready.
export type Product = {
  slug: string;
  name: string;
  colourName: string;
  hex: string; // the tee's own colour (used by the 3D tee and renders)
  field: string; // a quiet background field sampled from the colour
  ink: "dark" | "light"; // which ink reads on `field`
  gsm: number;
  price: number;
  line: string;
  story: string;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

/** Garment measured flat, in cm: chest, length, sleeve. Sample numbers until production samples are final. */
export const SIZE_CHART: Record<Size, { chest: number; length: number; sleeve: number }> = {
  XS: { chest: 96, length: 66, sleeve: 20 },
  S: { chest: 102, length: 68, sleeve: 21 },
  M: { chest: 108, length: 70, sleeve: 22 },
  L: { chest: 114, length: 72, sleeve: 23 },
  XL: { chest: 120, length: 74, sleeve: 24 },
  XXL: { chest: 126, length: 76, sleeve: 25 },
};

export const PRODUCTS: Product[] = [
  {
    slug: "exhale",
    name: "The Exhale Tee",
    colourName: "Shell",
    hex: "#e9dfd1",
    field: "#efe7dc",
    ink: "dark",
    gsm: 220,
    price: 1199,
    line: "The one you'll reach for first.",
    story:
      "Our everyday weight in a warm, undyed-looking shell. Soft from the first wear, and softer after the fortieth.",
  },
  {
    slug: "sunday-office",
    name: "Sunday Office",
    colourName: "Ink",
    hex: "#2a2826",
    field: "#3a3735",
    ink: "light",
    gsm: 240,
    price: 1299,
    line: "Meetings, but make it soft.",
    story:
      "A slightly denser knit that holds its shape under a blazer and forgets the blazer by evening.",
  },
  {
    slug: "second-date",
    name: "Second Date",
    colourName: "Clay",
    hex: "#b9826c",
    field: "#d7b3a3",
    ink: "dark",
    gsm: 220,
    price: 1349,
    line: "Relaxed enough to be yourself.",
    story:
      "A warm, earthy colour that looks considered without looking like you tried. Which you did, a little.",
  },
  {
    slug: "low-tide",
    name: "Low Tide",
    colourName: "Sea glass",
    hex: "#a2b5aa",
    field: "#c5d2ca",
    ink: "dark",
    gsm: 200,
    price: 1099,
    line: "Light as a slow afternoon.",
    story:
      "Our lightest knit, for the hot months and the long walks. Breathes the way you should.",
  },
  {
    slug: "slow-commute",
    name: "Slow Commute",
    colourName: "Sand",
    hex: "#d3bf9f",
    field: "#e2d4bd",
    ink: "dark",
    gsm: 220,
    price: 1249,
    line: "For the long way round.",
    story:
      "Wet-sand beige with a dry hand feel. Goes with the bus, the metro and the scenic route.",
  },
  {
    slug: "do-not-disturb",
    name: "Do Not Disturb",
    colourName: "Charcoal",
    hex: "#45413e",
    field: "#57524e",
    ink: "light",
    gsm: 260,
    price: 1399,
    line: "Heavyweight. Unbothered.",
    story:
      "Our heaviest tee. A structured drape that sits like a jacket and feels like a blanket.",
  },
  {
    slug: "pearl",
    name: "Pearl",
    colourName: "Off-white",
    hex: "#f3efe8",
    field: "#e9e3d9",
    ink: "dark",
    gsm: 200,
    price: 1049,
    line: "The everyday blank, done properly.",
    story:
      "The white tee, minus the see-through problem: light and bright, but opaque.",
  },
  {
    slug: "nap-theory",
    name: "Nap Theory",
    colourName: "Blush",
    hex: "#e2bfb2",
    field: "#ecd5cc",
    ink: "dark",
    gsm: 220,
    price: 1149,
    line: "Tested extensively. Horizontally.",
    story:
      "The colour of the inside of a shell. Made for lie-ins, and fine for everything after.",
  },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const OCCASIONS = ["home", "street", "desk", "date", "studio"] as const;

/** Product renders from Blender (blender/clam-tee.blend), 900×900, transparent. */
export type TeeView = "front" | "three" | "back";
export const teeImg = (slug: string, view: TeeView = "front") => `/tees/${slug}-${view}.webp`;
