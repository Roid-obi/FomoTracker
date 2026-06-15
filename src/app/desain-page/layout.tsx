import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panduan Desain",
  description:
    "Dokumentasi sistem desain, palet warna, tipografi, dan komponen visual UI FomoTracker.",
};

export default function DesainPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
