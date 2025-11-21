import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // disables LightningCSS pipeline
    swcPlugins: [], // ensures SWC fallback behavior
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
