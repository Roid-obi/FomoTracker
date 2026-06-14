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
        <div className="space-y-6 font-poppins animate-pulse">
          {/* Back Button */}
          <div className="h-4 bg-muted-light rounded w-32" />

          {/* Header */}
          <div className="space-y-2">
            <div className="h-6 bg-muted-light rounded w-28" />
            <div className="h-8 bg-muted-light rounded w-80" />
          </div>

          {/* Status Card Skeleton */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted-light/60 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="h-4 bg-muted-light rounded w-36" />
              <div className="h-3 bg-muted-light rounded w-48" />
            </div>
          </div>

          {/* Comparison grid skeleton */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="h-4 bg-muted-light rounded w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-muted-light/40 rounded-2xl border border-border/40" />
              <div className="h-24 bg-muted-light/40 rounded-2xl border border-border/40" />
              <div className="h-24 bg-muted-light/40 rounded-2xl border border-border/40" />
            </div>
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
