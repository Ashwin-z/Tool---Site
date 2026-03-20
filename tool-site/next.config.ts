import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["puppeteer-core", "@napi-rs/canvas", "exceljs"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
