"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Laptop,
  Moon,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import {
  initialActivityLogs,
  initialBehavioralScores,
  initialDailyStats,
  initialWeeklyInsights,
  initialApps,
  initialUserDevices,
} from "@/lib/data/databaseInitialData";
import { useUser } from "@/hooks/useUser";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const { data: user } = useUser();
  const todayStr = "Rabu, 4 Juni 2026"; // Explicit date aligned with sitemap greeting

  // 1. Calculate stats from daily_stats
  const totalDurationSeconds = initialDailyStats.reduce(
    (acc, curr) => acc + curr.total_duration_seconds,
    0,
  );
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  // Find most used app
  let topApp = { name: "Tidak ada", duration: 0 };
  for (const stat of initialDailyStats) {
    const app = initialApps.find((a) => a.id === stat.app_id);
    if (app && stat.total_duration_seconds > topApp.duration) {
      topApp = { name: app.name, duration: stat.total_duration_seconds };
    }
  }

  // 2. Behavioral score status configuration
  const scoreData = initialBehavioralScores[0];
  let statusEmoji = "😊";
  let statusTitle = "Hari yang Baik";
  let statusDesc = "Penggunaan HP-mu hari ini terkontrol.";
  let statusCardBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
  let statusTextColor = "text-emerald-700";

  if (scoreData) {
    if (scoreData.total_score >= 40 && scoreData.total_score <= 69) {
      statusEmoji = "😐";
      statusTitle = "Perlu Diperhatikan";
      statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      statusCardBg = "bg-amber-50 border-amber-200 text-amber-800";
      statusTextColor = "text-amber-700";
    } else if (scoreData.total_score >= 70) {
      statusEmoji = "😟";
      statusTitle = "Hari yang Berat";
      statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      statusCardBg = "bg-red-50 border-red-200 text-red-800";
      statusTextColor = "text-red-600";
    }
  }

  // 3. Hourly Activity logs mapping
  const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = String(i).padStart(2, "0") + ".00";
    const dataObj: any = { jam: hourLabel };
    for (const app of initialApps) {
      dataObj[app.name] = 0;
    }
    return dataObj;
  });

  for (const log of initialActivityLogs) {
    const timePart = log.started_at.split("T")[1];
    if (timePart) {
      const startHour = parseInt(timePart.split(":")[0]);
      const app = initialApps.find((a) => a.id === log.app_id);
      if (app && startHour >= 0 && startHour < 24) {
        hourlyChartData[startHour][app.name] += Math.round(
          log.duration_seconds / 60,
        );
      }
    }
  }

  const filteredChartData = hourlyChartData.filter((d) => {
    const sum = initialApps.reduce((acc, app) => acc + d[app.name], 0);
    const hourNum = parseInt(d.jam.split(".")[0]);
    return sum > 0 || (hourNum >= 8 && hourNum <= 22 && hourNum % 2 === 0);
  });

  // Calculate parameters for 5 indicators
  const totalChecks = initialDailyStats.reduce(
    (acc, curr) => acc + curr.open_frequency,
    0,
  );
  const midnightSec = initialDailyStats.reduce(
    (acc, curr) => acc + curr.midnight_duration_seconds,
    0,
  );
  const maxCont = Math.max(
    ...initialDailyStats.map((d) => d.max_continuous_seconds),
  );
  const prodSec = initialDailyStats.reduce(
    (acc, curr) => acc + curr.productive_hour_duration_seconds,
    0,
  );

  // Group of 5 indicators (always visible)
  const coreBehaviors = [
    {
      id: "excessive",
      name: "Terlalu lama main HP",
      desc: `Sudah ${totalHours} jam ${totalMinutes} menit hari ini`,
      active: scoreData ? scoreData.flag_excessive_usage : false,
      icon: Clock,
      color: "text-red-600 bg-red-50 border-red-100",
    },
    {
      id: "compulsive",
      name: "Sering buka-tutup aplikasi",
      desc: `Dibuka ${totalChecks} kali hari ini`,
      active: scoreData ? scoreData.flag_compulsive_checking : false,
      icon: RotateCcw,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "midnight",
      name: "Main HP waktu harusnya tidur",
      desc: `${Math.round(midnightSec / 60)} menit terdeteksi di jam tidur`,
      active: scoreData ? scoreData.flag_midnight_usage : false,
      icon: Moon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "continuous",
      name: "Nonstop tanpa istirahat",
      desc: `Sesi terpanjang ${Math.round(maxCont / 60)} menit tanpa jeda`,
      active: scoreData ? scoreData.flag_continuous_usage : false,
      icon: Activity,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      id: "productive",
      name: "Main HP saat jam belajar/kerja",
      desc: `${Math.round(prodSec / 60)} menit terdeteksi di jam produktif`,
      active: scoreData ? scoreData.flag_productive_hour_distraction : false,
      icon: Briefcase,
      color: "text-pink-600 bg-pink-50 border-pink-100",
    },
  ];

  // 5. Weekly AI insight snippet
  const latestInsight = initialWeeklyInsights[0];

  return (
    <div className="space-y-6 font-poppins text-primary">
      {/* 2 Column Main Grid Layout in style of reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Core Metrics, Greeting, and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Greeting Card with Vector SVG Art */}
          <div className="bg-gradient-to-r from-muted-light/75 to-accent/15 border border-border/80 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-4 max-w-md relative z-10 text-left">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-primary leading-tight">
                Halo, {user?.name || "User"}!
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Selamat datang kembali. FomoTracker siap membantumu memantau
                waktu pemakaian media sosial dan membangun kebiasaan digital
                yang lebih produktif hari ini.
              </p>
              <Link
                href="/statistik"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-secondary transition-all shadow-sm cursor-pointer"
              >
                <span>Lihat Statistik Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Premium Flat Vector SVG Illustration */}
            <div className="w-48 h-36 shrink-0 relative z-10 hidden sm:block">
              <svg
                viewBox="0 0 200 150"
                className="w-full h-full"
                aria-hidden="true"
              >
                {/* Chair / Block */}
                <rect
                  x="100"
                  y="80"
                  width="55"
                  height="45"
                  rx="8"
                  fill="#e1e8ef"
                />
                <rect
                  x="105"
                  y="85"
                  width="45"
                  height="40"
                  rx="4"
                  fill="#f9f9f9"
                />

                {/* Small Plant decoration */}
                <path
                  d="M45,120 Q35,90 55,80 Q65,100 50,120 Z"
                  fill="#c4ffdd"
                />
                <path
                  d="M50,120 Q55,95 68,92 Q72,110 52,120 Z"
                  fill="#a2f2c2"
                />
                <rect
                  x="44"
                  y="115"
                  width="12"
                  height="15"
                  rx="2"
                  fill="#506e86"
                />

                {/* Character Sitting */}
                {/* Legs */}
                <path
                  d="M125,80 L105,115 L95,115"
                  stroke="#113a5d"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Torso */}
                <path
                  d="M125,50 L128,82 L115,82"
                  stroke="#062743"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Jacket Orange */}
                <path
                  d="M123,48 L126,80 L115,80"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Head */}
                <circle cx="123" cy="35" r="9" fill="#e5c5b5" />
                {/* Hair */}
                <path
                  d="M117,32 Q122,25 129,32 C129,28 123,26 117,32 Z"
                  fill="#062743"
                />
                {/* Arm / Hand holding device */}
                <path
                  d="M128,58 L115,62 L105,58"
                  stroke="#e5c5b5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Screen / Phone Glow */}
                <rect
                  x="98"
                  y="50"
                  width="6"
                  height="11"
                  rx="1"
                  transform="rotate(-15 98 50)"
                  fill="#062743"
                />
                <circle
                  cx="95"
                  cy="52"
                  r="8"
                  fill="#c4ffdd"
                  opacity="0.45"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Row of 3 Cards side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Status Hari Ini & Skor */}
            <div
              className={`border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 ${statusCardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Status & Skor
                </span>
                <span className="text-xl">{statusEmoji}</span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-black leading-none">
                  {scoreData ? `${scoreData.total_score}/100` : "—"}
                </h3>
                <h4 className="text-xs font-bold">{statusTitle}</h4>
                <p className="text-[9px] font-light leading-normal opacity-85">
                  {statusDesc}
                </p>
              </div>
            </div>

            {/* Card 2: Screen Time Hari Ini */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Screen Time
                </span>
                <div className="p-2 rounded-xl bg-muted-light/60">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-black text-primary leading-none">
                  {totalHours}j {totalMinutes}m
                </h3>
                <p className="text-[9px] text-muted font-light leading-normal">
                  Total durasi pemakaian media sosial hari ini.
                </p>
              </div>
            </div>

            {/* Card 3: Aplikasi Tersering Hari Ini */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Tersering
                </span>
                <div className="p-2 rounded-xl bg-muted-light/60">
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-black text-primary leading-none truncate max-w-full">
                  {topApp.name}
                </h3>
                <p className="text-[9px] text-muted font-light leading-normal">
                  Durasi terlama: {Math.floor(topApp.duration / 60)} menit.
                </p>
              </div>
            </div>
          </div>

          {/* Grafik Aktivitas Hari Ini */}
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="mb-6">
              <h3 className="font-extrabold text-base text-primary">
                Analitis Aktivitas
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Stacked bar chart durasi penggunaan gawai per jam (menit)
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredChartData}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="jam"
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
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  />
                  <Bar dataKey="Instagram" stackId="a" fill="#062743" />
                  <Bar dataKey="TikTok" stackId="a" fill="#113a5d" />
                  <Bar dataKey="YouTube" stackId="a" fill="#c4ffdd" />
                  <Bar
                    dataKey="WhatsApp"
                    stackId="a"
                    fill="#e6eef4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Connected Devices, Core Behaviors, and AI Snippet */}
        <div className="space-y-6">
          {/* Perangkat Terhubung Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-primary mb-4">
              Perangkat Terhubung
            </h3>
            <div className="space-y-3">
              {initialUserDevices.map((device) => {
                const isAndroid = device.platform === "android_app";
                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted-light/60 flex items-center justify-center text-primary shrink-0 border border-border/40">
                        {isAndroid ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-primary block">
                          {isAndroid ? "Android App" : "Browser Extension"}
                        </span>
                        <p className="text-[9px] text-muted font-light">
                          {isAndroid ? device.device_name : device.browser_name}
                        </p>
                      </div>
                    </div>
                    <div>
                      {device.is_connected ? (
                        <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-muted-light text-muted border border-border uppercase tracking-wider">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Kebiasaan Hari Ini (5 Indikator Grouped) */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-primary mb-4">
              Kebiasaan Hari Ini
            </h3>
            <div className="space-y-3">
              {coreBehaviors.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex gap-3 items-start p-3 rounded-2xl border transition-all ${
                      item.active
                        ? "border-red-100 bg-red-50/20"
                        : "border-border/60 bg-background/20"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        item.active
                          ? item.color
                          : "text-muted bg-muted-light/40 border-border/40"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[11px] font-bold text-primary truncate">
                          {item.name}
                        </h4>
                        {item.active ? (
                          <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0 uppercase tracking-wider">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 uppercase tracking-wider">
                            Aman
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted font-light leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Weekly Insight Snippet Card (Bottom card in style of reference image) */}
          {latestInsight && (
            <div className="bg-primary text-white border border-secondary rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-40 relative overflow-hidden">
              {/* background abstract light glow */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-accent/15 rounded-full blur-xl" />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                  <Compass className="w-4.5 h-4.5 text-accent animate-pulse" />
                  <span>AI Insight Terbaru</span>
                </div>
                <p className="text-[11px] font-light leading-relaxed opacity-90 text-white/90">
                  "{latestInsight.ai_positive_notes} Namun,{" "}
                  {latestInsight.ai_concern_notes.toLowerCase()}"
                </p>
              </div>

              <Link
                href="/insight"
                className="w-full py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-accent hover:text-primary transition-all text-center relative z-10 cursor-pointer"
              >
                Baca Laporan Mingguan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
