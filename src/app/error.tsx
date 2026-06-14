"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 min-h-[70vh] font-poppins text-primary">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl pointer-events-none scale-150" />
        <div className="w-24 h-24 rounded-[32px] bg-red-50/60 border border-red-200/60 flex items-center justify-center relative z-10 mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-600 animate-bounce" />
        </div>
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-2">
        Terjadi Kesalahan
      </h1>
      <h2 className="text-sm font-light text-muted max-w-md mb-8 leading-relaxed">
        Terjadi kesalahan sistem saat memuat halaman ini. Silakan coba muat
        ulang atau kembali ke halaman sebelumnya.
      </h2>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-secondary transition-all shadow-sm cursor-pointer"
        >
          Coba Lagi
        </button>
        <a
          href="/dashboard"
          className="px-6 py-3 rounded-2xl bg-muted-light/60 border border-border text-primary text-sm font-bold hover:bg-muted-light transition-all cursor-pointer"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
