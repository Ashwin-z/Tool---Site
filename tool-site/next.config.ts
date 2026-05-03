import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "palworld.gg",
        pathname: "/images/full_palicon/**",
      },
    ],
  },
  experimental: {
    cpus: 1,
  },
  serverExternalPackages: ["puppeteer-core", "@napi-rs/canvas", "exceljs"],
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      fs: { browser: "./src/lib/empty.js" },
      "node:fs": { browser: "./src/lib/empty.js" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // pptxgenjs imports node:fs but doesn't need it in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
