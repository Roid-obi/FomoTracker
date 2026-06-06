"use client";

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
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
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

export default function DashboardPage() {
  const user = initialUsers[0];
  const [todayStr, setTodayStr] = useState("");

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
              {/* Badge for Current Date */}
              {/* {todayStr && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold tracking-wide border border-secondary/10 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  {todayStr}
                </div>
              )} */}
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-primary leading-tight">
                Halo, {user?.name || "Budi"}!
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

            {/* Premium Flat Vector SVG Illustration of Connected Gadgets */}
            <div className="w-56 h-40 shrink-0 relative z-10 hidden sm:block">
              <svg
                viewBox="0 0 220 150"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  {/* Laptop Screen Gradient */}
                  <linearGradient
                    id="laptopScreen"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#0a2a4a" />
                    <stop offset="100%" stopColor="#021426" />
                  </linearGradient>

                  {/* Tablet Screen Gradient */}
                  <linearGradient
                    id="tabletScreen"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#113a5d" />
                    <stop offset="100%" stopColor="#0b233a" />
                  </linearGradient>

                  {/* Phone Screen Gradient */}
                  <linearGradient
                    id="phoneScreen"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Glow Radial Gradient */}
                  <radialGradient id="glowAccent" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c4ffdd" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c4ffdd" stopOpacity="0" />
                  </radialGradient>

                  {/* Chart Gradient */}
                  <linearGradient
                    id="chartAreaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#c4ffdd" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c4ffdd" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Desk/Surface Line */}
                <line
                  x1="15"
                  y1="135"
                  x2="205"
                  y2="135"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Ambient Glow in background */}
                <circle
                  cx="110"
                  cy="80"
                  r="50"
                  fill="url(#glowAccent)"
                  className="animate-pulse"
                />

                {/* Connected synchronization wave arcs */}
                <path
                  d="M45,95 Q110,65 175,90"
                  stroke="#a2f2c2"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M38,82 Q110,40 182,78"
                  stroke="#506e86"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  fill="none"
                  opacity="0.3"
                />

                {/* 1. LAPTOP (Center) */}
                <g>
                  {/* Screen Bezel */}
                  <rect
                    x="60"
                    y="55"
                    width="100"
                    height="66"
                    rx="6"
                    fill="#1e293b"
                  />
                  {/* Screen Inner Display */}
                  <rect
                    x="64"
                    y="59"
                    width="92"
                    height="54"
                    rx="3"
                    fill="url(#laptopScreen)"
                  />

                  {/* Laptop Dashboard UI */}
                  {/* Grid Lines */}
                  <line
                    x1="68"
                    y1="75"
                    x2="152"
                    y2="75"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    opacity="0.1"
                  />
                  <line
                    x1="68"
                    y1="90"
                    x2="152"
                    y2="90"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    opacity="0.1"
                  />
                  <line
                    x1="68"
                    y1="102"
                    x2="152"
                    y2="102"
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    opacity="0.1"
                  />

                  {/* Charts */}
                  <path
                    d="M68,102 L80,92 L92,96 L104,80 L116,88 L128,70 L140,82 L152,65"
                    fill="none"
                    stroke="#c4ffdd"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M68,102 L80,92 L92,96 L104,80 L116,88 L128,70 L140,82 L152,65 L152,110 L68,110 Z"
                    fill="url(#chartAreaGradient)"
                  />

                  {/* Small UI Details on Screen */}
                  <circle cx="70" cy="65" r="2" fill="#c4ffdd" />
                  <rect
                    x="76"
                    y="64"
                    width="20"
                    height="2"
                    rx="1"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                  <circle cx="148" cy="65" r="2" fill="#60a5fa" />

                  {/* Base / Keyboard Part */}
                  {/* Hinge */}
                  <rect x="90" y="120" width="40" height="3" fill="#0f172a" />
                  {/* Keyboard Base */}
                  <path
                    d="M50,121 L170,121 L164,127 L56,127 Z"
                    fill="#cbd5e1"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                  {/* Base Profile Shadow */}
                  <path
                    d="M56,127 L164,127 L160,130 L60,130 Z"
                    fill="#94a3b8"
                  />
                  {/* Trackpad */}
                  <rect
                    x="100"
                    y="122"
                    width="20"
                    height="3"
                    rx="1"
                    fill="#94a3b8"
                    opacity="0.6"
                  />
                </g>

                {/* 2. TABLET (Left side, slightly rotated) */}
                <g transform="rotate(-6 35 105)">
                  {/* Tablet Body */}
                  <rect
                    x="15"
                    y="72"
                    width="42"
                    height="58"
                    rx="5"
                    fill="#475569"
                    stroke="#334155"
                    strokeWidth="0.5"
                  />
                  {/* Inner Screen */}
                  <rect
                    x="18"
                    y="75"
                    width="36"
                    height="52"
                    rx="3.5"
                    fill="url(#tabletScreen)"
                  />
                  {/* Progress Ring Chart */}
                  <circle
                    cx="36"
                    cy="98"
                    r="11"
                    stroke="#ffffff"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.15"
                  />
                  <circle
                    cx="36"
                    cy="98"
                    r="11"
                    stroke="#c4ffdd"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="69.1"
                    strokeDashoffset="22"
                    strokeLinecap="round"
                  />
                  <circle cx="36" cy="98" r="5" fill="#ffffff" opacity="0.1" />
                  {/* UI Lines */}
                  <rect
                    x="24"
                    y="115"
                    width="24"
                    height="2"
                    rx="1"
                    fill="#ffffff"
                    opacity="0.7"
                  />
                  <rect
                    x="28"
                    y="120"
                    width="16"
                    height="1.5"
                    rx="0.75"
                    fill="#a2f2c2"
                    opacity="0.9"
                  />
                  {/* Camera Dot */}
                  <circle cx="36" cy="73.5" r="0.75" fill="#1e293b" />
                </g>

                {/* 3. SMARTPHONE (Right side, on a stand, slightly rotated) */}
                <g transform="rotate(5 185 95)">
                  {/* Mobile Stand */}
                  <path
                    d="M176,132 L194,132 L190,118 L180,118 Z"
                    fill="#334155"
                  />
                  {/* Phone Body */}
                  <rect
                    x="170"
                    y="68"
                    width="30"
                    height="56"
                    rx="6"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="0.5"
                  />
                  {/* Inner Screen */}
                  <rect
                    x="173"
                    y="71"
                    width="24"
                    height="50"
                    rx="4.5"
                    fill="url(#phoneScreen)"
                  />
                  {/* Top Notch */}
                  <rect
                    x="181"
                    y="71"
                    width="8"
                    height="2"
                    rx="1"
                    fill="#0f172a"
                  />
                  {/* Notification/App UI Card */}
                  <rect
                    x="176"
                    y="78"
                    width="18"
                    height="8"
                    rx="2"
                    fill="#c4ffdd"
                  />
                  <rect
                    x="179"
                    y="81"
                    width="10"
                    height="2"
                    rx="0.5"
                    fill="#062743"
                  />

                  <rect
                    x="176"
                    y="88"
                    width="18"
                    height="8"
                    rx="2"
                    fill="#ffffff"
                    opacity="0.9"
                  />
                  <rect
                    x="179"
                    y="91"
                    width="12"
                    height="2"
                    rx="0.5"
                    fill="#062743"
                    opacity="0.7"
                  />

                  <rect
                    x="176"
                    y="98"
                    width="18"
                    height="8"
                    rx="2"
                    fill="#113a5d"
                  />
                  <rect
                    x="179"
                    y="101"
                    width="8"
                    height="2"
                    rx="0.5"
                    fill="#c4ffdd"
                  />

                  {/* Home indicator */}
                  <rect
                    x="182"
                    y="117"
                    width="6"
                    height="1"
                    rx="0.5"
                    fill="#ffffff"
                    opacity="0.6"
                  />
                </g>

                {/* 4. SMARTWATCH (Front Center-Left) */}
                <g>
                  {/* Straps */}
                  <rect
                    x="83"
                    y="131"
                    width="14"
                    height="4"
                    rx="1"
                    fill="#334155"
                  />
                  {/* Watch Case */}
                  <rect
                    x="86"
                    y="128"
                    width="8"
                    height="9"
                    rx="2"
                    fill="#475569"
                    stroke="#94a3b8"
                    strokeWidth="0.5"
                  />
                  {/* Dial */}
                  <circle cx="90" cy="132.5" r="3.5" fill="#0a2a4a" />
                  {/* Glow dot */}
                  <circle
                    cx="90"
                    cy="132.5"
                    r="1"
                    fill="#c4ffdd"
                    className="animate-pulse"
                  />
                </g>

                {/* 5. WIRELESS HEADPHONES (Front Right, resting on desk) */}
                <g>
                  {/* Left Ear Pad */}
                  <rect
                    x="142"
                    y="123"
                    width="3"
                    height="7"
                    rx="1.5"
                    fill="#334155"
                  />
                  {/* Right Ear Pad */}
                  <rect
                    x="151"
                    y="123"
                    width="3"
                    height="7"
                    rx="1.5"
                    fill="#334155"
                  />
                  {/* headband */}
                  <path
                    d="M143.5,124 C143.5,119 149.5,119 149.5,124"
                    stroke="#475569"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* 6. FLOATING WIDGET 1 (Top Left) */}
                <g className="animate-float-slow">
                  <rect
                    x="20"
                    y="22"
                    width="28"
                    height="16"
                    rx="4"
                    fill="#ffffff"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))"
                  />
                  <circle cx="27" cy="30" r="3" fill="#c4ffdd" />
                  {/* Heartbeat pulse path */}
                  <path
                    d="M25,30 L26.5,30 L27,28 L27.5,32 L28,30 L29.5,30"
                    fill="none"
                    stroke="#062743"
                    strokeWidth="0.75"
                  />
                  <rect
                    x="33"
                    y="29"
                    width="10"
                    height="2"
                    rx="0.5"
                    fill="#506e86"
                  />
                </g>

                {/* 7. FLOATING WIDGET 2 (Top Right) */}
                <g className="animate-float-medium">
                  <rect
                    x="175"
                    y="18"
                    width="30"
                    height="16"
                    rx="4"
                    fill="#062743"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                  />
                  {/* Notification Bell shape */}
                  <path
                    d="M182,28 C182,26.5 183.5,26.5 183.5,28 L183.5,29.5 L180.5,29.5 L180.5,28 Z"
                    fill="#c4ffdd"
                  />
                  <circle cx="182.5" cy="30.5" r="0.75" fill="#c4ffdd" />
                  <rect
                    x="188"
                    y="26"
                    width="12"
                    height="1.5"
                    rx="0.5"
                    fill="#ffffff"
                  />
                  <rect
                    x="188"
                    y="29"
                    width="8"
                    height="1"
                    rx="0.5"
                    fill="#ffffff"
                    opacity="0.6"
                  />
                </g>

                {/* Sparkles / Syncing dots */}
                <circle
                  cx="110"
                  cy="50"
                  r="2.5"
                  fill="#c4ffdd"
                  className="animate-pulse"
                />
                <circle
                  cx="58"
                  cy="85"
                  r="1.5"
                  fill="#c4ffdd"
                  className="animate-pulse"
                />
                <circle
                  cx="162"
                  cy="88"
                  r="2"
                  fill="#a2f2c2"
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
