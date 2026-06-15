import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://fomotracker.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tentang", "/instalasi", "/desain-page"],
      disallow: [
        "/dashboard",
        "/statistik",
        "/insight",
        "/fomo-ai",
        "/notifications",
        "/pengaturan",
        "/onboarding",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
