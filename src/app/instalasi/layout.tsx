import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panduan Instalasi",
  description:
    "Langkah mudah mengunduh dan mengintegrasikan FomoTracker Mobile App (Android APK) dan Ekstensi Browser Chrome.",
};

export default function InstalasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
