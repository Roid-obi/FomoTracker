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

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "FomoTracker",
    template: "%s | FomoTracker",
  },
  description: "Track habits, activities, and usage insights with style",
  openGraph: {
    title: "FomoTracker",
    description: "Track habits, activities, and usage insights with style",
    url: baseUrl,
    siteName: "FomoTracker",
    images: [
      {
        url: "/preview-fomotracker.png",
        width: 1200,
        height: 630,
        alt: "FomoTracker - Track habits, activities, and usage insights with style",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FomoTracker",
    description: "Track habits, activities, and usage insights with style",
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
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
