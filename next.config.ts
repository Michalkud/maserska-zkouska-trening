import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_STORAGE === "localstorage";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = isStatic
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
      devIndicators: false,
      basePath: basePath || undefined,
      assetPrefix: basePath || undefined,
    }
  : {
      devIndicators: false,
    };

export default nextConfig;
