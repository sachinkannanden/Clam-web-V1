"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
const Tee = dynamic(() => import("@/components/three/Tee"), { ssr: false });

function R() {
  const sp = useSearchParams();
  const c = "#" + (sp.get("c") || "e9dfd1");
  const still = sp.get("still") === "1";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: sp.get("bg") ? "#" + sp.get("bg") : "transparent" }}>
      <Tee colour={c} still={still} interactive={!still} shadow={!still} />
    </div>
  );
}
export default function Page() {
  return (
    <Suspense>
      <R />
    </Suspense>
  );
}
