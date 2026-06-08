"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Clock,
  Info,
  Minus,
  Moon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
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

// Helper for formatting minutes to hours/minutes
const formatMinutesToHoursMins = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

// Helper to generate date strings and names
const getDayDateInfo = (dayIdx: number, isPrevWeek: boolean) => {
  // Monday of current week is 2026-06-01
  // Monday of previous week is 2026-05-25
  const baseDate = isPrevWeek ? new Date(2026, 4, 25) : new Date(2026, 5, 1);
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayIdx);

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const dayNames = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];
  const monthNames = [
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

  const label = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;
  const dayName = dayNames[dayIdx];

  return { dateStr, label, dayName };
};

// Mock data for high fidelity charts matching the database metrics
const dataMingguIni = {
  totalSec: 72000, // 20 hours for Mon-Wed
  avgSec: 24000, // ~6j 40m per day
  diffSec: 7200, // 2 hours shorter than same period last week
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
    { name: "X (Twitter)", sec: 3600, color: "bg-indigo-500" },
  ],
  flags: [
    {
      name: "Terlalu lama main HP",
      count: 2,
      total: 3,
      label: "Muncul 2 dari 3 hari",
    },
    {
      name: "Sering buka-tutup aplikasi",
      count: 3,
      total: 3,
      label: "Muncul 3 dari 3 hari",
    },
    {
      name: "Main HP waktu tidur",
      count: 1,
      total: 3,
      label: "Muncul 1 dari 3 hari",
    },
    {
      name: "Nonstop tanpa jeda",
      count: 2,
      total: 3,
      label: "Muncul 2 dari 3 hari",
    },
    {
      name: "Distraksi jam produktif",
      count: 2,
      total: 3,
      label: "Muncul 2 dari 3 hari",
    },
  ],
};

const dataMingguLaju = {
  totalSec: 165600, // ~46 hours (matches database)
  avgSec: 23657, // ~6.5 hours per day
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
    { name: "X (Twitter)", sec: 14400, color: "bg-indigo-500" },
  ],
  flags: [
    {
      name: "Terlalu lama main HP",
      count: 5,
      total: 7,
      label: "Muncul 5 dari 7 hari",
    },
    {
      name: "Sering buka-tutup aplikasi",
      count: 6,
      total: 7,
      label: "Muncul 6 dari 7 hari",
    },
    {
      name: "Main HP waktu tidur",
      count: 3,
      total: 7,
      label: "Muncul 3 dari 7 hari",
    },
    {
      name: "Nonstop tanpa jeda",
      count: 4,
      total: 7,
      label: "Muncul 4 dari 7 hari",
    },
    {
      name: "Distraksi jam produktif",
      count: 4,
      total: 7,
      label: "Muncul 4 dari 7 hari",
    },
  ],
};

// Seeded random generator for deterministic values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate Mock Heatmap Data for visual quality
// 7 days (rows Mon-Sun) x 24 hours (cols 0-23)
// Uses deterministic seeding based on day and hour to ensure consistency between server and client
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
        // Use seed based on day and hour for deterministic randomness
        const seed = dIdx * 100 + hour;
        const rand = seededRandom(seed);

        // High usage at late evening (20-22)
        if (hour >= 20 && hour <= 22) {
          val = rand > 0.3 ? 3 : 2;
        }
        // Moderate usage at morning (8-10) and noon (12-13)
        else if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 13)) {
          val = rand > 0.4 ? 2 : 1;
        }
        // Small usage during sleep/work hours sometimes
        else if (hour >= 23 || hour <= 1 || (hour >= 14 && hour <= 16)) {
          val = rand > 0.6 ? 1 : 0;
        }
      }
      return { day, hour, val };
    });
  });
};

const rankColors = ["#334155", "#475569", "#64748B", "#94A3B8", "#E2E8F0"];

// biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape props are dynamic
const CustomBar = (props: any) => {
  const { height, payload, dataKey, rankedApps } = props;
  if (!payload || !dataKey || !height || height <= 0) return null;

  const appsOrder = rankedApps || [
    "Instagram",
    "TikTok",
    "YouTube",
    "WhatsApp",
  ];
  const activeApps = appsOrder.filter((app: string) => (payload[app] || 0) > 0);
  const isTop = activeApps[activeApps.length - 1] === dataKey;

  const radius = isTop ? [4, 4, 0, 0] : [0, 0, 0, 0];

  return <Rectangle {...props} radius={radius} />;
};

const flagConfigs: Record<
  string,
  {
    icon: React.ElementType;
    weight: string;
    iconBg: string;
    iconColor: string;
    barColor: string;
  }
> = {
  "Terlalu lama main HP": {
    icon: Clock,
    weight: "Berkontribusi 30% terhadap skor harian",
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    barColor: "bg-red-500",
  },
  "Sering buka-tutup aplikasi": {
    icon: RotateCcw,
    weight: "Berkontribusi 20% terhadap skor harian",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    barColor: "bg-amber-500",
  },
  "Main HP waktu tidur": {
    icon: Moon,
    weight: "Berkontribusi 20% terhadap skor harian",
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    barColor: "bg-indigo-500",
  },
  "Nonstop tanpa jeda": {
    icon: Activity,
    weight: "Berkontribusi 15% terhadap skor harian",
    iconBg: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-600",
    barColor: "bg-orange-500",
  },
  "Distraksi jam produktif": {
    icon: Briefcase,
    weight: "Berkontribusi 15% terhadap skor harian",
    iconBg: "bg-pink-50 border-pink-100",
    iconColor: "text-pink-600",
    barColor: "bg-pink-500",
  },
};

export default function StatistikPage() {
  const [period, setPeriod] = useState<"ini" | "lalu">("ini");

  const currentData = period === "ini" ? dataMingguIni : dataMingguLaju;
  const isMonday = new Date().getDay() === 1; // Check if today is Monday

  // Sort and rank apps based on currentData.topApps
  const top4Apps = currentData.topApps.slice(0, 4).map((app) => app.name);
  const allApps = ["Instagram", "TikTok", "YouTube", "WhatsApp"];
  const otherApps = allApps.filter((app) => !top4Apps.includes(app));

  const rankedDailyData = currentData.dailyData.map(
    (dayData: Record<string, string | number>) => {
      const newRow: Record<string, string | number> = {
        hari: String(dayData.hari),
      };
      for (const app of top4Apps) {
        newRow[app] = dayData[app] || 0;
      }
      let otherSum = 0;
      for (const app of otherApps) {
        otherSum += (dayData[app] as number) || 0;
      }
      newRow.Lainnya = otherSum;
      return newRow;
    },
  );

  // Generate heatmap coordinates
  const heatmapRows = generateHeatmap(period === "lalu");

  const getHeatmapColor = (val: number) => {
    switch (val) {
      case 1:
        return "#94A3B8";
      case 2:
        return "#64748B";
      case 3:
        return "#334155";
      default:
        return "#E2E8F0";
    }
  };

  const formatDiffSecToHoursMinsIndo = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m} menit`;
    if (m === 0) return `${h} jam`;
    return `${h} jam ${m} menit`;
  };

  const diffSec = period === "ini" ? dataMingguIni.diffSec : 7200;
  const diffDirection = period === "ini" ? dataMingguIni.diffDirection : "down";
  const compTitle =
    period === "ini"
      ? "Perbandingan vs Minggu Lalu"
      : "Perbandingan vs 2 Minggu Lalu";
  const compSubtext =
    period === "ini"
      ? "Lebih singkat dari minggu lalu"
      : "Lebih singkat dari 2 minggu lalu";
  const compSubtextUp =
    period === "ini"
      ? "Lebih lama dari minggu lalu"
      : "Lebih lama dari 2 minggu lalu";

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header & Filter Periode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
            Statistik Mingguan
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Analisis pola pemakaian gawai secara transparan tanpa istilah rumit.
          </p>
        </div>

        {/* Filter Periode */}
        <div className="flex gap-2 p-1.5 bg-card border border-border rounded-2xl w-fit shrink-0">
          <button
            type="button"
            onClick={() => setPeriod("ini")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === "ini" ? "bg-primary text-white" : "text-muted hover:text-primary"}`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => setPeriod("lalu")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === "lalu" ? "bg-primary text-white" : "text-muted hover:text-primary"}`}
          >
            Minggu Lalu
          </button>
        </div>
      </div>

      {/* Banner Keterangan Jika Senin dan memilih "Minggu Ini" */}
      {period === "ini" && isMonday && (
        <div className="flex gap-3 items-start p-4 rounded-2xl border border-blue-100 bg-blue-50/50 text-blue-800">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium font-poppins">
            Minggu ini baru dimulai hari ini. Data statistik akan terakumulasi
            seiring berjalannya hari.
          </p>
        </div>
      )}

      {/* Rangkuman total durasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Durasi */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Total Waktu Online
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              {formatSecToHoursMins(currentData.totalSec)}
            </h3>
            <p className="text-[10px] text-muted font-light mt-0.5">
              Terakumulasi dalam rentang periode
            </p>
          </div>
        </div>

        {/* Card 2: Rata-rata Harian */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Rata-rata Harian
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              {formatSecToHoursMins(currentData.avgSec)}
            </h3>
            <p className="text-[10px] text-muted font-light mt-0.5">
              Rata-rata screen time per hari
            </p>
          </div>
        </div>

        {/* Card 3: Perbandingan vs Minggu Lalu */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              {compTitle}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                diffDirection === "down"
                  ? "bg-emerald-50 text-emerald-600"
                  : diffDirection === "up"
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-50 text-slate-500"
              }`}
            >
              {diffDirection === "down" ? (
                <ArrowDownRight className="w-4.5 h-4.5" />
              ) : diffDirection === "up" ? (
                <ArrowUpRight className="w-4.5 h-4.5" />
              ) : (
                <Minus className="w-4.5 h-4.5" />
              )}
            </div>
          </div>
          <div className="mt-4">
            {diffDirection === "down" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
                  -{formatDiffSecToHoursMinsIndo(diffSec)}
                </h3>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {compSubtext}
                </p>
              </div>
            ) : diffDirection === "up" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-red-500">
                  +{formatDiffSecToHoursMinsIndo(diffSec)}
                </h3>
                <p className="text-[10px] text-red-500 font-bold mt-0.5">
                  {compSubtextUp}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-muted">
                  Sama
                </h3>
                <p className="text-[10px] text-muted font-bold mt-0.5">
                  Sama seperti periode sebelumnya
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analisis Harian (Drill-down) */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-primary">
            Analisis Harian
          </h3>
          <p className="text-xs text-muted font-light mt-0.5">
            Pilih hari untuk melihat rincian aktivitas gawai per jam secara
            detail.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {currentData.dailyData.map(
            (dayData: Record<string, string | number>, index) => {
              const { dateStr, label, dayName } = getDayDateInfo(
                index,
                period === "lalu",
              );
              const totalMinutes =
                ((dayData.Instagram as number) || 0) +
                ((dayData.TikTok as number) || 0) +
                ((dayData.YouTube as number) || 0) +
                ((dayData.WhatsApp as number) || 0);

              const hasData = totalMinutes > 0;

              if (hasData) {
                return (
                  <Link
                    key={dateStr}
                    href={`/statistik/${dateStr}`}
                    className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-xs transition-all duration-300 min-h-24 cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                        {dayName}
                      </span>
                      <h4 className="text-xs font-black text-primary mt-0.5">
                        {label}
                      </h4>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs font-extrabold text-primary">
                        {formatMinutesToHoursMins(totalMinutes)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              }

              return (
                <div
                  key={dateStr}
                  className="flex flex-col justify-between p-4 rounded-2xl border border-border/40 bg-muted-light/10 opacity-50 min-h-24 select-none"
                >
                  <div>
                    <span className="text-[10px] font-bold text-muted/60 uppercase tracking-wider">
                      {dayName}
                    </span>
                    <h4 className="text-xs font-black text-muted/60 mt-0.5">
                      {label}
                    </h4>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] text-muted/50 font-light block leading-none">
                      Belum ada data
                    </span>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Main Widgets: Daily stacked bar + Top apps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily stacked bar (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="font-extrabold text-base text-primary">
              Grafik Penggunaan Harian
            </h3>
            <p className="text-xs text-muted font-light mt-0.5">
              Rincian durasi harian per aplikasi (dalam menit)
            </p>
          </div>

          <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
            <div className="h-64 min-w-[700px] lg:min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankedDailyData}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hari"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      borderColor: "#e1e8ef",
                      fontFamily: "Poppins",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                    // biome-ignore lint/suspicious/noExplicitAny: Recharts Tooltip formatter types
                    formatter={(value: any, name: any) => {
                      if (value === 0) return null;
                      return [`${value} menit`, name];
                    }}
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  />
                  {top4Apps.map((appName, index) => (
                    <Bar
                      key={appName}
                      dataKey={appName}
                      stackId="a"
                      fill={rankColors[index]}
                      // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
                      shape={(shapeProps: any) => (
                        <CustomBar
                          {...shapeProps}
                          rankedApps={[...top4Apps, "Lainnya"]}
                        />
                      )}
                    />
                  ))}
                  <Bar
                    dataKey="Lainnya"
                    stackId="a"
                    fill={rankColors[4]}
                    // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
                    shape={(shapeProps: any) => (
                      <CustomBar
                        {...shapeProps}
                        rankedApps={[...top4Apps, "Lainnya"]}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top apps horizontal list (1 col) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-base text-primary">
              Aplikasi Paling Sering Dibuka
            </h3>
            <p className="text-xs text-muted font-light mt-0.5">
              Durasi pemakaian total tertinggi
            </p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {currentData.topApps.map((app, index) => {
              const maxSec = currentData.topApps[0].sec;
              const barWidth = Math.round((app.sec / maxSec) * 100);
              const barColor = rankColors[index] || rankColors[4];
              return (
                <div key={app.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-primary">{app.name}</span>
                    <span className="text-muted">
                      {formatSecToHoursMins(app.sec)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted-light/60 overflow-hidden border border-border/30">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: barColor,
                      }}
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
            <h3 className="font-extrabold text-base text-primary">
              Jam Berapa Kamu Paling Sering Online?
            </h3>
            <p className="text-xs text-muted font-light mt-0.5">
              Heatmap interaktif pemakaian HP per jam per hari
            </p>
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
              {Array.from({ length: 24 }).map((_, i) => {
                const hourStr = String(i).padStart(2, "0");
                return <div key={hourStr}>{hourStr}</div>;
              })}
            </div>

            {/* Rows (Days Mon-Sun) */}
            {heatmapRows.map((row) => {
              const dayLabel = row[0].day;
              return (
                <div
                  key={dayLabel}
                  className="grid gap-1 items-center"
                  style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
                >
                  <div className="text-[10px] font-bold text-primary">
                    {dayLabel}
                  </div>
                  {row.map((cell) => {
                    // Check if current cell falls into productive hours (08:00 - 17:00)
                    const isProductive = cell.hour >= 8 && cell.hour <= 17;
                    // Check if current cell falls into sleep hours (22:00 - 06:00)
                    const isSleep = cell.hour >= 22 || cell.hour <= 6;

                    // Border style based on hours highlight
                    let highlightClass = "";
                    if (isSleep) {
                      highlightClass =
                        "border border-[2px] border-pink-300 shadow-[0_0_2px_rgba(244,63,94,0.1)] bg-[#fff0f3]/25";
                    } else if (isProductive) {
                      highlightClass =
                        "border border-[2px] border-amber-300 shadow-[0_0_2px_rgba(245,158,11,0.1)] bg-[#fffbeb]/25";
                    } else {
                      highlightClass = "border border-transparent";
                    }

                    return (
                      <div
                        key={cell.hour}
                        className={`h-5 rounded-md transition-all relative group ${highlightClass}`}
                        style={{ backgroundColor: getHeatmapColor(cell.val) }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mb-1.5 whitespace-nowrap">
                          {cell.day}, Jam {String(cell.hour).padStart(2, "0")}
                          .00 —{" "}
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
          <span
            className="w-3 h-3 rounded border border-border"
            style={{ backgroundColor: "#E2E8F0" }}
          />
          <span>Aman</span>
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#94A3B8" }}
          />
          <span>Ringan</span>
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#64748B" }}
          />
          <span>Sedang</span>
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#334155" }}
          />
          <span>Berat</span>
        </div>
      </div>

      {/* Kebiasaan yang Sering Muncul */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-primary">
            Kebiasaan yang Sering Muncul
          </h3>
          <p className="text-xs text-muted font-light mt-0.5 leading-relaxed">
            Seberapa sering kebiasaan ini muncul, dan seberapa besar pengaruhnya
            terhadap skor harianmu?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.flags.map((flag) => {
            const config = flagConfigs[flag.name] || {
              icon: Clock,
              weight: "",
              iconBg: "bg-muted-light border-border",
              iconColor: "text-muted",
              barColor: "bg-primary",
            };
            const IconComp = config.icon;
            const pct = Math.round((flag.count / flag.total) * 100);
            return (
              <div
                key={flag.name}
                className="flex gap-4 p-4 rounded-3xl border border-border bg-card shadow-xs items-center"
              >
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${config.iconBg} ${config.iconColor}`}
                >
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-primary truncate">
                      {flag.name}
                    </h4>
                    <span className="text-[10px] text-muted font-medium shrink-0">
                      {flag.label}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[9px] text-muted font-light leading-none">
                    {config.weight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
