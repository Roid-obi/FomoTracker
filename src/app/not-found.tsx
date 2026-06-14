"use client";

import { Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 min-h-[70vh] font-poppins text-primary">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl pointer-events-none scale-150" />
        <div className="w-24 h-24 rounded-[32px] bg-muted-light/60 border border-border/60 flex items-center justify-center relative z-10 mx-auto">
          <Compass className="w-12 h-12 text-primary animate-pulse" />
        </div>
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-muted mb-4">
        Halaman Tidak Ditemukan
      </h2>
      <p className="max-w-md text-sm text-muted font-light leading-relaxed mb-8">
        Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        Mari kembali ke beranda untuk melanjutkan pemantauan aktivitas Anda.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-secondary transition-all shadow-sm cursor-pointer"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
