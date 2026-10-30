import type { NextConfig } from "next";

// CLAM_EXPORT=1 builds a static copy into out/ (used for real-device previews with Playwright).
const exportMode = process.env.CLAM_EXPORT === "1";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], unoptimized: exportMode },
  poweredByHeader: false,
  ...(exportMode ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
