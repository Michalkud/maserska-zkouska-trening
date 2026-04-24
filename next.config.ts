import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_STORAGE === "localstorage";

const nextConfig: NextConfig = isStatic
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
      devIndicators: false,
    }
  : {
      devIndicators: false,
    };

export default nextConfig;
