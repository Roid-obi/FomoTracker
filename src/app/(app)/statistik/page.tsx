"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  HelpCircle,
  Info,
  Minus,
  Moon,
  Smartphone,
} from "lucide-react";
import {
  initialDailyStats,
  initialApps,
  initialWeeklyInsights,
} from "@/lib/data/databaseInitialData";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Helper for formatting time (seconds to hours/minutes)
const formatSecToHoursMins = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

// Mock data for high fidelity charts matching the database metrics
const dataMingguIni = {
  totalSec: 72000, // 20 hours for Mon-Wed
  avgSec: 24000,   // ~6j 40m per day
  diffSec: 7200,   // 2 hours shorter than same period last week
  diffDirection: "down", // 'up' | 'down' | 'same'
  dailyData: [
    { hari: "Sen", Instagram: 130, TikTok: 180, YouTube: 45, WhatsApp: 60 },
    { hari: "Sel", Instagram: 90, TikTok: 210, YouTube: 60, WhatsApp: 80 },
    { hari: "Rab", Instagram: 65, TikTok: 82, YouTube: 30, WhatsApp: 50 }, // Wednesday is today
    { hari: "Kam", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Jum", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Sab", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Min", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
  ],
  topApps: [
    { name: "TikTok", sec: 28320, color: "bg-secondary" },
    { name: "Instagram", sec: 17100, color: "bg-primary" },
    { name: "WhatsApp", sec: 11400, color: "bg-emerald-500" },
    { name: "YouTube", sec: 8100, color: "bg-accent" },
  ],
  flags: [
    { name: "Terlalu lama main HP", count: 2, total: 3, label: "Muncul 2 dari 3 hari" },
    { name: "Sering buka-tutup aplikasi", count: 3, total: 3, label: "Muncul 3 dari 3 hari" },
    { name: "Main HP waktu tidur", count: 1, total: 3, label: "Muncul 1 dari 3 hari" },
    { name: "Nonstop tanpa jeda", count: 2, total: 3, label: "Muncul 2 dari 3 hari" },
    { name: "Distraksi jam produktif", count: 2, total: 3, label: "Muncul 2 dari 3 hari" },
  ],
};

const dataMingguLaju = {
  totalSec: 165600, // ~46 hours (matches database)
  avgSec: 23657,   // ~6.5 hours per day
  dailyData: [
    { hari: "Sen", Instagram: 120, TikTok: 150, YouTube: 60, WhatsApp: 45 },
    { hari: "Sel", Instagram: 110, TikTok: 180, YouTube: 40, WhatsApp: 50 },
    { hari: "Rab", Instagram: 130, TikTok: 190, YouTube: 55, WhatsApp: 55 },
    { hari: "Kam", Instagram: 140, TikTok: 220, YouTube: 80, WhatsApp: 60 },
    { hari: "Jum", Instagram: 150, TikTok: 210, YouTube: 70, WhatsApp: 70 },
    { hari: "Sab", Instagram: 180, TikTok: 240, YouTube: 90, WhatsApp: 80 },
    { hari: "Min", Instagram: 210, TikTok: 280, YouTube: 100, WhatsApp: 95 },
  ],
  topApps: [
    { name: "TikTok", sec: 89400, color: "bg-secondary" },
    { name: "Instagram", sec: 62400, color: "bg-primary" },
    { name: "YouTube", sec: 29700, color: "bg-accent" },
    { name: "WhatsApp", sec: 25200, color: "bg-emerald-500" },
  ],
  flags: [
    { name: "Terlalu lama main HP", count: 5, total: 7, label: "Muncul 5 dari 7 hari" },
    { name: "Sering buka-tutup aplikasi", count: 6, total: 7, label: "Muncul 6 dari 7 hari" },
    { name: "Main HP waktu tidur", count: 3, total: 7, label: "Muncul 3 dari 7 hari" },
    { name: "Nonstop tanpa jeda", count: 4, total: 7, label: "Muncul 4 dari 7 hari" },
    { name: "Distraksi jam produktif", count: 4, total: 7, label: "Muncul 4 dari 7 hari" },
  ],
};

// Generate Mock Heatmap Data for visual quality
// 7 days (rows Mon-Sun) x 24 hours (cols 0-23)
const generateHeatmap = (isPrevWeek: boolean) => {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  return days.map((day, dIdx) => {
    return Array.from({ length: 24 }, (_, hour) => {
      // Simulate level of usage (0 = none, 1 = low, 2 = medium, 3 = high)
      let val = 0;
      // Wednesday is index 2. If current week and index > 2, it is future (no data)
      if (!isPrevWeek && dIdx > 2) {
        val = 0;
      } else {
        // High usage at late evening (20-22)
        if (hour >= 20 && hour <= 22) {
          val = Math.random() > 0.3 ? 3 : 2;
        }
        // Moderate usage at morning (8-10) and noon (12-13)
        else if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 13)) {
          val = Math.random() > 0.4 ? 2 : 1;
        }
        // Small usage during sleep/work hours sometimes
        else if (hour >= 23 || hour <= 1 || (hour >= 14 && hour <= 16)) {
          val = Math.random() > 0.6 ? 1 : 0;
        }
      }
      return { day, hour, val };
    });
  });
};

export default function StatistikPage() {
  const [period, setPeriod] = useState<"ini" | "lalu">("ini");

  const currentData = period === "ini" ? dataMingguIni : dataMingguLaju;
  const isMonday = new Date().getDay() === 1; // Check if today is Monday

  // Generate heatmap coordinates
  const heatmapRows = generateHeatmap(period === "lalu");

  const getHeatmapColor = (val: number) => {
    switch (val) {
      case 1:
        return "bg-secondary/20";
      case 2:
        return "bg-secondary/55";
      case 3:
        return "bg-primary text-accent";
      default:
        return "bg-muted-light/40";
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Statistik Mingguan
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Analisis pola pemakaian gawai secara transparan tanpa istilah rumit.
        </p>
      </div>

      {/* Filter Periode */}
      <div className="flex gap-2 p-1.5 bg-card border border-border rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setPeriod("ini")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === "ini" ? "bg-primary text-white" : "text-muted hover:text-primary"
          }`}
        >
          Minggu Ini
        </button>
        <button
          type="button"
          onClick={() => setPeriod("lalu")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === "lalu" ? "bg-primary text-white" : "text-muted hover:text-primary"
          }`}
        >
          Minggu Lalu
        </button>
      </div>

      {/* Banner Keterangan Jika Senin dan memilih "Minggu Ini" */}
      {period === "ini" && isMonday && (
        <div className="flex gap-3 items-start p-4 rounded-2xl border border-blue-100 bg-blue-50/50 text-blue-800">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium font-poppins">
            Minggu ini baru dimulai hari ini. Data statistik akan terakumulasi seiring berjalannya hari.
          </p>
        </div>
      )}

      {/* Rangkuman total durasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Durasi */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-32">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            Total Waktu Online
          </span>
          <div className="mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              {formatSecToHoursMins(currentData.totalSec)}
            </h3>
            <p className="text-[10px] text-muted font-light mt-0.5">Terakumulasi dalam rentang periode</p>
          </div>
        </div>

        {/* Card 2: Rata-rata Harian */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-32">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            Rata-rata Harian
          </span>
          <div className="mt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              {formatSecToHoursMins(currentData.avgSec)}
            </h3>
            <p className="text-[10px] text-muted font-light mt-0.5">Rata-rata screen time per hari</p>
          </div>
        </div>

        {/* Card 3: Perbandingan vs Minggu Lalu */}
        {period === "ini" && (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-32">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Perbandingan vs Minggu Lalu
            </span>
            <div className="mt-2">
              {dataMingguIni.diffDirection === "down" ? (
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-1">
                    <ArrowDownRight className="w-8 h-8" />
                    <span>-{Math.round(dataMingguIni.diffSec / 60)} Menit</span>
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5"> Lebih singkat dari minggu lalu</p>
                </div>
              ) : dataMingguIni.diffDirection === "up" ? (
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-red-500 flex items-center gap-1">
                    <ArrowUpRight className="w-8 h-8" />
                    <span>+{Math.round(dataMingguIni.diffSec / 60)} Menit</span>
                  </h3>
                  <p className="text-[10px] text-red-500 font-bold mt-0.5"> Lebih lama dari minggu lalu</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-muted flex items-center gap-1">
                    <Minus className="w-7 h-7" />
                    <span>Sama</span>
                  </h3>
                  <p className="text-[10px] text-muted font-bold mt-0.5">Sama seperti minggu lalu</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Widgets: Daily stacked bar + Top apps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily stacked bar (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="font-extrabold text-base text-primary">Grafik Penggunaan Harian</h3>
            <p className="text-xs text-muted font-light mt-0.5">Rincian durasi harian per aplikasi (dalam menit)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.dailyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="hari" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    borderColor: "#e1e8ef",
                    fontFamily: "Poppins",
                    fontSize: "11px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="Instagram" stackId="a" fill="#062743" radius={[0, 0, 0, 0]} />
                <Bar dataKey="TikTok" stackId="a" fill="#113a5d" radius={[0, 0, 0, 0]} />
                <Bar dataKey="YouTube" stackId="a" fill="#c4ffdd" radius={[0, 0, 0, 0]} />
                <Bar dataKey="WhatsApp" stackId="a" fill="#e6eef4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top apps horizontal list (1 col) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-base text-primary">Aplikasi Paling Sering Dibuka</h3>
            <p className="text-xs text-muted font-light mt-0.5">Durasi pemakaian total tertinggi</p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {currentData.topApps.map((app) => {
              const maxSec = currentData.topApps[0].sec;
              const barWidth = Math.round((app.sec / maxSec) * 100);
              return (
                <div key={app.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-primary">{app.name}</span>
                    <span className="text-muted">{formatSecToHoursMins(app.sec)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted-light/60 overflow-hidden border border-border/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${app.color}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Online Heatmap Widget */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-extrabold text-base text-primary">Jam Berapa Kamu Paling Sering Online?</h3>
            <p className="text-xs text-muted font-light mt-0.5">Heatmap interaktif pemakaian HP per jam per hari</p>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#fff0f3] border border-pink-200 block" />
              <span>🌙 Jam Tidur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#fffbeb] border border-amber-200 block" />
              <span>💼 Jam Belajar</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
          <div className="min-w-[640px] space-y-1.5">
            {/* Headers (Hours 00-23) */}
            <div
              className="grid gap-1 text-center text-[9px] font-bold text-muted uppercase"
              style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
            >
              <div>Hari</div>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i}>{String(i).padStart(2, "0")}</div>
              ))}
            </div>

            {/* Rows (Days Mon-Sun) */}
            {heatmapRows.map((row, dayIdx) => {
              const dayLabel = row[0].day;
              return (
                <div
                  key={dayIdx}
                  className="grid gap-1 items-center"
                  style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
                >
                  <div className="text-[10px] font-bold text-primary">{dayLabel}</div>
                  {row.map((cell) => {
                    // Check if current cell falls into productive hours (08:00 - 17:00)
                    const isProductive = cell.hour >= 8 && cell.hour <= 17;
                    // Check if current cell falls into sleep hours (22:00 - 06:00)
                    const isSleep = cell.hour >= 22 || cell.hour <= 6;

                    // Border style based on hours highlight
                    let highlightClass = "";
                    if (isSleep) {
                      highlightClass = "border border-pink-300 shadow-[0_0_2px_rgba(244,63,94,0.1)] bg-[#fff0f3]/25";
                    } else if (isProductive) {
                      highlightClass = "border border-amber-300 shadow-[0_0_2px_rgba(245,158,11,0.1)] bg-[#fffbeb]/25";
                    } else {
                      highlightClass = "border border-transparent";
                    }

                    return (
                      <div
                        key={cell.hour}
                        className={`h-5 rounded-md transition-all relative group ${getHeatmapColor(
                          cell.val
                        )} ${highlightClass}`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mb-1.5 whitespace-nowrap">
                          {cell.day}, Jam {String(cell.hour).padStart(2, "0")}.00 —{" "}
                          {cell.val === 0
                            ? "Aman (0m)"
                            : cell.val === 1
                            ? "Ringan (1-15m)"
                            : cell.val === 2
                            ? "Sedang (16-30m)"
                            : "Berat (>30m)"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend color index */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted uppercase mt-4">
          <span>Keterangan Warna:</span>
          <span className="w-3 h-3 rounded bg-muted-light/40 border border-border" />
          <span>Aman</span>
          <span className="w-3 h-3 rounded bg-secondary/20" />
          <span>Ringan</span>
          <span className="w-3 h-3 rounded bg-secondary/55" />
          <span>Sedang</span>
          <span className="w-3 h-3 rounded bg-primary" />
          <span>Berat</span>
        </div>
      </div>

      {/* Kebiasaan yang Sering Muncul */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-primary">Kebiasaan yang Sering Muncul</h3>
          <p className="text-xs text-muted font-light mt-0.5">Seberapa sering kebiasaan digital buruk terdeteksi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.flags.map((flag) => {
            const pct = Math.round((flag.count / flag.total) * 100);
            return (
              <div key={flag.name} className="space-y-1.5 p-3 rounded-2xl border border-border/60 bg-background/30">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-primary">{flag.name}</span>
                  <span className="text-[10px] text-muted font-light">{flag.label}</span>
                </div>
                <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 70 ? "bg-red-500" : pct >= 40 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
