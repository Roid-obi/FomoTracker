import type { Metadata } from "next";
import { Poppins, Yellowtail } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "FomoTracker — Pengelola Batas Waktu",
  description:
    "Lacak dan batasi waktu browsing Anda di situs web yang mengganggu. Atur batas waktu kustom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${yellowtail.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
