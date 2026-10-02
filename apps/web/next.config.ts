import type { NextConfig } from "next";

const SITE_ID = process.env.SITE_ID ?? "food";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Bakes SITE_ID into both server (build-time) and client bundles so the
  // fully static export knows which site it is without any runtime env access.
  env: {
    SITE_ID,
  },
  transpilePackages: ["@twih/site-config", "@twih/site-food", "@twih/game-core"],
};

export default nextConfig;
