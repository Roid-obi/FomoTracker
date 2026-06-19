"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DetailClient from "./detail-client";

function DetailContent() {
  const searchParams = useSearchParams();
  const tanggal =
    searchParams.get("tanggal") ||
    new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return <DetailClient tanggal={tanggal} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 font-poppins animate-pulse">
          {/* Back Button */}
          <div className="h-4 bg-muted-light rounded w-32" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <div className="h-6 bg-muted-light rounded w-48" />
              <div className="h-4 bg-muted-light rounded w-36 mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 bg-muted-light rounded w-28" />
              <div className="h-10 bg-muted-light rounded w-28" />
            </div>
          </div>

          {/* 3 cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 bg-card">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="mt-4 space-y-2">
                <div className="h-7 bg-muted-light rounded w-16" />
                <div className="h-3 bg-muted-light rounded w-24" />
              </div>
            </div>
            <div className="border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 bg-card">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="mt-4 space-y-2">
                <div className="h-7 bg-muted-light rounded w-16" />
                <div className="h-3 bg-muted-light rounded w-24" />
              </div>
            </div>
            <div className="border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 bg-card">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="mt-4 space-y-2">
                <div className="h-7 bg-muted-light rounded w-16" />
                <div className="h-3 bg-muted-light rounded w-24" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
