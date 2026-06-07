"use client";

import {
  Activity,
  ArrowRight,
  Briefcase,
  Clock,
  Compass,
  Laptop,
  Moon,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  initialActivityLogs,
  initialApps,
  initialBehavioralScores,
  initialDailyStats,
  initialUserDevices,
  initialUsers,
  initialWeeklyInsights,
} from "@/lib/data/databaseInitialData";

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

export default function DashboardPage() {
  const user = initialUsers[0];
  const [_todayStr, setTodayStr] = useState("");

  useEffect(() => {
    const formatIndonesianDate = () => {
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
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      return `${dayName}, ${date} ${monthName} ${year}`;
    };
    setTodayStr(formatIndonesianDate());
  }, []);

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
  let _statusTextColor = "text-emerald-700";

  if (scoreData) {
    if (scoreData.total_score >= 40 && scoreData.total_score <= 69) {
      statusEmoji = "😐";
      statusTitle = "Perlu Diperhatikan";
      statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      statusCardBg = "bg-amber-50 border-amber-200 text-amber-800";
      _statusTextColor = "text-amber-700";
    } else if (scoreData.total_score >= 70) {
      statusEmoji = "😟";
      statusTitle = "Hari yang Berat";
      statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      statusCardBg = "bg-red-50 border-red-200 text-red-800";
      _statusTextColor = "text-red-600";
    }
  }

  // 3. Hourly Activity logs mapping
  const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = `${String(i).padStart(2, "0")}.00`;
    const dataObj: Record<string, string | number> = { jam: hourLabel };
    for (const app of initialApps) {
      dataObj[app.name] = 0;
    }
    return dataObj;
  });

  for (const log of initialActivityLogs) {
    const timePart = log.started_at.split("T")[1];
    if (timePart) {
      const startHour = parseInt(timePart.split(":")[0], 10);
      const app = initialApps.find((a) => a.id === log.app_id);
      if (app && startHour >= 0 && startHour < 24) {
        const currentVal =
          (hourlyChartData[startHour][app.name] as number) || 0;
        hourlyChartData[startHour][app.name] =
          currentVal + Math.round(log.duration_seconds / 60);
      }
    }
  }

  // Inject dummy data to show bars with 2 or more applications in the same hour
  if (hourlyChartData[8]) {
    hourlyChartData[8].WhatsApp =
      ((hourlyChartData[8].WhatsApp as number) || 0) + 10;
    hourlyChartData[8].TikTok =
      ((hourlyChartData[8].TikTok as number) || 0) + 5;
  }
  if (hourlyChartData[14]) {
    hourlyChartData[14].Instagram =
      ((hourlyChartData[14].Instagram as number) || 0) + 20;
    hourlyChartData[14].TikTok =
      ((hourlyChartData[14].TikTok as number) || 0) + 15;
    hourlyChartData[14].YouTube =
      ((hourlyChartData[14].YouTube as number) || 0) + 10;
  }
  if (hourlyChartData[20]) {
    hourlyChartData[20].TikTok =
      ((hourlyChartData[20].TikTok as number) || 0) + 25;
    hourlyChartData[20].YouTube =
      ((hourlyChartData[20].YouTube as number) || 0) + 20;
    hourlyChartData[20].WhatsApp =
      ((hourlyChartData[20].WhatsApp as number) || 0) + 15;
  }

  // 3b. Calculate top used apps dynamically today
  const appTotals: Record<string, number> = {};
  for (const app of initialApps) {
    appTotals[app.name] = 0;
  }
  for (const hourData of hourlyChartData) {
    for (const app of initialApps) {
      appTotals[app.name] += (hourData[app.name] as number) || 0;
    }
  }

  const sortedApps = Object.entries(appTotals).sort((a, b) => b[1] - a[1]);

  const top4Apps = sortedApps.slice(0, 4).map((entry) => entry[0]);
  const otherApps = sortedApps.slice(4).map((entry) => entry[0]);

  const rankedChartData = hourlyChartData.map((hourData) => {
    const newRow: Record<string, string | number> = { jam: hourData.jam };

    // Copy Top 4 apps
    for (const app of top4Apps) {
      newRow[app] = hourData[app] || 0;
    }

    // Sum other apps into "Lainnya"
    let otherSum = 0;
    for (const app of otherApps) {
      otherSum += (hourData[app] as number) || 0;
    }
    newRow.Lainnya = otherSum;

    return newRow;
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
              {/* Badge for Current Date */}
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

            {/* Premium Flat Vector SVG Illustration of Digital Wellbeing & Gadgets */}
            <div className="w-56 h-40 shrink-0 relative z-10 hidden sm:block">
              <svg
                viewBox="0 0 220 150"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  {/* Soothing Sunset Screen Gradient */}
                  <linearGradient
                    id="wellbeingScreen"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>

                  {/* Leaf Green Gradient */}
                  <linearGradient
                    id="leafGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#a7f3d0" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  {/* Sun Rise Glow Gradient */}
                  <linearGradient
                    id="sunGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>

                  {/* Tea Cup Gradient */}
                  <linearGradient
                    id="cupGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>

                  {/* Glow Radial Gradient */}
                  <radialGradient id="glowAccent" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c4ffdd" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c4ffdd" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Desk/Surface Line */}
                <line
                  x1="15"
                  y1="130"
                  x2="205"
                  y2="130"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Ambient Wellbeing Glow */}
                <circle
                  cx="110"
                  cy="75"
                  r="45"
                  fill="url(#glowAccent)"
                  className="animate-pulse"
                />

                {/* Mindfulness Wave Arcs */}
                <path
                  d="M30,85 C70,60 140,60 190,85"
                  stroke="#4ade80"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  fill="none"
                  opacity="0.35"
                />
                <path
                  d="M45,95 Q110,75 175,95"
                  stroke="#a2f2c2"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  fill="none"
                  opacity="0.5"
                />

                {/* 1. OFF-LINE READING: Open Book (Center-Left Base) */}
                <g>
                  {/* Book Pages */}
                  <path
                    d="M58,122 C70,119 86,123 86,123 L86,127 C86,127 70,123 58,126 Z"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M114,122 C102,119 86,123 86,123 L86,127 C86,127 102,123 114,126 Z"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                  />
                  {/* Book Cover */}
                  <path
                    d="M56,123 Q86,120 116,123"
                    stroke="#475569"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>

                {/* 2. NATURE: Left Potted Plant (Monstera-style Wellbeing plant) */}
                <g>
                  {/* Pot */}
                  <rect
                    x="22"
                    y="102"
                    width="18"
                    height="20"
                    rx="2"
                    fill="#f8fafc"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                  />
                  <ellipse cx="31" cy="102" rx="8" ry="1.5" fill="#78350f" />
                  {/* Stems & Leaves */}
                  <path
                    d="M31,102 Q26,85 16,80"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M16,80 C8,75 4,86 12,90 C16,92 18,84 16,80 Z"
                    fill="url(#leafGrad)"
                  />

                  <path
                    d="M31,102 Q35,78 45,77"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M45,77 C53,72 58,83 50,87 C46,89 44,81 45,77 Z"
                    fill="url(#leafGrad)"
                  />

                  <path
                    d="M31,102 Q28,68 24,60"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M24,60 C16,56 12,66 20,70 C24,72 26,64 24,60 Z"
                    fill="url(#leafGrad)"
                  />
                </g>

                {/* 3. LAPTOP (Mindful sunset screen & dashboard stats) */}
                <g>
                  {/* Screen Bezel */}
                  <rect
                    x="65"
                    y="52"
                    width="90"
                    height="60"
                    rx="5"
                    fill="#1e293b"
                  />
                  {/* Screen Inner Display */}
                  <rect
                    x="69"
                    y="56"
                    width="82"
                    height="48"
                    rx="2"
                    fill="url(#wellbeingScreen)"
                  />

                  {/* Sunset scenery inside screen */}
                  <circle cx="110" cy="84" r="13" fill="url(#sunGrad)" />
                  {/* Peaceful Hills */}
                  <path
                    d="M69,96 Q90,82 120,104 L69,104 Z"
                    fill="#0f172a"
                    opacity="0.6"
                  />
                  <path
                    d="M100,104 Q125,86 151,96 L151,104 Z"
                    fill="#0d9488"
                    opacity="0.5"
                  />

                  {/* Safe check icon on screen */}
                  <circle cx="77" cy="64" r="3.5" fill="#10b981" />
                  <path
                    d="M75,64 L76.5,65.5 L79,62.5"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <rect
                    x="83"
                    y="62.5"
                    width="20"
                    height="3"
                    rx="1"
                    fill="#ffffff"
                    opacity="0.9"
                  />

                  {/* Base / Keyboard */}
                  <rect x="95" y="112" width="30" height="2" fill="#0f172a" />
                  <path
                    d="M55,114 L165,114 L160,119 L60,119 Z"
                    fill="#cbd5e1"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                  {/* Base Profile Shadow */}
                  <path
                    d="M60,119 L160,119 L156,122 L64,122 Z"
                    fill="#94a3b8"
                  />
                  {/* Trackpad */}
                  <rect
                    x="105"
                    y="115"
                    width="10"
                    height="2"
                    rx="0.5"
                    fill="#94a3b8"
                    opacity="0.6"
                  />
                </g>

                {/* 4. SELF-CARE: Steaming Tea/Coffee Mug (Right Base) */}
                <g>
                  {/* Saucer */}
                  <ellipse cx="180" cy="125" rx="12" ry="2" fill="#cbd5e1" />
                  {/* Mug Body */}
                  <path
                    d="M171,111 L189,111 L186,123 C185,125 175,125 174,123 Z"
                    fill="url(#cupGrad)"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                  {/* Mug Handle */}
                  <path
                    d="M189,114 C193,114 193,120 189,120"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  {/* Steam Waves */}
                  <path
                    d="M176,105 Q174,100 178,95"
                    stroke="#94a3b8"
                    strokeWidth="0.75"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  <path
                    d="M182,106 Q180,99 184,93"
                    stroke="#94a3b8"
                    strokeWidth="0.75"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </g>

                {/* 5. SMARTPHONE (Balanced next to the laptop, displaying green heart) */}
                <g transform="rotate(8 152 100)">
                  {/* Phone Body */}
                  <rect
                    x="142"
                    y="82"
                    width="20"
                    height="38"
                    rx="4"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="0.5"
                  />
                  {/* Inner Screen */}
                  <rect
                    x="144"
                    y="84"
                    width="16"
                    height="34"
                    rx="2.5"
                    fill="#0f172a"
                  />
                  {/* Glowing Green Heart */}
                  <path
                    d="M152,94 C152,94 150,92.2 148.5,93.5 C147,94.8 148.5,97 152,99.2 C155.5,97 157,94.8 155.5,93.5 C154,92.2 152,94 152,94 Z"
                    fill="#10b981"
                    className="animate-pulse"
                  />
                  {/* Sleep Moon */}
                  <path
                    d="M150,108 A2,2 0 0,0 154,110 A1.8,1.8 0 0,1 150,108"
                    fill="#fde047"
                  />
                  {/* Home indicator */}
                  <rect
                    x="149"
                    y="115"
                    width="4"
                    height="0.6"
                    rx="0.3"
                    fill="#ffffff"
                    opacity="0.6"
                  />
                </g>

                {/* 6. SMARTWATCH (Healthy vitals / Green Heart rate on watch face) */}
                <g>
                  {/* Straps */}
                  <rect
                    x="83"
                    y="123"
                    width="14"
                    height="3"
                    rx="0.75"
                    fill="#334155"
                  />
                  {/* Watch Case */}
                  <rect
                    x="86"
                    y="120"
                    width="8"
                    height="9"
                    rx="1.5"
                    fill="#475569"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                  {/* Heartbeat pulse */}
                  <polyline
                    points="87,124.5 88.5,124.5 89,122 90,126 90.5,124.5 92,124.5"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* 7. FLOATING ORGANIC WELLBEING ELEMENTS */}
                {/* Floating Leaf (Top-Right) */}
                <g className="animate-float-slow">
                  <path
                    d="M175,40 C166,37 166,51 178,48 C178,48 181,41 175,40 Z"
                    fill="url(#leafGrad)"
                    opacity="0.85"
                  />
                  <path
                    d="M178,48 Q182,50 185,49"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="0.8"
                  />
                </g>

                {/* Floating Heart (Top-Left) */}
                <g className="animate-float-medium">
                  <path
                    d="M42,43 C42,43 39.5,40.5 38,41.8 C36.5,43 38,45.2 42,47.5 C46,45.2 47.5,43 46,41.8 C44.5,40.5 42,43 42,43 Z"
                    fill="#fca5a5"
                  />
                </g>

                {/* Floating Sparkles & Healthy Sleep Stars */}
                <g className="animate-pulse">
                  {/* Sparkle 1 */}
                  <path
                    d="M102,34 L103.5,37 L106.5,38 L103.5,39 L102,42 L100.5,39 L97.5,38 L100.5,37 Z"
                    fill="#fde047"
                  />
                  {/* Sparkle 2 */}
                  <path
                    d="M135,26 L136,28.5 L138.5,29 L136,29.5 L135,32 L134,29.5 L131.5,29 L134,28.5 Z"
                    fill="#fde047"
                    opacity="0.8"
                  />
                  {/* Little Star near Phone */}
                  <circle cx="160" cy="74" r="1" fill="#fde047" />
                </g>
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
                  Status & Skor hari ini
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
                  Screen Time hari ini
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
                  Tersering hari ini
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-primary">
                  Penggunaan per Jam Hari Ini
                </h3>
                <p className="text-xs text-muted font-light mt-0.5">
                  Menampilkan akumulasi durasi penggunaan gawai per jam hari
                  ini.
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#fff0f3] border  border-pink-300 block" />
                  <span>🌙 Jam Tidur</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#fffbeb] border border-amber-300 block" />
                  <span>💼 Jam Produktif</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
              <div className="h-64 min-w-[700px] lg:min-w-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rankedChartData}
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
                      domain={[0, 120]}
                    />
                    {/* Highlight areas behind the bars */}
                    <ReferenceArea
                      x1="22.00"
                      x2="23.00"
                      fill="#fff0f3"
                      fillOpacity={0.75}
                      stroke="none"
                    />
                    <ReferenceArea
                      x1="00.00"
                      x2="06.00"
                      fill="#fff0f3"
                      fillOpacity={0.75}
                      stroke="none"
                    />
                    <ReferenceArea
                      x1="08.00"
                      x2="17.00"
                      fill="#fffbeb"
                      fillOpacity={0.75}
                      stroke="none"
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
                      // biome-ignore lint/suspicious/noExplicitAny: needed for Recharts dynamic Tooltip formatter types
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
                  "{latestInsight.ai_positive_notes} Namun, {latestInsight.ai_concern_notes.toLowerCase()}"
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
