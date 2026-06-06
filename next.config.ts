import type { NextConfig } from "next";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: isMobile ? "export" : undefined,
  images: isMobile ? { unoptimized: true } : undefined,
};

export default nextConfig;
