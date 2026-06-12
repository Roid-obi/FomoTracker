"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DetailClient from "./detail-client";

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-xs font-bold text-red-500">
        ID insight tidak ditemukan.
      </div>
    );
  }

  return <DetailClient id={id} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-bold text-muted animate-pulse">
            Memuat rincian insight mingguan...
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
