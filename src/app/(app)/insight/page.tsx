"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  CornerDownRight,
  Filter,
  HelpCircle,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  initialUsers,
  initialWeeklyInsights,
} from "@/lib/data/databaseInitialData";

// Mock past reports for history
const pastInsightsData = [
  {
    id: "w-prev-1",
    week_start: "2026-05-19",
    week_end: "2026-05-25",
    total_screen_time_seconds: 172800,
    avg_behavioral_score: 72,
    weekly_status: "heavy",
    ai_weekly_status_label: "Minggu yang Cukup Berat Secara Digital",
    month: "Mei 2026",
    emoji: "😟",
  },
  {
    id: "w-prev-2",
    week_start: "2026-05-12",
    week_end: "2026-05-18",
    total_screen_time_seconds: 151200,
    avg_behavioral_score: 58,
    weekly_status: "attention",
    ai_weekly_status_label: "Minggu yang Cukup Padat",
    month: "Mei 2026",
    emoji: "😐",
  },
  {
    id: "w-prev-3",
    week_start: "2026-05-05",
    week_end: "2026-05-11",
    total_screen_time_seconds: 135000,
    avg_behavioral_score: 35,
    weekly_status: "good",
    ai_weekly_status_label: "Minggu yang Sangat Baik!",
    month: "Mei 2026",
    emoji: "😊",
  },
];

export default function InsightPage() {
  const user = initialUsers[0];
  const currentInsight = initialWeeklyInsights[0];
  const [selectedMonth, setSelectedMonth] = useState<string>("Semua");

  // Check if we have insights (simulate empty state for new user by checking a condition if needed)
  // For demonstration, we assume we have insights, but we can toggle this for testing.
  const isNewUser = false; // Set to true to inspect new-user card

  if (isNewUser) {
    return (
      <div className="space-y-6 font-poppins min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 text-center space-y-6 shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted-light/60 flex items-center justify-center text-primary">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-primary">
              🔍 Insight pertamamu sedang disiapkan!
            </h3>
            <p className="text-xs text-muted leading-relaxed font-light">
              Kami butuh data satu minggu penuh untuk bisa mengenali pola
              penggunaan HP-mu.
            </p>
          </div>
          <div className="bg-muted-light/30 border border-border p-4 rounded-2xl text-xs text-primary font-bold">
            Insight pertama akan muncul pada:
            <br />
            <span className="text-secondary text-sm mt-1 block">
              Senin, 8 Juni 2026
            </span>
          </div>
          <p className="text-[10px] text-muted font-light">
            Sementara itu, pantau aktivitas harianmu di halaman Beranda dan
            Statistik.
          </p>
        </div>
      </div>
    );
  }

  // Parse current weekly insight tips
  let tips: string[] = [];
  if (currentInsight?.ai_tips) {
    try {
      tips = JSON.parse(currentInsight.ai_tips);
    } catch (e) {
      tips = [
        "Coba taruh HP di luar kamar saat tidur",
        "Batasi buka TikTok maksimal 2x sehari",
        "Aktifkan mode fokus saat jam belajar",
      ];
    }
  }

  // Get current status emoji
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "good":
        return "😊";
      case "attention":
        return "😐";
      case "heavy":
        return "😟";
      default:
        return "😐";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "attention":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "heavy":
        return "text-red-500 bg-red-50 border-red-100";
      default:
        return "text-muted bg-muted-light/50 border-border";
    }
  };

  // Months available in past list
  const months = ["Semua", "Juni 2026", "Mei 2026"];

  const filteredPastInsights = pastInsightsData.filter((insight) => {
    if (selectedMonth === "Semua") return true;
    return insight.month === selectedMonth;
  });

  return (
    <div className="space-y-8 font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Insight AI
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Asisten AI menganalisis data mingguanmu secara personal dengan bahasa
          yang ramah.
        </p>
      </div>

      {/* ── Insight Minggu Ini ── */}
      {currentInsight && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            <h2 className="text-base font-extrabold text-primary">
              Insight Minggu Ini
            </h2>
            <span className="text-xs text-muted font-light ml-auto">
              {currentInsight.week_start} – {currentInsight.week_end}
            </span>
          </div>

          {/* Kondisi Minggu Ini */}
          <div
            className={`p-6 rounded-3xl border flex items-center gap-4 ${getStatusColor(currentInsight.weekly_status)}`}
          >
            <span className="text-4xl select-none">
              {getStatusEmoji(currentInsight.weekly_status)}
            </span>
            <div>
              <h3 className="text-lg font-black">
                {currentInsight.ai_weekly_status_label}
              </h3>
              <p className="text-xs font-light mt-0.5 leading-relaxed">
                Rata-rata skor perilakumu berada pada{" "}
                {currentInsight.avg_behavioral_score}/100.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Yang Sudah Kamu Lakukan dengan Baik */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                <span>Yang Sudah Kamu Lakukan dengan Baik</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed font-light">
                {currentInsight.ai_positive_notes}
              </p>
            </div>

            {/* Yang Perlu Kamu Perhatikan */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-amber-500" />
                <span>Yang Perlu Kamu Perhatikan</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed font-light">
                {currentInsight.ai_concern_notes}
              </p>
            </div>
          </div>

          {/* Analisis AI */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base text-primary">
                Analisis Minggu Ini
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-light whitespace-pre-line">
              {currentInsight.ai_analysis}
            </p>
          </div>

          {/* Tips untuk Minggu Depan */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base text-primary">
                Tips untuk Minggu Depan
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tips.map((tip, idx) => (
                <div
                  key={tip}
                  className="p-4 rounded-2xl border border-border/60 bg-muted-light/10 space-y-2 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Tips 0{idx + 1}
                  </span>
                  <p className="text-xs text-primary font-semibold leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Insight Sebelumnya ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted" />
            <h2 className="text-base font-extrabold text-primary">
              Insight Sebelumnya
            </h2>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {months.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`text-[10px] font-bold py-1 px-3 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    selectedMonth === m
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-muted border-border hover:bg-muted-light"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of past insight cards */}
        {filteredPastInsights.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-3xl bg-muted-light/10 text-xs text-muted">
            Tidak ada insight lama untuk filter terpilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPastInsights.map((past) => (
              <div
                key={past.id}
                className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/20 hover:shadow-md transition-all h-40"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-muted font-light font-bold">
                      {past.week_start} – {past.week_end}
                    </span>
                    <span className="text-lg select-none">{past.emoji}</span>
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
