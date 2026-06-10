import type { NextConfig } from "next";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: isMobile ? "export" : undefined,
  images: isMobile ? { unoptimized: true } : undefined,

  async headers() {
    return [
      {
        source: "/api/:path*",
                headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  { key: "Access-Control-Allow-Origin", value: "*" }, // Ganti * dengan domain tertentu jika ingin lebih aman (misal: https://example.com)
                  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
      }
    ];
  },
};

export default nextConfig;
