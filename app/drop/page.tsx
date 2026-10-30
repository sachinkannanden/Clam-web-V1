import type { Metadata } from "next";
import DropList from "@/components/home/DropList";
import { SIZES, SIZE_CHART } from "@/lib/products";

export const metadata: Metadata = {
  title: "The first drop",
  description: "Eight soft, unisex t-shirts from clam, each named after a moment. ₹1,049 to ₹1,399, free shipping across India.",
};

const SIZE_ROWS = SIZES.map((z) => [z, String(SIZE_CHART[z].chest), String(SIZE_CHART[z].length), String(SIZE_CHART[z].sleeve)]);

export default function DropPage() {
  return (
    <>
      <div className="page-top" />
      <DropList standalone />
      <section className="sizeguide wrap" aria-labelledby="sizes-title">
        <div className="sizeguide__text">
          <h2 id="sizes-title" className="head">
            Finding your size
          </h2>
          <p>
            One relaxed, unisex fit. If you like it roomy, go one size up; comfort usually wins. Measurements are of the tee
            lying flat, in centimetres, and may vary by a centimetre either way. (Sample measurements, to be confirmed.)
          </p>
        </div>
        <table className="sizeguide__table tnum">
          <caption className="sr-only">Garment measurements in centimetres</caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest</th>
              <th scope="col">Length</th>
              <th scope="col">Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
