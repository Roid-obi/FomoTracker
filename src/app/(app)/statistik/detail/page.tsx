"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DetailClient from "./detail-client";

function DetailContent() {
  const searchParams = useSearchParams();
  const tanggal =
    searchParams.get("tanggal") || new Date().toISOString().slice(0, 10);
  return <DetailClient tanggal={tanggal} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-bold text-muted animate-pulse">
            Memuat rincian statistik harian...
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
