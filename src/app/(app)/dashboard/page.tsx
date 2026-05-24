"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  Clock,
  Flame,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock Data for Hourly Usage (Bar Chart)
const hourlyData = [
  { jam: "08:00", Instagram: 10, TikTok: 5, YouTube: 0, WhatsApp: 15 },
  { jam: "10:00", Instagram: 5, TikTok: 15, YouTube: 10, WhatsApp: 20 },
  { jam: "12:00", Instagram: 25, TikTok: 20, YouTube: 15, WhatsApp: 10 },
  { jam: "14:00", Instagram: 15, TikTok: 10, YouTube: 0, WhatsApp: 25 },
  { jam: "16:00", Instagram: 30, TikTok: 35, YouTube: 20, WhatsApp: 15 },
  { jam: "18:00", Instagram: 20, TikTok: 15, YouTube: 45, WhatsApp: 10 },
  { jam: "20:00", Instagram: 40, TikTok: 50, YouTube: 30, WhatsApp: 20 },
  { jam: "22:00", Instagram: 15, TikTok: 25, YouTube: 10, WhatsApp: 5 },
];

// Mock Indicators
const behavioralFlags = [
  {
    name: "Excessive Usage",
    desc: "Melebihi 4 jam penggunaan",
    active: true,
    variant: "danger",
  },
  {
    name: "Compulsive Checking",
    desc: "Membuka HP > 15 kali/jam",
    active: true,
    variant: "warning",
  },
  {
    name: "Midnight Usage",
    desc: "Aktif di jam tidur",
    active: true,
    variant: "danger",
  },
  {
    name: "Continuous Usage",
    desc: "Aktif > 30 mnt tanpa jeda",
    active: false,
    variant: "info",
  },
  {
    name: "Distraction Tendency",
    desc: "Membuka sosmed di jam kerja",
    active: true,
    variant: "warning",
  },
];

export default function DashboardPage() {
  const today = "Sabtu, 23 Mei 2026";
  const userName = "Roid";

  return (
    <div className="space-y-6 font-poppins">
      {/* Upper header area: greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Selamat pagi, {userName}!
          </h1>
          <p className="text-sm text-muted font-light mt-1">{today}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-primary">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Status Sistem Aktif</span>
        </div>
      </div>

      {/* Summary cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Screen Time */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted tracking-wider uppercase">
              Screen Time
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              4j 15m
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>12% dari kemarin</span>
            </p>
          </div>
        </div>

        {/* Card 2: Most Used App */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted tracking-wider uppercase">
              Tersering
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              TikTok
            </h3>
            <p className="text-[10px] text-muted font-light mt-1">
              Durasi: 1j 45m hari ini
            </p>
          </div>
        </div>

        {/* Card 3: Behavioral Score */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted tracking-wider uppercase">
              Skor Perilaku
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-primary">
              68/100
            </h3>
            <p className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Butuh sedikit perbaikan</span>
            </p>
          </div>
        </div>

        {/* Card 4: Risk Level Badge */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted tracking-wider uppercase">
              Tingkat Risiko
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
              Moderate
            </span>
            <p className="text-[10px] text-muted font-light mt-2.5">
              Kontributor: Midnight Usage
            </p>
          </div>
        </div>
      </div>

      {/* Main dashboard widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Hourly Activity Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-primary">
                  Aktivitas Hari Ini
                </h3>
                <p className="text-xs text-muted font-light mt-0.5">
                  Penggunaan layar per jam dalam satuan menit
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted-light text-primary">
                Per Aplikasi
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
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
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  />
                  <Bar
                    dataKey="Instagram"
                    stackId="a"
                    fill="#062743"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="TikTok"
                    stackId="a"
                    fill="#113a5d"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="WhatsApp"
                    stackId="a"
                    fill="#c4ffdd"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="YouTube"
                    stackId="a"
                    fill="#e6eef4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insight Snippet Widget */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-xs font-semibold tracking-wider uppercase text-accent">
                  AI Insight Terbaru
                </span>
              </div>
              <p className="text-sm font-light leading-relaxed font-poppins">
                "Penggunaan TikTok meningkat 35% setelah jam 20:00. Disarankan
                untuk memasang Focus Reminder atau mengaktifkan mode henti malam
                guna menjaga kestabilan tidur Anda."
              </p>
            </div>
            <Link
              href="/insight/latest"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white text-primary text-xs font-semibold hover:bg-accent transition-all shrink-0 cursor-pointer self-start sm:self-center"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 1 col: Indicators & Quick Stats & Notifications */}
        <div className="space-y-6">
          {/* Indicators list */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-base text-primary mb-4">
              Indikator Perilaku
            </h3>
            <div className="space-y-3">
              {behavioralFlags.map((flag) => (
                <div
                  key={flag.name}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    flag.active
                      ? "border-amber-100 bg-amber-50/40"
                      : "border-border bg-card opacity-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-primary">
                      {flag.name}
                    </span>
                    <p className="text-[10px] text-muted font-light">
                      {flag.desc}
                    </p>
                  </div>
                  {flag.active ? (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 uppercase">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted-light text-muted uppercase">
                      Aman
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-base text-primary mb-4">
              Quick Stats Minggu Ini
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs text-muted font-light">
                  Rata-rata Screen Time
                </span>
                <span className="text-sm font-bold text-primary">
                  3j 48m / hari
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs text-muted font-light">
                  Trend vs Minggu Lalu
                </span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>Turun 8.5%</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-light">
                  Aplikasi Tersering
                </span>
                <span className="text-sm font-bold text-primary">
                  Instagram (7.2 jam)
                </span>
              </div>
            </div>
          </div>

          {/* Latest Notifications Panel */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-primary">
                Notifikasi Terbaru
              </h3>
              <Link
                href="/notifications"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                <Bell className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-primary">
                    Midnight Usage Terdeteksi
                  </p>
                  <p className="text-[10px] text-muted leading-tight font-light">
                    Anda membuka Instagram pada jam 23.45 tadi malam.
                  </p>
                  <span className="text-[9px] text-muted block mt-1">
                    10 jam yang lalu
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-primary">
                    Peringatan Screen Time
                  </p>
                  <p className="text-[10px] text-muted leading-tight font-light">
                    TikTok hari ini telah dibuka selama lebih dari 1.5 jam.
                  </p>
                  <span className="text-[9px] text-muted block mt-1">
                    12 jam yang lalu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
