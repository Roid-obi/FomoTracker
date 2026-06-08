"use client";

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  Layers,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { initialWeeklyInsights } from "@/lib/data/databaseInitialData";

// Mock past reports for history
const pastInsightsData = [
  {
    id: "w-prev-1",
    week_start: "19 Mei 2026",
    week_end: "25 Mei 2026",
    total_screen_time_seconds: 172800,
    avg_behavioral_score: 72,
    weekly_status: "heavy",
    ai_weekly_status_label: "Minggu yang Cukup Berat Secara Digital",
    month: "Mei 2026",
    emoji: "😟",
  },
  {
    id: "w-prev-2",
    week_start: "12 Mei 2026",
    week_end: "18 Mei 2026",
    total_screen_time_seconds: 151200,
    avg_behavioral_score: 58,
    weekly_status: "attention",
    ai_weekly_status_label: "Minggu yang Cukup Padat",
    month: "Mei 2026",
    emoji: "😐",
  },
  {
    id: "w-prev-3",
    week_start: "5 Mei 2026",
    week_end: "11 Mei 2026",
    total_screen_time_seconds: 135000,
    avg_behavioral_score: 35,
    weekly_status: "good",
    ai_weekly_status_label: "Minggu yang Sangat Baik!",
    month: "Mei 2026",
    emoji: "😊",
  },
];

export default function InsightPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("Semua");
  const [simMode, setSimMode] = useState<"normal" | "new_user" | "error">(
    "normal",
  );
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const currentInsight = initialWeeklyInsights[0];

  // Helper to compute dates dynamically
  const getPeriodThisWeekStr = () => {
    if (!currentDate) return "Senin, 1 Juni – Jumat, 5 Juni 2026";
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

    const monday = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    return `${days[1]}, ${monday.getDate()} ${months[monday.getMonth()]} – ${days[yesterday.getDay()]}, ${yesterday.getDate()} ${months[yesterday.getMonth()]} ${yesterday.getFullYear()}`;
  };

  const getNextMondayStr = () => {
    if (!currentDate) return "Senin, 8 Juni 2026";
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
    const nextMonday = new Date(currentDate);
    const day = currentDate.getDay();
    const daysToNextMonday = day === 0 ? 1 : 8 - day;
    nextMonday.setDate(currentDate.getDate() + daysToNextMonday);

    return `Senin, ${nextMonday.getDate()} ${months[nextMonday.getMonth()]} ${nextMonday.getFullYear()}`;
  };

  // Status mapping helper
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "good":
        return {
          emoji: "😊",
          label: "Minggu yang Baik!",
          colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "attention":
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-amber-700 bg-amber-50 border-amber-200",
        };
      case "heavy":
        return {
          emoji: "😟",
          label: "Minggu yang Cukup Berat",
          colorClass: "text-red-700 bg-red-50 border-red-200",
        };
      default:
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-muted bg-muted-light/60 border-border",
        };
    }
  };

  // Parse tips
  let tips: string[] = [];
  if (currentInsight?.ai_tips) {
    try {
      tips = JSON.parse(currentInsight.ai_tips);
    } catch (_e) {
      tips = [
        "Coba taruh HP di luar kamar saat tidur untuk mengurangi midnight usage",
        "Batasi buka TikTok maksimal 2x sehari dengan durasi maksimal 30 menit",
        "Aktifkan mode fokus saat jam belajar/kerja untuk mengurangi distraksi",
      ];
    }
  }

  const months = ["Semua", "Juni 2026", "Mei 2026"];

  const filteredPastInsights = pastInsightsData.filter((insight) => {
    if (selectedMonth === "Semua") return true;
    return insight.month === selectedMonth;
  });

  return (
    <div className="space-y-8 font-poppins">
      {/* Simulation Controller Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-muted-light/40 border border-border/60 gap-3 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">
            Simulasi Status Insight:
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSimMode("normal")}
            className={`text-[10px] font-bold py-1 px-3 rounded-xl border transition-all cursor-pointer ${
              simMode === "normal"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white text-muted border-border hover:bg-muted-light/40"
            }`}
          >
            Normal (Ada Insight)
          </button>
          <button
            type="button"
            onClick={() => setSimMode("new_user")}
            className={`text-[10px] font-bold py-1 px-3 rounded-xl border transition-all cursor-pointer ${
              simMode === "new_user"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white text-muted border-border hover:bg-muted-light/40"
            }`}
          >
            User Baru
          </button>
          <button
            type="button"
            onClick={() => setSimMode("error")}
            className={`text-[10px] font-bold py-1 px-3 rounded-xl border transition-all cursor-pointer ${
              simMode === "error"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white text-muted border-border hover:bg-muted-light/40"
            }`}
          >
            Error / Gagal
          </button>
        </div>
      </div>

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
            {getPeriodThisWeekStr()}
          </span>
        </div>

        <div className="space-y-4">
          {/* Status Rata-rata */}
          <div className="p-6 rounded-3xl border flex items-center gap-4 text-amber-700 bg-amber-50 border-amber-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all duration-300">
            <span
              className="text-4xl select-none shrink-0"
              role="img"
              aria-label="Status Emoji"
            >
              😐
            </span>
            <div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block mb-0.5">
                Status Rata-rata
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-800 leading-tight">
                Perlu Diperhatikan
              </h3>
              <p className="text-xs font-light mt-1 leading-relaxed opacity-90 text-amber-700">
                Rata-rata skor perilakumu berada pada 69/100.
              </p>
            </div>
          </div>

          {/* Grid for Total Screen Time & Kebiasaan Teraktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Screen Time */}
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
                    20 jam
                  </h4>
                  <p className="text-[10px] text-muted font-light mt-1">
                    Rata-rata 6j 40m/hari
                  </p>
                </div>
              </div>
            </div>

            {/* Kebiasaan Teraktif */}
            <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                Kebiasaan Teraktif
              </span>
              <div className="space-y-2.5 mt-3">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-primary leading-tight">
                    Sering buka-tutup aplikasi
                  </span>
                  <span className="text-[10px] text-muted font-bold shrink-0 bg-muted-light/40 px-2 py-0.5 rounded-md">
                    3/3 hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-primary leading-tight">
                    Distraksi jam produktif
                  </span>
                  <span className="text-[10px] text-muted font-bold shrink-0 bg-muted-light/40 px-2 py-0.5 rounded-md">
                    2/3 hari
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-muted-light/20 border border-border/40 text-muted">
          <Info className="w-4 h-4 shrink-0 text-muted" />
          <p className="text-[11px] font-medium">
            Insight lengkap berupa narasi AI dan tips terarah akan tersedia pada{" "}
            <strong className="text-primary">Senin depan pukul 00:00</strong>.
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
          {simMode === "normal" && (
            <span className="text-[10px] font-bold text-muted bg-muted-light/45 border border-border/50 px-2.5 py-0.5 rounded-full self-start sm:self-center">
              Senin, 26 Mei – Minggu, 1 Juni 2026
            </span>
          )}
        </div>

        {/* 1. New User Fallback Card */}
        {simMode === "new_user" && (
          <div className="bg-card border border-border rounded-3xl p-8 max-w-xl mx-auto text-center space-y-6 shadow-xs my-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted-light/60 flex items-center justify-center text-primary">
              <Brain className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-primary">
                🔍 Insight pertamamu sedang disiapkan!
              </h3>
              <p className="text-xs text-muted leading-relaxed font-light px-4">
                Kami butuh waktu satu minggu penuh untuk merekam dan mengenali
                pola penggunaan HP harianmu sebelum dapat menyusun laporan.
              </p>
            </div>
            <div className="bg-muted-light/30 border border-border/80 p-4 rounded-2xl max-w-sm mx-auto">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                Insight pertama tersedia:
              </span>
              <span className="text-primary font-black text-sm mt-1 block">
                {getNextMondayStr()}
              </span>
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
        )}

        {/* 2. Error Fallback State */}
        {simMode === "error" && (
          <div className="bg-card border border-red-100 rounded-3xl p-8 max-w-md mx-auto text-center space-y-4 shadow-xs my-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-red-800">
                ⚠️ Insight minggu ini belum tersedia
              </h3>
              <p className="text-xs text-red-600 font-light">
                Terjadi kendala teknis saat memproses narasi AI. Kami akan
                mencoba menyusun kembali dalam beberapa saat.
              </p>
            </div>
          </div>
        )}

        {/* 3. Normal State (Loaded AI Insight) */}
        {simMode === "normal" && currentInsight && (
          <div className="space-y-6">
            {/* Kondisi Minggu Itu */}
            {(() => {
              const cond = getStatusDetails(currentInsight.weekly_status);
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
                    <h3 className="text-base sm:text-lg font-black">
                      {cond.label}
                    </h3>
                    <p className="text-xs font-light mt-0.5 leading-relaxed opacity-90">
                      Rata-rata skor perilakumu berada pada{" "}
                      {currentInsight.avg_behavioral_score}/100.{" "}
                      {currentInsight.ai_weekly_status_label}.
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
                  <span>Yang Sudah Kamu Lakukan dengan Baik 👍</span>
                </h3>
                <p className="text-xs text-muted leading-relaxed font-light">
                  {currentInsight.ai_positive_notes}
                </p>
              </div>

              {/* Yang Perlu Kamu Perhatikan */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
                  <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Yang Perlu Kamu Perhatikan ⚠️</span>
                </h3>
                <p className="text-xs text-muted leading-relaxed font-light">
                  {currentInsight.ai_concern_notes}
                </p>
              </div>
            </div>

            {/* Analisis Minggu Ini */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Brain className="w-5 h-5 text-primary shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-primary">
                  Analisis Minggu Ini 🤖
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-light whitespace-pre-line">
                {currentInsight.ai_analysis}
              </p>
            </div>

            {/* Tips untuk Minggu Depan */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-primary">
                  Tips untuk Minggu Depan 💡
                </h3>
              </div>
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
            {months.map((m) => (
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
        {filteredPastInsights.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-3xl bg-muted-light/10 text-xs text-muted">
            Tidak ada insight lama untuk filter terpilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPastInsights.map((past) => {
              const cond = getStatusDetails(past.weekly_status);
              return (
                <div
                  key={past.id}
                  className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/20 hover:shadow-md transition-all h-40"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-muted font-bold">
                        {past.week_start} – {past.week_end}
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
                      {past.ai_weekly_status_label}
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
