"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/utils/api";

const formatPeriodRange = (startStr: string, endStr: string) => {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
};

export default function DetailClient({ id }: { id: string }) {
  const {
    data: insightData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["insight-detail", id],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/insight/${id}`,
      );
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
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

        {/* 2 columns highlights skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs h-32" />
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs h-32" />
        </div>

        {/* Analysis skeleton */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs h-40" />
      </div>
    );
  }

  if (error || !insightData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="text-red-500 font-bold text-sm">
          Laporan insight tidak ditemukan
        </div>
        <Link
          href="/insight"
          className="text-xs font-bold text-secondary hover:underline"
        >
          Kembali ke Insight
        </Link>
      </div>
    );
  }

  const insight = insightData;
  const comparison = insightData.comparison || {
    comparisonDuration: "same",
    comparisonDurationText: "Tidak ada data pembanding minggu sebelumnya",
    comparisonFlags: "sama",
    comparisonFlagsText: "Tidak ada data pembanding minggu sebelumnya",
    comparisonOverall: "Stabil",
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "good":
        return {
          emoji: "😊",
          label: "Minggu yang Baik!",
          colorClass:
            "text-emerald-800 bg-emerald-50 border-emerald-200 shadow-xs",
        };
      case "attention":
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-amber-800 bg-amber-50 border-amber-200 shadow-xs",
        };
      case "heavy":
        return {
          emoji: "😟",
          label: "Minggu yang Cukup Berat",
          colorClass: "text-red-800 bg-red-50 border-red-200 shadow-xs",
        };
      default:
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-muted bg-muted-light/60 border-border shadow-xs",
        };
    }
  };

  const getDurationComparison = (duration: string) => {
    if (duration === "up") {
      return {
        label: "↑ Lebih lama",
        colorClass: "text-red-600 bg-red-50/50 border-red-100",
        icon: <TrendingUp className="w-4 h-4 text-red-500 shrink-0" />,
      };
    }
    if (duration === "down") {
      return {
        label: "↓ Lebih singkat",
        colorClass: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
        icon: <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />,
      };
    }
    return {
      label: "→ Sama",
      colorClass: "text-slate-600 bg-slate-50/50 border-slate-100",
      icon: <Minus className="w-4 h-4 text-slate-500 shrink-0" />,
    };
  };

  const getFlagsComparison = (flags: string) => {
    const isMore = flags.includes("banyak");
    const isLess = flags.includes("sedikit");
    if (isMore) {
      return {
        label: "Lebih banyak",
        colorClass: "text-red-700 bg-red-50/50 border-red-100",
      };
    }
    if (isLess) {
      return {
        label: "Lebih sedikit",
        colorClass: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
      };
    }
    return {
      label: "Sama",
      colorClass: "text-slate-600 bg-slate-50/50 border-slate-100",
    };
  };

  const getOverallComparison = (overall: string) => {
    const text = overall.toLowerCase();
    if (text.includes("memburuk")) {
      return {
        label: "Memburuk",
        colorClass: "text-red-700 bg-red-50/50 border-red-100 font-bold",
      };
    }
    if (text.includes("membaik")) {
      return {
        label: "Membaik",
        colorClass:
          "text-emerald-700 bg-emerald-50/50 border-emerald-100 font-bold",
      };
    }
    return {
      label: "Stabil",
      colorClass: "text-slate-700 bg-slate-50/50 border-slate-100 font-bold",
    };
  };

  // Parse tips
  let tips: string[] = [];
  if (insight.aiTips) {
    try {
      tips = JSON.parse(insight.aiTips);
    } catch {
      tips = [];
    }
  }

  const cond = getStatusDetails(insight.weeklyStatus);
  const durComp = getDurationComparison(comparison.comparisonDuration);
  const flagComp = getFlagsComparison(comparison.comparisonFlags);
  const overallComp = getOverallComparison(comparison.comparisonOverall);

  return (
    <div className="space-y-6 font-poppins">
      {/* Back Button */}
      <Link
        href="/insight"
        className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Insight
      </Link>

      {/* Header */}
      <div>
        <span className="text-[10px] text-muted font-bold tracking-wider uppercase bg-muted-light/60 border border-border px-3 py-1 rounded-full">
          Detail Laporan Mingguan
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight mt-2.5">
          Insight Minggu:{" "}
          {formatPeriodRange(insight.weekStart, insight.weekEnd)}
        </h1>
      </div>

      {/* Kondisi Minggu Itu */}
      <div
        className={`p-6 rounded-3xl border flex items-center gap-4 ${cond.colorClass}`}
      >
        <span
          className="text-4xl select-none"
          role="img"
          aria-label="Status Emoji"
        >
          {cond.emoji}
        </span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-75">
            Status Rata-rata
          </span>
          <h3 className="text-base sm:text-lg font-black">{cond.label}</h3>
          <p className="text-xs font-light mt-0.5 leading-relaxed opacity-95">
            Rata-rata skor perilakumu berada pada {insight.avgBehavioralScore}
            /100. {insight.aiWeeklyStatusLabel}.
          </p>
        </div>
      </div>

      {/* Comparison section */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
          <Clock className="w-4.5 h-4.5 text-muted shrink-0" />
          <span>Dibanding Minggu Sebelumnya</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Durasi HP */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Durasi pakai HP
            </span>
            <div>
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${durComp.colorClass}`}
              >
                {durComp.icon}
                <span>{durComp.label}</span>
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                {comparison.comparisonDurationText}
              </p>
            </div>
          </div>

          {/* Kebiasaan Bermasalah */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Kebiasaan Bermasalah
            </span>
            <div>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${flagComp.colorClass}`}
              >
                {flagComp.label}
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                {comparison.comparisonFlagsText}
              </p>
            </div>
          </div>

          {/* Kondisi Keseluruhan */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Kondisi Keseluruhan
            </span>
            <div>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] ${overallComp.colorClass}`}
              >
                {overallComp.label}
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                Pola perilaku secara umum menunjukkan tanda{" "}
                {comparison.comparisonOverall.toLowerCase() === "membaik"
                  ? "peningkatan kontrol diri"
                  : comparison.comparisonOverall.toLowerCase() === "memburuk"
                    ? "penurunan kontrol diri"
                    : "stabilisasi"}
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yang Sudah Dilakukan dengan Baik */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span>Yang Sudah Dilakukan dengan Baik</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {insight.aiPositiveNotes || "Tidak ada catatan khusus."}
          </p>
        </div>

        {/* Yang Perlu Diperhatikan */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
            <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <span>Yang Perlu Diperhatikan</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {insight.aiConcernNotes || "Tidak ada catatan khusus."}
          </p>
        </div>
      </div>

      {/* Analisis AI */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Brain className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Analisis Minggu Itu
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed font-light whitespace-pre-line">
          {insight.aiAnalysis}
        </p>
      </div>

      {/* Tips yang Diberikan */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Lightbulb className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Tips yang Diberikan
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.length === 0 ? (
            <p className="text-xs text-muted font-light">
              Tidak ada saran khusus.
            </p>
          ) : (
            tips.map((tip: string, idx: number) => (
              <div
                key={tip}
                className="p-4 rounded-2xl border border-border/60 bg-muted-light/10 space-y-2 flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Saran 0{idx + 1}
                </span>
                <p className="text-xs text-primary font-semibold leading-relaxed">
                  {tip}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
