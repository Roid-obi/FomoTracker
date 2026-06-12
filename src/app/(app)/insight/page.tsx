"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/utils/api";

const _formatMinutesToHoursMins = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

const formatSecToHoursMins = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

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

const _formatIndonesianDateStr = (dateStr: string) => {
  try {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const date = new Date(dateStr);
    const dayName = days[date.getDay()];
    const dateNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
};

export default function InsightPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("Semua");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Calculate this week's start (Monday) and end (Sunday/Today) range for stats
  const getThisWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      startDate: formatDate(monday),
      endDate: formatDate(now < sunday ? now : sunday),
      sundayDate: formatDate(sunday),
    };
  };

  const weekRange = getThisWeekRange();

  // Queries
  const {
    data: latestInsight,
    isLoading: isLatestLoading,
    refetch: refetchLatest,
  } = useQuery({
    queryKey: ["insight-latest"],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: any }>(
          "/api/insight/latest",
        );
        return res.data.data;
      } catch {
        return null;
      }
    },
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["insight-history"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        "/api/insight/history?limit=50",
      );
      return res.data.data;
    },
  });

  const { data: screenTimeData, isLoading: isScreenTimeLoading } = useQuery({
    queryKey: ["thisWeekScreenTime", weekRange.startDate, weekRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/screen-time?startDate=${weekRange.startDate}&endDate=${weekRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: flagsData, isLoading: isFlagsLoading } = useQuery({
    queryKey: ["thisWeekFlags", weekRange.startDate, weekRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any[] }>(
        `/api/statistic/flags?startDate=${weekRange.startDate}&endDate=${weekRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: scoreAverageData, isLoading: isScoreAverageLoading } = useQuery(
    {
      queryKey: [
        "thisWeekScoreAverage",
        weekRange.startDate,
        weekRange.endDate,
      ],
      queryFn: async () => {
        const res = await api.get<{ success: boolean; data: any }>(
          `/api/statistic/score-average?startDate=${weekRange.startDate}&endDate=${weekRange.endDate}`,
        );
        return res.data.data;
      },
    },
  );

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        "/api/insight/generate",
        {},
      );
      if (res.data.success) {
        refetchLatest();
      } else {
        setGenError("Gagal memproses data laporan AI.");
      }
    } catch (err: any) {
      setGenError(
        err.response?.data?.error || err.message || "Terjadi kesalahan.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Status mapping helper
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "good":
        return {
          emoji: "😊",
          label: "Minggu yang Baik!",
          colorClass: "text-emerald-800 bg-emerald-50 border-emerald-200",
        };
      case "attention":
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-amber-800 bg-amber-50 border-amber-200",
        };
      case "heavy":
        return {
          emoji: "😟",
          label: "Minggu yang Cukup Berat",
          colorClass: "text-red-800 bg-red-50 border-red-200",
        };
      default:
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-muted bg-muted-light/60 border-border",
        };
    }
  };

  const getStatusFromScore = (score: number) => {
    if (score < 40) return "good";
    if (score < 70) return "attention";
    return "heavy";
  };

  if (
    isLatestLoading ||
    isHistoryLoading ||
    isScreenTimeLoading ||
    isFlagsLoading ||
    isScoreAverageLoading
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-muted animate-pulse">
          Membuat narasi insight AI...
        </div>
      </div>
    );
  }

  // Parse this week's data
  const thisWeekScore = scoreAverageData?.averageScore ?? 0;
  const thisWeekStatus = getStatusFromScore(thisWeekScore);
  const condThisWeek = getStatusDetails(thisWeekStatus);

  const activeFlags = (flagsData ?? [])
    .filter((f: any) => f.count > 0)
    .sort((a: any, b: any) => b.count - a.count);

  // Parse tips
  let tips: string[] = [];
  if (latestInsight?.aiTips) {
    try {
      tips = JSON.parse(latestInsight.aiTips);
    } catch (_e) {
      tips = [];
    }
  }

  // Generate dynamic month list from history data
  const monthsList = ["Semua"];
  if (historyData?.items) {
    const monthsSet = new Set<string>();
    for (const item of historyData.items) {
      if (item.weekStart) {
        const date = new Date(item.weekStart);
        const mNames = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        const label = `${mNames[date.getMonth()]} ${date.getFullYear()}`;
        monthsSet.add(label);
      }
    }
    monthsList.push(...Array.from(monthsSet));
  }

  const filteredPastInsights = (historyData?.items ?? []).filter(
    (insight: any) => {
      if (selectedMonth === "Semua") return true;
      const date = new Date(insight.weekStart);
      const mNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const label = `${mNames[date.getMonth()]} ${date.getFullYear()}`;
      return label === selectedMonth;
    },
  );

  return (
    <div className="space-y-8 font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Insight AI
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Analisis komprehensif perilaku penggunaan gawai secara otomatis dengan
          narasi kecerdasan buatan.
        </p>
      </div>

      {/* ── MINGGU INI SEJAUH INI (Data Only, No AI) ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-2 gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-primary flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-secondary" />
            <span>Minggu Ini Sejauh Ini</span>
          </h2>
          <span className="text-[10px] font-bold text-muted bg-muted-light/45 border border-border/50 px-2.5 py-0.5 rounded-full self-start sm:self-center">
            {formatPeriodRange(weekRange.startDate, weekRange.endDate)}
          </span>
        </div>

        <div className="space-y-4">
          {/* Status Rata-rata */}
          {isScoreAverageLoading ? (
            <div className="p-6 rounded-3xl border border-border bg-card shadow-xs animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted-light/60 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-2.5 bg-muted-light rounded w-28" />
                <div className="h-4 bg-muted-light rounded w-36" />
                <div className="h-3 bg-muted-light rounded w-48" />
              </div>
            </div>
          ) : (
            <div
              className={`p-6 rounded-3xl border flex items-center gap-4 ${condThisWeek.colorClass} shadow-xs hover:shadow-md transition-all duration-300`}
            >
              <span
                className="text-4xl select-none shrink-0"
                role="img"
                aria-label="Status Emoji"
              >
                {condThisWeek.emoji}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-75">
                  Status Rata-rata
                </span>
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  {condThisWeek.label}
                </h3>
                <p className="text-xs font-light mt-1 leading-relaxed opacity-90">
                  Rata-rata skor perilakumu berada pada {thisWeekScore}/100.
                </p>
              </div>
            </div>
          )}

          {/* Grid for Total Screen Time & Kebiasaan Teraktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Screen Time */}
            {isScreenTimeLoading ? (
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-36 animate-pulse">
                <div className="h-2.5 bg-muted-light rounded w-24" />
                <div className="flex items-center gap-3.5 mt-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted-light/50 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-muted-light rounded w-24" />
                    <div className="h-2.5 bg-muted-light rounded w-32" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                  Total Screen Time
                </span>
                <div className="flex items-center gap-3.5 mt-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted-light/50 flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-primary leading-none">
                      {formatSecToHoursMins(screenTimeData?.totalSeconds ?? 0)}
                    </h4>
                    <p className="text-[10px] text-muted font-light mt-1">
                      Rata-rata{" "}
                      {formatSecToHoursMins(
                        screenTimeData?.avgDailySeconds ?? 0,
                      )}
                      /hari
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Kebiasaan Teraktif */}
            {isFlagsLoading ? (
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-36 animate-pulse">
                <div className="h-2.5 bg-muted-light rounded w-24" />
                <div className="space-y-2.5 mt-3">
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted-light rounded w-24" />
                    <div className="h-3 bg-muted-light rounded w-12" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted-light rounded w-20" />
                    <div className="h-3 bg-muted-light rounded w-12" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                  Kebiasaan Teraktif
                </span>
                <div className="space-y-2.5 mt-3">
                  {activeFlags.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted font-light opacity-65">
                      Tidak ada kebiasaan buruk terdeteksi minggu ini 😊
                    </div>
                  ) : (
                    activeFlags.slice(0, 2).map((flag: any) => (
                      <div
                        key={flag.name}
                        className="flex items-center justify-between text-xs gap-2"
                      >
                        <span className="font-semibold text-primary leading-tight">
                          {flag.name}
                        </span>
                        <span className="text-[10px] text-muted font-bold shrink-0 bg-muted-light/40 px-2 py-0.5 rounded-md">
                          {flag.count}/{flag.total} hari
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Notice */}
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-muted-light/20 border border-border/40 text-muted">
          <Info className="w-4 h-4 shrink-0 text-muted" />
          <p className="text-[11px] font-medium leading-relaxed">
            Insight lengkap berupa narasi AI dan tips terarah akan tersedia pada{" "}
            <strong className="text-primary">Senin depan pukul 00:00</strong>{" "}
            (setelah data terkumpul lengkap dari Senin sampai Minggu).
          </p>
        </div>
      </section>

      {/* ── INSIGHT MINGGU LALU (AI Narrative / States) ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-2 gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-primary flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-secondary animate-pulse" />
            <span>Insight Minggu Lalu</span>
          </h2>
          {latestInsight && (
            <span className="text-[10px] font-bold text-muted bg-muted-light/45 border border-border/50 px-2.5 py-0.5 rounded-full self-start sm:self-center">
              {formatPeriodRange(
                latestInsight.weekStart,
                latestInsight.weekEnd,
              )}
            </span>
          )}
        </div>

        {/* 1. Loading State */}
        {isLatestLoading ? (
          <div className="space-y-6 animate-pulse">
            {/* Kondisi Minggu Itu */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted-light/60 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-2.5 bg-muted-light rounded w-28" />
                <div className="h-4 bg-muted-light rounded w-36" />
                <div className="h-3 bg-muted-light rounded w-48" />
              </div>
            </div>
            {/* 2 Cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <div className="h-3.5 bg-muted-light rounded w-48" />
                <div className="h-2.5 bg-muted-light rounded w-full" />
                <div className="h-2.5 bg-muted-light rounded w-5/6" />
              </div>
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <div className="h-3.5 bg-muted-light rounded w-48" />
                <div className="h-2.5 bg-muted-light rounded w-full" />
                <div className="h-2.5 bg-muted-light rounded w-5/6" />
              </div>
            </div>
            {/* Analisis */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="h-4 bg-muted-light rounded w-36" />
              <div className="h-2.5 bg-muted-light rounded w-full" />
              <div className="h-2.5 bg-muted-light rounded w-full" />
              <div className="h-2.5 bg-muted-light rounded w-4/5" />
            </div>
          </div>
        ) : !latestInsight ? (
          /* 2. New User Fallback Card */
          <div className="bg-card border border-border rounded-3xl p-8 max-w-xl mx-auto text-center space-y-6 shadow-xs my-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted-light/60 flex items-center justify-center text-primary">
              <Brain className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-primary">
                🔍 Laporan insight mingguanmu sedang disiapkan!
              </h3>
              <p className="text-xs text-muted leading-relaxed font-light px-4">
                Kami merekam pola penggunaan HP harianmu. Setiap hari Senin
                pukul 00:00, platform akan menyusun laporan komprehensif 7 hari.
              </p>
            </div>
            <div className="bg-muted-light/30 border border-border/80 p-5 rounded-2xl max-w-sm mx-auto space-y-3">
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                  Insight berikutnya tersedia:
                </span>
                <span className="text-primary font-black text-sm mt-1 block">
                  Senin depan, pukul 00:00
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateInsight}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating
                  ? "Sedang Menyusun..."
                  : "Susun Laporan AI Sekarang"}
              </button>
              {genError && (
                <p className="text-[10px] text-red-500 font-medium">
                  {genError}
                </p>
              )}
            </div>
            <p className="text-[10px] text-muted font-light">
              Sementara waktu, pantau aktivitas harianmu secara interaktif di
              menu{" "}
              <Link
                href="/dashboard"
                className="text-secondary font-semibold hover:underline"
              >
                Beranda
              </Link>{" "}
              dan{" "}
              <Link
                href="/statistik"
                className="text-secondary font-semibold hover:underline"
              >
                Statistik
              </Link>
              .
            </p>
          </div>
        ) : (
          /* 3. Normal State (Loaded AI Insight) */
          <div className="space-y-6">
            {/* Kondisi Minggu Itu */}
            {(() => {
              const cond = getStatusDetails(latestInsight.weeklyStatus);
              return (
                <div
                  className={`p-6 rounded-3xl border flex items-center gap-4 ${cond.colorClass} shadow-xs`}
                >
                  <span
                    className="text-4xl select-none"
                    role="img"
                    aria-label="Kondisi Emoji"
                  >
                    {cond.emoji}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-75">
                      Status Rata-rata
                    </span>
                    <h3 className="text-base sm:text-lg font-black">
                      {cond.label}
                    </h3>
                    <p className="text-xs font-light mt-0.5 leading-relaxed opacity-90">
                      Rata-rata skor perilakumu berada pada{" "}
                      {latestInsight.avgBehavioralScore}/100.{" "}
                      {latestInsight.aiWeeklyStatusLabel}.
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Yang Sudah Kamu Lakukan dengan Baik */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  <span>Yang Sudah Kamu Lakukan dengan Baik</span>
                </h3>
                <p className="text-xs text-muted leading-relaxed font-light">
                  {latestInsight.aiPositiveNotes}
                </p>
              </div>

              {/* Yang Perlu Kamu Perhatikan */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
                  <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Yang Perlu Kamu Perhatikan</span>
                </h3>
                <p className="text-xs text-muted leading-relaxed font-light">
                  {latestInsight.aiConcernNotes}
                </p>
              </div>
            </div>

            {/* Analisis Minggu Ini */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Brain className="w-5 h-5 text-primary shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-primary">
                  Analisis Minggu Ini
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-light whitespace-pre-line">
                {latestInsight.aiAnalysis}
              </p>
            </div>

            {/* Tips untuk Minggu Depan */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-primary">
                  Tips untuk Minggu Depan
                </h3>
              </div>
              {tips.length === 0 ? (
                <p className="text-xs text-muted font-light">
                  Tidak ada saran khusus.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tips.map((tip, idx) => (
                    <div
                      key={tip}
                      className="p-4 rounded-2xl border border-border/60 bg-muted-light/10 space-y-2 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                        Tips 0{idx + 1}
                      </span>
                      <p className="text-xs text-primary font-semibold leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── INSIGHT SEBELUMNYA ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-muted shrink-0" />
            <h2 className="text-sm sm:text-base font-extrabold text-primary">
              Insight Sebelumnya
            </h2>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {monthsList.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`text-[10px] font-bold py-1 px-3 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  selectedMonth === m
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted border-border hover:bg-muted-light/60"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Cards */}
        {isHistoryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between h-40 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-3 bg-muted-light rounded w-28" />
                    <div className="w-6 h-6 rounded-full bg-muted-light" />
                  </div>
                  <div className="h-4 bg-muted-light rounded w-3/4" />
                </div>
                <div className="h-3 bg-muted-light rounded w-24 mt-4" />
              </div>
            ))}
          </div>
        ) : filteredPastInsights.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-3xl bg-muted-light/10 text-xs text-muted">
            Tidak ada insight lama untuk filter terpilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPastInsights.map((past: any) => {
              const cond = getStatusDetails(past.weeklyStatus);
              return (
                <div
                  key={past.id}
                  className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/20 hover:shadow-md transition-all h-40"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-muted font-bold">
                        {formatPeriodRange(past.weekStart, past.weekEnd)}
                      </span>
                      <span
                        className="text-lg select-none"
                        role="img"
                        aria-label="Status Emoji"
                      >
                        {cond.emoji}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-primary leading-snug line-clamp-2">
                      {past.aiWeeklyStatusLabel || "Laporan Mingguan"}
                    </h4>
                  </div>
                  <Link
                    href={`/insight/${past.id}`}
                    className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline mt-2 self-start"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
