"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  CheckCircle,
  Clock,
  Compass,
  CornerDownRight,
  Eye,
  Info,
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
  initialUsers,
  initialApps,
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

export default function DashboardPage() {
  const user = initialUsers[0];
  const todayStr = "Rabu, 4 Juni 2026"; // Explicit date aligned with sitemap greeting

  // 1. Calculate stats from daily_stats
  const totalDurationSeconds = initialDailyStats.reduce(
    (acc, curr) => acc + curr.total_duration_seconds,
    0
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
  let statusColor = "border-emerald-100 bg-emerald-50 text-emerald-800";

  if (scoreData) {
    if (scoreData.total_score >= 40 && scoreData.total_score <= 69) {
      statusEmoji = "😐";
      statusTitle = "Perlu Diperhatikan";
      statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      statusColor = "border-amber-100 bg-amber-50 text-amber-800";
    } else if (scoreData.total_score >= 70) {
      statusEmoji = "😟";
      statusTitle = "Hari yang Berat";
      statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      statusColor = "border-red-100 bg-red-50 text-red-800";
    }
  }

  // 3. Hourly Activity logs mapping
  // Map activity logs to 24 hours structure for Recharts stacked bar
  const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = String(i).padStart(2, "0") + ".00";
    const dataObj: any = { jam: hourLabel };
    for (const app of initialApps) {
      dataObj[app.name] = 0;
    }
    return dataObj;
  });

  for (const log of initialActivityLogs) {
    // extract hour from log.started_at (format "2026-06-03T08:15:00Z" or similar)
    const timePart = log.started_at.split("T")[1];
    if (timePart) {
      const startHour = parseInt(timePart.split(":")[0]);
      const app = initialApps.find((a) => a.id === log.app_id);
      if (app && startHour >= 0 && startHour < 24) {
        hourlyChartData[startHour][app.name] += Math.round(
          log.duration_seconds / 60
        );
      }
    }
  }

  // Filter out completely empty hours to keep the chart clean, but show standard day hours
  const filteredChartData = hourlyChartData.filter((d) => {
    const sum = initialApps.reduce((acc, app) => acc + d[app.name], 0);
    // Keep active hours or key indicators
    const hourNum = parseInt(d.jam.split(".")[0]);
    return sum > 0 || (hourNum >= 8 && hourNum <= 22 && hourNum % 2 === 0);
  });

  // 4. Detailed detected behaviors
  const flagsList = [];
  if (scoreData) {
    if (scoreData.flag_excessive_usage) {
      flagsList.push({
        id: "excessive",
        name: "Terlalu lama main HP",
        desc: `Sudah ${totalHours} jam ${totalMinutes} menit hari ini`,
        icon: Clock,
        iconColor: "text-red-500 bg-red-50",
      });
    }
    if (scoreData.flag_compulsive_checking) {
      const totalChecks = initialDailyStats.reduce(
        (acc, curr) => acc + curr.open_frequency,
        0
      );
      flagsList.push({
        id: "compulsive",
        name: "Sering buka-tutup aplikasi",
        desc: `Dibuka ${totalChecks} kali hari ini`,
        icon: RotateCcw,
        iconColor: "text-amber-500 bg-amber-50",
      });
    }
    if (scoreData.flag_midnight_usage) {
      const midnightSec = initialDailyStats.reduce(
        (acc, curr) => acc + curr.midnight_duration_seconds,
        0
      );
      flagsList.push({
        id: "midnight",
        name: "Main HP waktu harusnya tidur",
        desc: `${Math.round(midnightSec / 60)} menit terdeteksi di jam tidur`,
        icon: Moon,
        iconColor: "text-indigo-500 bg-indigo-50",
      });
    }
    if (scoreData.flag_continuous_usage) {
      const maxCont = Math.max(
        ...initialDailyStats.map((d) => d.max_continuous_seconds)
      );
      flagsList.push({
        id: "continuous",
        name: "Nonstop tanpa istirahat",
        desc: `Sesi terpanjang ${Math.round(maxCont / 60)} menit tanpa jeda`,
        icon: Activity,
        iconColor: "text-orange-500 bg-orange-50",
      });
    }
    if (scoreData.flag_productive_hour_distraction) {
      const prodSec = initialDailyStats.reduce(
        (acc, curr) => acc + curr.productive_hour_duration_seconds,
        0
      );
      flagsList.push({
        id: "productive",
        name: "Main HP saat jam belajar/kerja",
        desc: `${Math.round(prodSec / 60)} menit terdeteksi di jam produktif`,
        icon: Briefcase,
        iconColor: "text-pink-500 bg-pink-50",
      });
    }
  }

  // 5. Weekly AI insight snippet
  const latestInsight = initialWeeklyInsights[0];

  return (
    <div className="space-y-6 font-poppins">
      {/* Navbar Atas */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 bg-background">
        <div className="flex items-baseline gap-0.5">
          <span className="font-yellowtail text-3xl font-normal text-primary">Fomo</span>
          <span className="font-poppins text-[10px] font-bold tracking-widest text-primary uppercase">
            Tracker
          </span>
        </div>
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl border border-border bg-card text-primary hover:bg-muted-light transition-all cursor-pointer shadow-xs"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-card rounded-full" />
        </Link>
      </div>

      {/* Sapaan & Tanggal */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Halo, {user?.name || "Budi"}!
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">{todayStr}</p>
      </div>

      {/* Status Hari Ini (Elemen Utama Tampil Paling Besar) */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xs transition-all ${statusColor}`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl md:text-6xl shrink-0 select-none">{statusEmoji}</span>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black tracking-tight leading-none">{statusTitle}</h2>
            <p className="text-sm font-light leading-relaxed max-w-xl">{statusDesc}</p>
          </div>
        </div>
      </div>

      {/* Ringkasan Singkat */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Ringkasan Hari Ini</h3>
        <p className="text-sm text-primary font-normal leading-relaxed">
          Kamu sudah menggunakan media sosial selama{" "}
          <strong className="font-bold">{totalHours} jam {totalMinutes} menit</strong> hari ini.{" "}
          <strong className="font-bold">{topApp.name}</strong> paling banyak kamu buka.{" "}
          {flagsList.length > 0 ? (
            <span>Terdeteksi <strong className="font-bold">{flagsList.length} kebiasaan bermasalah</strong> yang memerlukan perhatianmu.</span>
          ) : (
            <span>Belum ada kebiasaan bermasalah terdeteksi. Pertahankan!</span>
          )}
        </p>
      </div>

      {/* Grid: Chart + Detected Behaviors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-extrabold text-base text-primary">Penggunaan per Jam Hari Ini</h3>
            <p className="text-xs text-muted font-light mt-0.5">Stacked bar chart durasi penggunaan (menit)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="jam" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
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

        {/* Detected Behaviors (1 col) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col">
          <h3 className="font-extrabold text-base text-primary mb-4">Kebiasaan Hari Ini</h3>
          
          {flagsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                ✓
              </div>
              <p className="text-xs text-muted font-bold font-poppins">
                Tidak ada kebiasaan bermasalah hari ini!
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {flagsList.map((flag) => {
                const IconComponent = flag.icon;
                return (
                  <div
                    key={flag.id}
                    className="flex gap-3 items-start p-3 rounded-2xl border border-border bg-background/50 hover:bg-muted-light/10 transition-all"
                  >
                    <div className={`w-8 h-8 rounded-xl ${flag.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-primary">{flag.name}</h4>
                      <p className="text-[10px] text-muted font-light leading-normal">{flag.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cuplikan Insight Terakhir */}
      {latestInsight && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-accent">
                AI Insight Minggu Ini ({latestInsight.week_start} – {latestInsight.week_end})
              </span>
            </div>
            <p className="text-xs font-light leading-relaxed leading-normal text-white/90">
              "{latestInsight.ai_positive_notes} Namun, {latestInsight.ai_concern_notes.toLowerCase()}"
            </p>
          </div>
          <Link
            href="/insight"
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-accent hover:text-primary transition-all shrink-0 cursor-pointer self-start md:self-center"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
