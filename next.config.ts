import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // Disable LightningCSS to avoid Vercel native binary errors
  },
};

export default nextConfig;
