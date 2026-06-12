"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Clock,
  Moon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Rectangle } from "recharts";
import { api } from "@/lib/utils/api";

const StatistikDetailHourlyChart = dynamic(
  () => import("@/components/usage/StatistikDetailHourlyChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-end justify-between px-4 pb-2 animate-pulse bg-muted-light/10 rounded-3xl border border-border/40">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-[6%] bg-muted-light/60 rounded-t"
            style={{ height: `${20 + (i % 4) * 20}%` }}
          />
        ))}
      </div>
    ),
  },
);

const rankColors = ["#334155", "#475569", "#64748B", "#94A3B8", "#E2E8F0"];

// Custom shape for dynamic topmost rounded corner
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

const formatSecToHoursMins = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

// Calculate previous and next date info
const getPrevNextDates = (currentDateStr: string) => {
  const date = new Date(currentDateStr);

  const prev = new Date(date);
  prev.setDate(date.getDate() - 1);
  const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(prev.getDate()).padStart(2, "0")}`;

  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(next.getDate()).padStart(2, "0")}`;

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasPrev = true; // Always allow looking back
  const hasNext = nextStr <= todayStr; // Do not allow looking into the future

  return { prevStr, nextStr, hasPrev, hasNext };
};

export default function DetailClient({ tanggal }: { tanggal: string }) {
  // Format date display (Indonesian style)
  const formatIndonesianDateStr = (dateStr: string) => {
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

  const formattedDate = formatIndonesianDateStr(tanggal);
  const { prevStr, nextStr, hasPrev, hasNext } = getPrevNextDates(tanggal);

  // React Queries
  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ["dayStatus", tanggal],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/dashboard/status?date=${tanggal}`,
      );
      return res.data.data;
    },
  });

  const { data: flagData, isLoading: isFlagLoading } = useQuery({
    queryKey: ["dayFlag", tanggal],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/dashboard/flag?date=${tanggal}`,
      );
      return res.data.data;
    },
  });

  const { data: hourlyData, isLoading: isHourlyLoading } = useQuery({
    queryKey: ["dayHourly", tanggal],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/dashboard/hourly-breakdown?date=${tanggal}`,
      );
      return res.data.data;
    },
  });

  const { data: breakdownData, isLoading: isBreakdownLoading } = useQuery({
    queryKey: ["dayBreakdown", tanggal],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/breakdown?startDate=${tanggal}&endDate=${tanggal}`,
      );
      return res.data.data;
    },
  });

  const { data: screenTimeData, isLoading: isScreenTimeLoading } = useQuery({
    queryKey: ["dayScreenTime", tanggal],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>(
        `/api/screen-time?startDate=${tanggal}&endDate=${tanggal}`,
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

  // Process behavioral scores status
  const totalScore = statusData?.totalScore ?? 0;
  const dailyStatus = statusData?.dailyStatus || "Hari yang Sempurna";

  let statusEmoji = "😊";
  const statusTitle = dailyStatus;
  let statusDesc = "Penggunaan HP-mu harian terkontrol.";
  let statusCardBg = "bg-emerald-50 border-emerald-200 text-emerald-800";

  if (totalScore > 0) {
    if (totalScore <= 30) {
      statusEmoji = "😊";
      statusDesc = "Penggunaan HP-mu harian terkontrol.";
      statusCardBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
    } else if (totalScore <= 60) {
      statusEmoji = "😐";
      statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      statusCardBg = "bg-amber-50 border-amber-200 text-amber-800";
    } else {
      statusEmoji = "😟";
      statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      statusCardBg = "bg-red-50 border border-red-200 text-red-800";
    }
  }

  // Screen time & Top app details
  const grandTotalSeconds = breakdownData?.grandTotalSeconds ?? 0;
  const topApp = breakdownData?.items?.[0];

  const screenTimeToday = screenTimeData?.items?.[0];
  const totalHours = Math.floor(
    (screenTimeToday?.totalDurationSeconds ?? grandTotalSeconds) / 3600,
  );
  const totalMinutes = Math.floor(
    ((screenTimeToday?.totalDurationSeconds ?? grandTotalSeconds) % 3600) / 60,
  );
  const midnightSec = screenTimeToday?.midnightDurationSeconds ?? 0;
  const maxCont = screenTimeToday?.maxContinuousSeconds ?? 0;
  const prodSec = screenTimeToday?.productiveHourDurationSeconds ?? 0;

  // Hourly breakdown data
  const chartData =
    hourlyData?.chartData ||
    Array.from({ length: 24 }, (_, i) => ({
      jam: `${String(i).padStart(2, "0")}.00`,
      Lainnya: 0,
    }));
  const top4Apps: string[] = hourlyData?.top4Apps || [];
  const top4AppsForRender: string[] =
    top4Apps.length > 0
      ? top4Apps
      : ["Instagram", "TikTok", "YouTube", "WhatsApp"];

  // Behavioral flags indicators
  const flagsList = [
    {
      name: "Terlalu lama main HP",
      active: flagData?.flagExcessiveUsage ?? false,
      icon: Clock,
      descActive: `Sudah ${totalHours} jam ${totalMinutes} menit hari ini`,
      descInactive: `Sudah ${totalHours} jam ${totalMinutes} menit hari ini`,
    },
    {
      name: "Sering buka-tutup aplikasi",
      active: flagData?.flagCompulsiveChecking ?? false,
      icon: RotateCcw,
      descActive: `Dibuka ${flagData?.openFrequencyLastHour ?? 0} kali dalam 1 jam terakhir`,
      descInactive: `Dibuka ${flagData?.openFrequencyLastHour ?? 0} kali dalam 1 jam terakhir`,
    },
    {
      name: "Main HP waktu tidur",
      active: flagData?.flagMidnightUsage ?? false,
      icon: Moon,
      descActive: `${Math.round(midnightSec / 60)} menit terdeteksi di jam tidur`,
      descInactive: `${Math.round(midnightSec / 60)} menit terdeteksi di jam tidur`,
    },
    {
      name: "Nonstop tanpa jeda",
      active: flagData?.flagContinuousUsage ?? false,
      icon: Activity,
      descActive: `Sesi terpanjang ${Math.round(maxCont / 60)} menit`,
      descInactive: `Sesi terpanjang ${Math.round(maxCont / 60)} menit`,
    },
    {
      name: "Distraksi jam produktif",
      active: flagData?.flagProductiveHourDistraction ?? false,
      icon: Briefcase,
      descActive: `${Math.round(prodSec / 60)} menit terdeteksi di jam produktif`,
      descInactive: `${Math.round(prodSec / 60)} menit terdeteksi di jam produktif`,
    },
  ];

  // Score breakdown items
  const breakdownItems = [
    {
      name: "Durasi pemakaian",
      icon: Clock,
      bobot: "30%",
      nilai: statusData?.usageDurationScore ?? 0,
      max: 30,
    },
    {
      name: "Frekuensi buka-tutup",
      icon: RotateCcw,
      bobot: "20%",
      nilai: statusData?.openFrequencyScore ?? 0,
      max: 20,
    },
    {
      name: "Aktivitas jam tidur",
      icon: Moon,
      bobot: "15%",
      nilai: statusData?.midnightUsageScore ?? 0,
      max: 15,
    },
    {
      name: "Penggunaan nonstop",
      icon: Activity,
      bobot: "20%",
      nilai: statusData?.continuousUsageScore ?? 0,
      max: 20,
    },
    {
      name: "Distraksi jam produktif",
      icon: Briefcase,
      bobot: "15%",
      nilai: statusData?.productiveHourScore ?? 0,
      max: 15,
    },
  ];

  return (
    <div className="space-y-6 font-poppins">
      {/* Header with Back button */}
      <div>
        <Link
          href="/statistik"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-primary transition-all rounded-xl bg-card border border-border hover:border-primary/20 shadow-2xs font-bold mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Statistik</span>
        </Link>
      </div>

      {/* Date Header with Calendar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
            {formattedDate}
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Rincian dan analisis penggunaan gawai pada tanggal ini.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0 self-start sm:self-center">
          {hasPrev ? (
            <Link
              href={`/statistik/detail?tanggal=${prevStr}`}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:border-primary/20 text-muted hover:text-primary transition-all cursor-pointer shadow-2xs"
            >
              ← Hari sebelumnya
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded-xl border border-border/40 bg-muted-light/10 text-muted/40 cursor-not-allowed select-none">
              ← Hari sebelumnya
            </span>
          )}

          {hasNext ? (
            <Link
              href={`/statistik/detail?tanggal=${nextStr}`}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:border-primary/20 text-muted hover:text-primary transition-all cursor-pointer shadow-2xs"
            >
              Hari berikutnya →
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded-xl border border-border/40 bg-muted-light/10 text-muted/40 cursor-not-allowed select-none">
              Hari berikutnya →
            </span>
          )}
        </div>
      </div>

      {/* Rangkuman 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Status & Skor Hari Itu */}
        {isStatusLoading || isSettingLoading ? (
          <div className="border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 bg-card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="w-6 h-6 rounded-full bg-muted-light" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 bg-muted-light rounded w-16" />
              <div className="h-3 bg-muted-light rounded w-24" />
              <div className="h-2 bg-muted-light rounded w-32" />
            </div>
          </div>
        ) : (
          <div
            className={`border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 ${statusCardBg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Status & Skor Hari Itu
              </span>
              <span className="text-xl">{statusEmoji}</span>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-black leading-none">
                {totalScore}/100
              </h3>
              <h4 className="text-xs font-bold">{statusTitle}</h4>
              <p className="text-[9px] font-light leading-normal opacity-85">
                {statusDesc}
              </p>
            </div>
          </div>
        )}

        {/* Card 2: Total Screen Time */}
        {isScreenTimeLoading || isBreakdownLoading ? (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-2.5 bg-muted-light rounded w-28" />
              <div className="w-8 h-8 rounded-xl bg-muted-light" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 bg-muted-light rounded w-20" />
              <div className="h-2 bg-muted-light rounded w-36" />
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Total Screen Time
              </span>
              <div className="p-2 rounded-xl bg-muted-light/60">
                <Clock className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-black text-primary leading-none">
                {formatSecToHoursMins(grandTotalSeconds)}
              </h3>
              <p className="text-[9px] text-muted font-light leading-normal">
                Total durasi penggunaan gawai hari itu.
              </p>
            </div>
          </div>
        )}

        {/* Card 3: Aplikasi Paling Banyak Digunakan */}
        {isBreakdownLoading ? (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-2.5 bg-muted-light rounded w-24" />
              <div className="w-8 h-8 rounded-xl bg-muted-light" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 bg-muted-light rounded w-24" />
              <div className="h-2 bg-muted-light rounded w-32" />
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Tersering hari itu
              </span>
              <div className="p-2 rounded-xl bg-muted-light/60">
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-black text-primary leading-none truncate max-w-full">
                {topApp ? topApp.appName : "Tidak ada"}
              </h3>
              <p className="text-[9px] text-muted font-light leading-normal">
                {topApp
                  ? `Digunakan selama ${formatSecToHoursMins(topApp.totalDurationSeconds)}.`
                  : "Tidak ada pemakaian gawai."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Hourly Chart + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-extrabold text-base text-primary">
                Rincian Penggunaan per Jam
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Distribusi durasi penggunaan aplikasi dalam menit setiap jamnya.
              </p>
            </div>

            <div className="flex gap-4 text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#fff0f3] border border-pink-300 block" />
                <span>🌙 Jam Tidur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#fffbeb] border border-amber-300 block" />
                <span>💼 Jam Produktif</span>
              </div>
            </div>
          </div>

          {isHourlyLoading || isSettingLoading ? (
            <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
              <div className="h-64 min-w-[700px] lg:min-w-0 w-full flex items-end justify-between px-4 pb-2 animate-pulse bg-muted-light/10 rounded-3xl border border-border/40">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[6%] bg-muted-light/60 rounded-t"
                    style={{ height: `${20 + (i % 4) * 20}%` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <StatistikDetailHourlyChart
              chartData={chartData}
              top4AppsForRender={top4AppsForRender}
              sleepStartHour={sleepStartHour}
              sleepEndHour={sleepEndHour}
              prodStartHour={prodStartHour}
              prodEndHour={prodEndHour}
            />
          )}
        </div>

        {/* Detailed Apps breakdown & Flags */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-extrabold text-base text-primary mb-1">
              Kebiasaan yang Terdeteksi
            </h3>
            <p className="text-xs text-muted font-light mb-4">
              Pola kebiasaan penggunaan gawai teridentifikasi hari ini.
            </p>
            <div className="space-y-3">
              {isFlagLoading || isScreenTimeLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center p-3 rounded-2xl border border-border bg-background/20 animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-xl bg-muted-light/60 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-muted-light rounded w-28" />
                          <div className="w-12 h-4 bg-muted-light rounded-full" />
                        </div>
                        <div className="h-2 bg-muted-light rounded w-36" />
                      </div>
                    </div>
                  ))
                : flagsList.map((flag) => {
                    const IconComp = flag.icon;
                    return (
                      <div
                        key={flag.name}
                        className={`flex gap-3 items-center p-3 rounded-2xl border transition-all ${
                          flag.active
                            ? "bg-red-50/45 border-red-100 text-red-800"
                            : "bg-emerald-50/20 border-emerald-100/60 text-emerald-800"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                            flag.active
                              ? "bg-red-50 border-red-200 text-red-600"
                              : "bg-emerald-50 border-emerald-200 text-emerald-600"
                          }`}
                        >
                          <IconComp className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold truncate">
                              {flag.name}
                            </h4>
                            <span
                              className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                                flag.active
                                  ? "bg-red-105 text-red-800 border border-red-200"
                                  : "bg-emerald-105 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {flag.active ? "Terdeteksi" : "Aman"}
                            </span>
                          </div>
                          <p className="text-[9px] font-light opacity-85 mt-0.5 leading-snug">
                            {flag.active ? flag.descActive : flag.descInactive}
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Skor Perilaku */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-primary">
            Breakdown Skor Perilaku
          </h3>
          <p className="text-xs text-muted font-light mt-0.5 leading-relaxed">
            Dari mana skor {totalScore} ini berasal?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isStatusLoading || isSettingLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-3xl border border-border bg-card shadow-xs items-center animate-pulse"
                >
                  <div className="w-10 h-10 rounded-2xl bg-muted-light/60 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3.5 bg-muted-light rounded w-32" />
                      <div className="h-2.5 bg-muted-light rounded w-16" />
                    </div>
                    <div className="w-full h-2 bg-muted-light/60 rounded-full" />
                    <div className="h-2 bg-muted-light rounded w-24" />
                  </div>
                </div>
              ))
            : breakdownItems.map((item) => {
                const Icon = item.icon;
                const percent = Math.round((item.nilai / item.max) * 100);

                let iconBg = "bg-emerald-50 border-emerald-100";
                let iconColor = "text-emerald-600";
                let barColor = "bg-emerald-500";

                if (percent > 66) {
                  iconBg = "bg-red-50 border-red-100";
                  iconColor = "text-red-600";
                  barColor = "bg-red-500";
                } else if (percent > 33) {
                  iconBg = "bg-amber-50 border-amber-100";
                  iconColor = "text-amber-600";
                  barColor = "bg-amber-500";
                }

                return (
                  <div
                    key={item.name}
                    className="flex gap-4 p-4 rounded-3xl border border-border bg-card shadow-xs items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-primary truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-muted font-medium shrink-0">
                          {item.nilai} dari {item.max} poin
                        </span>
                      </div>

                      <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="text-[9px] text-muted font-light leading-none">
                        Bobot: {item.bobot}
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
