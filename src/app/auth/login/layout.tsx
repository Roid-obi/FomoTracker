import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk ke Akun",
  description:
    "Masuk ke dashboard FomoTracker Anda untuk melihat statistik screen time dan insight kebiasaan harian.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
