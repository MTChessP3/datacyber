import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Permite que el gateway de preview de space-z.ai sirva la app desde un dominio cruzado
  allowedDevOrigins: [
    "https://*.space-z.ai",
    "https://space-z.ai",
    "http://localhost:3000",
  ],
  // Permite iframes (preview del chat)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Frame-Options", value: "ALLOWALL" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS,PATCH" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With,Content-Type,Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
