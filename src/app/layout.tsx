import type { Metadata } from "next";
import { Poppins, Yellowtail } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Providers } from "./providers";
import "./globals.css";
import "goey-toast/styles.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const yellowtail = Yellowtail({
  variable: "--font-yellowtail",
  subsets: ["latin"],
  weight: ["400"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "FomoTracker - Kelola Kebiasaan Digital & Screen Time Anda",
    template: "%s | FomoTracker",
  },
  description:
    "Pantau durasi pemakaian aplikasi HP dan browser secara real-time, kurangi screen time media sosial yang berlebihan, dan dapatkan insight kebiasaan sehat berbasis AI bersama FomoTracker.",
  keywords: [
    "digital wellbeing",
    "screen time tracker",
    "pantau pemakaian hp",
    "adiksi media sosial",
    "fomo",
    "fomotracker",
    "kesejahteraan digital",
    "analisis kebiasaan",
    "fomoai",
    "olivia 2026",
  ],
  openGraph: {
    title: "FomoTracker - Kelola Kebiasaan Digital & Screen Time Anda",
    description:
      "Pantau durasi pemakaian aplikasi HP dan browser secara real-time, kurangi screen time media sosial yang berlebihan, dan dapatkan insight kebiasaan sehat berbasis AI bersama FomoTracker.",
    url: baseUrl,
    siteName: "FomoTracker",
    images: [
      {
        url: "/preview-fomotracker.png",
        width: 1200,
        height: 630,
        alt: "FomoTracker - Kelola Kebiasaan Digital & Screen Time Anda",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FomoTracker - Kelola Kebiasaan Digital & Screen Time Anda",
    description:
      "Pantau durasi pemakaian aplikasi HP dan browser secara real-time, kurangi screen time media sosial yang berlebihan, dan dapatkan insight kebiasaan sehat berbasis AI bersama FomoTracker.",
    images: ["/preview-fomotracker.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-fomotracker.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${yellowtail.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        <Providers>
          {!isMobile && <Navbar />}
          {children}
          {!isMobile && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
