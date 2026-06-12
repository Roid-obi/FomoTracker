"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Clock,
  Info,
  Moon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/utils/api";

const StatistikDailyChart = dynamic(
  () => import("@/components/usage/StatistikDailyChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-end justify-between px-4 pb-2 animate-pulse bg-muted-light/10 rounded-3xl border border-border/40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-[10%] bg-muted-light/60 rounded-t"
            style={{ height: `${30 + (i % 3) * 20}%` }}
          />
        ))}
      </div>
    ),
  },
);

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
    weight: "Berkontribusi 15% terhadap skor harian",
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    barColor: "bg-indigo-500",
  },
  "Nonstop tanpa jeda": {
    icon: Activity,
    weight: "Berkontribusi 20% terhadap skor harian",
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
  const isMonday = new Date().getDay() === 1; // Check if today is Monday

  // Function to calculate week start (Monday) and end (Sunday) dates
  const getWeekRange = (p: "ini" | "lalu" | "dua-lalu") => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    if (p === "lalu") {
      monday.setDate(monday.getDate() - 7);
    } else if (p === "dua-lalu") {
      monday.setDate(monday.getDate() - 14);
    }

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
      endDate: formatDate(sunday),
    };
  };

  const currentRange = getWeekRange(period);
  const comparisonRange = getWeekRange(period === "ini" ? "lalu" : "dua-lalu");

  // Queries
  const { data: screenTimeData, isLoading: isScreenTimeLoading } = useQuery({
    queryKey: ["screenTime", currentRange.startDate, currentRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/screen-time?startDate=${currentRange.startDate}&endDate=${currentRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: compScreenTimeData } = useQuery({
    queryKey: [
      "screenTime",
      comparisonRange.startDate,
      comparisonRange.endDate,
    ],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/screen-time?startDate=${comparisonRange.startDate}&endDate=${comparisonRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: dailyBreakdownData, isLoading: isDailyBreakdownLoading } =
    useQuery({
      queryKey: [
        "dailyBreakdown",
        currentRange.startDate,
        currentRange.endDate,
      ],
      queryFn: async () => {
        const res = await api.get<{ success: boolean; data: any[] }>(
          `/api/statistic/daily-breakdown?startDate=${currentRange.startDate}&endDate=${currentRange.endDate}`,
        );
        return res.data.data;
      },
    });

  const { data: heatmapData, isLoading: isHeatmapLoading } = useQuery({
    queryKey: ["heatmap", currentRange.startDate, currentRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any[] }>(
        `/api/statistic/heatmap?startDate=${currentRange.startDate}&endDate=${currentRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: breakdownData, isLoading: isBreakdownLoading } = useQuery({
    queryKey: ["breakdown", currentRange.startDate, currentRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/breakdown?startDate=${currentRange.startDate}&endDate=${currentRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: flagsData, isLoading: isFlagsLoading } = useQuery({
    queryKey: ["flags", currentRange.startDate, currentRange.endDate],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any[] }>(
        `/api/statistic/flags?startDate=${currentRange.startDate}&endDate=${currentRange.endDate}`,
      );
      return res.data.data;
    },
  });

  const { data: settingData, isLoading: isSettingLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        "/api/setting/user",
      );
      return res.data.data;
    },
  });

  const prodStartHour = settingData
    ? parseInt(settingData.productiveStart.split(":")[0])
    : 8;
  const prodEndHour = settingData
    ? parseInt(settingData.productiveEnd.split(":")[0])
    : 17;
  const sleepStartHour = settingData
    ? parseInt(settingData.sleepStart.split(":")[0])
    : 22;
  const sleepEndHour = settingData
    ? parseInt(settingData.sleepEnd.split(":")[0])
    : 6;

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

  // Process Stacked Chart Data
  const top4Apps: string[] = (breakdownData?.items ?? [])
    .slice(0, 4)
    .map((app: any) => app.appName as string);
  const top4AppsForRender: string[] =
    top4Apps.length > 0
      ? top4Apps
      : ["Instagram", "TikTok", "YouTube", "WhatsApp"];
  const dayNamesShort = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const rankedDailyData = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(`${currentRange.startDate}T00:00:00Z`);
    const target = new Date(start);
    target.setUTCDate(start.getUTCDate() + index);

    const yyyy = target.getUTCFullYear();
    const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(target.getUTCDate()).padStart(2, "0");
    const targetDateStr = `${yyyy}-${mm}-${dd}`;

    const match =
      dailyBreakdownData?.find((d) => d.date === targetDateStr) || {};

    const row: Record<string, string | number> = {
      hari: dayNamesShort[index],
    };

    for (const app of top4AppsForRender) {
      row[app] = match[app] || 0;
    }

    let otherSum = 0;
    for (const [key, val] of Object.entries(match)) {
      if (key !== "date" && !top4AppsForRender.includes(key)) {
        otherSum += (val as number) || 0;
      }
    }
    row.Lainnya = otherSum;

    return row;
  });

  // Heatmap rows data fallback
  const heatmapRows =
    heatmapData ||
    Array.from({ length: 7 }, (_, dIdx) => {
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      return Array.from({ length: 24 }, (_, hour) => ({
        day: days[dIdx],
        hour,
        val: 0,
      }));
    });

  // Top Apps
  const topAppsForDisplay = (breakdownData?.items ?? [])
    .slice(0, 5)
    .map((app: any) => ({
      name: app.appName,
      sec: app.totalDurationSeconds,
    }));
  const maxSec = topAppsForDisplay[0]?.sec || 1;

  // Behavioral Flags
  const flagsList = flagsData || [
    {
      name: "Terlalu lama main HP",
      count: 0,
      total: 7,
      label: "Muncul 0 dari 7 hari",
    },
    {
      name: "Sering buka-tutup aplikasi",
      count: 0,
      total: 7,
      label: "Muncul 0 dari 7 hari",
    },
    {
      name: "Main HP waktu tidur",
      count: 0,
      total: 7,
      label: "Muncul 0 dari 7 hari",
    },
    {
      name: "Nonstop tanpa jeda",
      count: 0,
      total: 7,
      label: "Muncul 0 dari 7 hari",
    },
    {
      name: "Distraksi jam produktif",
      count: 0,
      total: 7,
      label: "Muncul 0 dari 7 hari",
    },
  ];

  // Daily drill-down days metadata
  const getDayDateInfo = (dayIdx: number) => {
    const start = new Date(`${currentRange.startDate}T00:00:00Z`);
    const targetDate = new Date(start);
    targetDate.setUTCDate(start.getUTCDate() + dayIdx);

    const yyyy = targetDate.getUTCFullYear();
    const mm = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getUTCDate()).padStart(2, "0");
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

    const label = `${targetDate.getUTCDate()} ${monthNames[targetDate.getUTCMonth()]}`;
    const dayName = dayNames[dayIdx];

    return { dateStr, label, dayName };
  };

  // Compare diff
  const currentTotal = screenTimeData?.totalSeconds ?? 0;
  const comparisonTotal = compScreenTimeData?.totalSeconds ?? 0;
  const diffSec = Math.abs(currentTotal - comparisonTotal);
  const diffDirection = currentTotal >= comparisonTotal ? "up" : "down";

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
        <div className="flex gap-1.5 p-1.5 bg-card border border-border rounded-3xl w-fit shrink-0">
          <button
            type="button"
            onClick={() => setPeriod("ini")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              period === "ini"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-primary hover:bg-muted-light/30"
            }`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => setPeriod("lalu")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              period === "lalu"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-primary hover:bg-muted-light/30"
            }`}
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

      {/* 2 Column Main Grid Layout structured using the Golden Ratio (1.618:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-6">
        {/* Left Column (Golden Ratio: ~61.8% width) - Charts, summaries, heatmap */}
        <div className="space-y-6">
          {/* Rangkuman total durasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Total Durasi */}
            {isScreenTimeLoading || isSettingLoading ? (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-2.5 bg-muted-light rounded w-24" />
                  <div className="w-8 h-8 rounded-xl bg-muted-light" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-7 bg-muted-light rounded w-24" />
                  <div className="h-2 bg-muted-light rounded w-36" />
                </div>
              </div>
            ) : (
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
                    {formatSecToHoursMins(screenTimeData?.totalSeconds ?? 0)}
                  </h3>
                  <p className="text-[10px] text-muted font-light mt-0.5">
                    Terakumulasi dalam rentang periode
                  </p>
                </div>
              </div>
            )}

            {/* Card 2: Rata-rata Harian */}
            {isScreenTimeLoading || isSettingLoading ? (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-2.5 bg-muted-light rounded w-24" />
                  <div className="w-8 h-8 rounded-xl bg-muted-light" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-7 bg-muted-light rounded w-24" />
                  <div className="h-2 bg-muted-light rounded w-36" />
                </div>
              </div>
            ) : (
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
                    {formatSecToHoursMins(screenTimeData?.avgDailySeconds ?? 0)}
                  </h3>
                  <p className="text-[10px] text-muted font-light mt-0.5">
                    Rata-rata screen time per hari
                  </p>
                </div>
              </div>
            )}

            {/* Card 3: Perbandingan vs Minggu Lalu */}
            {isScreenTimeLoading || isSettingLoading ? (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-2.5 bg-muted-light rounded w-28" />
                  <div className="w-8 h-8 rounded-xl bg-muted-light" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-7 bg-muted-light rounded w-20" />
                  <div className="h-2 bg-muted-light rounded w-32" />
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-36 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    {compTitle}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      diffDirection === "down"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {diffDirection === "down" ? (
                      <ArrowDownRight className="w-4.5 h-4.5" />
                    ) : (
                      <ArrowUpRight className="w-4.5 h-4.5" />
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
                  ) : (
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-red-500">
                        +{formatDiffSecToHoursMinsIndo(diffSec)}
                      </h3>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">
                        {compSubtextUp}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Grafik Penggunaan Harian */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="mb-6">
              <h3 className="font-extrabold text-base text-primary">
                Grafik Penggunaan Harian
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Rincian durasi harian per aplikasi (dalam menit)
              </p>
            </div>

            {isDailyBreakdownLoading || isSettingLoading ? (
              <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
                <div className="h-64 min-w-[700px] lg:min-w-0 w-full flex items-end justify-between px-4 pb-2 animate-pulse bg-muted-light/10 rounded-3xl border border-border/40">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[10%] bg-muted-light/60 rounded-t"
                      style={{ height: `${30 + (i % 3) * 20}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <StatistikDailyChart
                rankedDailyData={rankedDailyData}
                top4AppsForRender={top4AppsForRender}
              />
            )}
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
                  <span>
                    🌙 Jam Tidur
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#fffbeb] border border-amber-200 block" />
                  <span>
                    💼 Jam Belajar
                  </span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid */}
            {isHeatmapLoading || isSettingLoading ? (
              <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
                <div className="min-w-[640px] space-y-1.5 animate-pulse">
                  {/* Headers */}
                  <div
                    className="grid gap-1 text-center text-[9px] font-bold text-muted uppercase"
                    style={{
                      gridTemplateColumns: "repeat(25, minmax(0, 1fr))",
                    }}
                  >
                    <div>Hari</div>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i}>{String(i).padStart(2, "0")}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {[
                    "Senin",
                    "Selasa",
                    "Rabu",
                    "Kamis",
                    "Jumat",
                    "Sabtu",
                    "Minggu",
                  ].map((day) => (
                    <div
                      key={day}
                      className="grid gap-1 items-center"
                      style={{
                        gridTemplateColumns: "repeat(25, minmax(0, 1fr))",
                      }}
                    >
                      <div className="text-[10px] font-bold text-primary">
                        {day}
                      </div>
                      {Array.from({ length: 24 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-5 rounded-md bg-muted-light/60"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
                <div className="min-w-[640px] space-y-1.5">
                  {/* Headers (Hours 00-23) */}
                  <div
                    className="grid gap-1 text-center text-[9px] font-bold text-muted uppercase"
                    style={{
                      gridTemplateColumns: "repeat(25, minmax(0, 1fr))",
                    }}
                  >
                    <div>Hari</div>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hourStr = String(i).padStart(2, "0");
                      return <div key={hourStr}>{hourStr}</div>;
                    })}
                  </div>

                  {/* Rows (Days Mon-Sun) */}
                  {heatmapRows.map((row: any) => {
                    const dayLabel = row[0].day;
                    return (
                      <div
                        key={dayLabel}
                        className="grid gap-1 items-center"
                        style={{
                          gridTemplateColumns: "repeat(25, minmax(0, 1fr))",
                        }}
                      >
                        <div className="text-[10px] font-bold text-primary">
                          {dayLabel}
                        </div>
                        {row.map((cell: any) => {
                          const isHourInRange = (
                            h: number,
                            start: number,
                            end: number,
                          ) => {
                            if (start <= end) {
                              return h >= start && h <= end;
                            } else {
                              return h >= start || h <= end;
                            }
                          };
                          const isProductive = isHourInRange(
                            cell.hour,
                            prodStartHour,
                            prodEndHour,
                          );
                          const isSleep = isHourInRange(
                            cell.hour,
                            sleepStartHour,
                            sleepEndHour,
                          );

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
                              style={{
                                backgroundColor: getHeatmapColor(cell.val),
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mb-1.5 whitespace-nowrap">
                                {cell.day}, Jam{" "}
                                {String(cell.hour).padStart(2, "0")}
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
            )}

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
        </div>

        {/* Right Column (Golden Ratio: ~38.2% width) - Drill-down, top apps, habits */}
        <div className="space-y-6">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {isScreenTimeLoading || isSettingLoading
                ? Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card animate-pulse min-h-24"
                    >
                      <div className="space-y-1.5">
                        <div className="h-2 bg-muted-light rounded w-10" />
                        <div className="h-3 bg-muted-light rounded w-16" />
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <div className="h-4 bg-muted-light rounded w-12" />
                        <div className="w-4 h-4 bg-muted-light rounded-full" />
                      </div>
                    </div>
                  ))
                : Array.from({ length: 7 }).map((_, index) => {
                    const { dateStr, label, dayName } = getDayDateInfo(index);
                    const dayMatch = screenTimeData?.items?.find(
                      (item: any) => item.statDate === dateStr,
                    );
                    const totalMinutes = dayMatch
                      ? Math.round(dayMatch.totalDurationSeconds / 60)
                      : 0;
                    const hasData = totalMinutes > 0;

                    if (hasData) {
                      return (
                        <Link
                          key={dateStr}
                          href={`/statistik/detail?tanggal=${dateStr}`}
                          className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-xs transition-all duration-300 min-h-24 cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                              {dayName.slice(0, 3)}
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
                            {dayName.slice(0, 3)}
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
                  })}
            </div>
          </div>

          {/* Aplikasi Paling Sering Dibuka */}
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
              {isBreakdownLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted-light rounded w-20" />
                      <div className="h-3 bg-muted-light rounded w-12" />
                    </div>
                    <div className="w-full h-3 rounded-full bg-muted-light/60 overflow-hidden" />
                  </div>
                ))
              ) : topAppsForDisplay.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted font-light">
                  Belum ada data aplikasi.
                </div>
              ) : (
                topAppsForDisplay.map((app: any, index: number) => {
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
                })
              )}
            </div>
          </div>

          {/* Kebiasaan yang Sering Muncul */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="font-extrabold text-base text-primary">
                Kebiasaan yang Sering Muncul
              </h3>
              <p className="text-xs text-muted font-light mt-0.5 leading-relaxed">
                Seberapa sering kebiasaan ini muncul, dan seberapa besar
                pengaruhnya terhadap skor harianmu?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isFlagsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 rounded-3xl border border-border bg-card shadow-xs items-center animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-muted-light/60 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-3.5 bg-muted-light rounded w-32" />
                          <div className="h-2.5 bg-muted-light rounded w-12" />
                        </div>
                        <div className="w-full h-2 bg-muted-light/60 rounded-full" />
                        <div className="h-2 bg-muted-light rounded w-48" />
                      </div>
                    </div>
                  ))
                : flagsList.map((flag: any) => {
                    const config = flagConfigs[flag.name] || {
                      icon: Clock,
                      weight: "",
                      iconBg: "bg-muted-light border-border",
                      iconColor: "text-muted",
                      barColor: "bg-primary",
                    };
                    const IconComp = config.icon;
                    const pct =
                      flag.total > 0
                        ? Math.round((flag.count / flag.total) * 100)
                        : 0;
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
      </div>
    </div>
  );
}
