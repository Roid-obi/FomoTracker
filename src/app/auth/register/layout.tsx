import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description:
    "Mulai perjalanan kesehatan digital Anda bersama FomoTracker. Daftar sekarang gratis!",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
