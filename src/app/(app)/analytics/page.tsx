"use client";

import {
  AlertTriangle,
  BarChart2,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
type TabType = "overview" | "behavior" | "weekly";

// Colors for Pie Chart
const COLORS = ["#062743", "#113a5d", "#c4ffdd", "#e6eef4", "#888888"];

// Mock Data
const overviewScreenTime = [
  { name: "TikTok", menit: 105 },
  { name: "Instagram", menit: 85 },
  { name: "YouTube", menit: 55 },
  { name: "WhatsApp", menit: 45 },
  { name: "Lainnya", menit: 25 },
];

const dailyTrend = [
  { day: "Sen", menit: 220 },
  { day: "Sel", menit: 180 },
  { day: "Rab", menit: 240 },
  { day: "Kam", menit: 310 },
  { day: "Jum", menit: 190 },
  { day: "Sab", menit: 255 },
  { day: "Min", menit: 280 },
];

const behaviorRadarData = [
  { subject: "Duration", A: 60, fullMark: 100 },
  { subject: "Frequency", A: 75, fullMark: 100 },
  { subject: "Midnight", A: 50, fullMark: 100 },
  { subject: "Continuous", A: 85, fullMark: 100 },
  { subject: "Productivity", A: 70, fullMark: 100 },
];

const behaviorTrend = [
  { week: "M1", score: 72 },
  { week: "M2", score: 69 },
  { week: "M3", score: 65 },
  { week: "M4", score: 68 },
];

const heatmapHours = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  value:
    i >= 8 && i <= 17
      ? Math.floor(Math.random() * 3) + 2
      : i >= 22 || i <= 5
        ? Math.floor(Math.random() * 5)
        : Math.floor(Math.random() * 2),
}));

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") as TabType;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [timeRange, setTimeRange] = useState("7hari");
  const [mounted, setMounted] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("17 Mei - 23 Mei 2026");

  // Sync state with URL search param
  useEffect(() => {
    if (
      activeTabParam &&
      ["overview", "behavior", "weekly"].includes(activeTabParam)
    ) {
      setActiveTab(activeTabParam);
    } else {
      setActiveTab("overview");
      if (!activeTabParam) {
        router.replace("/analytics?tab=overview");
      }
    }
  }, [activeTabParam, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/analytics?tab=${tab}`);
  };

  const getHeatmapColor = (val: number) => {
    if (val === 0) return "bg-muted-light/20 border border-border/40";
    if (val === 1) return "bg-muted-light border border-border/80";
    if (val === 2) return "bg-secondary/40";
    if (val === 3) return "bg-secondary/70";
    return "bg-primary";
  };

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center text-muted">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Analisis Penggunaan
        </h1>
        <p className="text-sm text-muted font-light mt-1">
          Laporan terperinci mengenai durasi, kebiasaan, tingkat risiko, dan
          perkembangan screen time Anda
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="overflow-x-auto scrollbar-none select-none">
        <div className="inline-flex min-w-max items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-xs">
          {(
            [
              { id: "overview", name: "Overview", icon: BarChart2 },
              { id: "behavior", name: "Behavioral Analysis", icon: Brain },
              { id: "weekly", name: "Weekly Report", icon: Calendar },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-muted-light hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-page-enter">
          {/* Filter Periode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-primary">
                Overview Penggunaan
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Seberapa banyak Anda menggunakan media sosial?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">Periode:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none"
              >
                <option value="hari">Hari ini</option>
                <option value="7hari">7 hari terakhir</option>
                <option value="30hari">30 hari terakhir</option>
              </select>
            </div>
          </div>

          {/* Total Screen Time */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Total Screen Time
              </span>
              <h2 className="text-3xl font-black text-primary">5j 15m</h2>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4" />
                <span>Turun 12% dari kemarin</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted-light/60 text-primary shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Grid layout for Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trend */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
              <h4 className="font-bold text-sm text-primary mb-4">
                Usage Trend
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyTrend}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorMenit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#062743"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#062743"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e1e8ef"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#506e86"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#506e86"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        borderColor: "#e1e8ef",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="menit"
                      stroke="#062743"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMenit)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* App Usage Breakdown */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
              <h4 className="font-bold text-sm text-primary mb-4">
                App Usage Breakdown
              </h4>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewScreenTime}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="menit"
                    >
                      {overviewScreenTime.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        borderColor: "#e1e8ef",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Central Donut Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
                  <span className="text-lg font-black text-primary">
                    5j 15m
                  </span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                {overviewScreenTime.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate font-medium text-primary">
                      {item.name} ({Math.round((item.menit / 315) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Hours Heatmap */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
              <h4 className="font-bold text-sm text-primary mb-2">
                Active Hours Heatmap
              </h4>
              <p className="text-[10px] text-muted font-light mb-4">
                Blok berwarna menunjukkan tingkat keaktifan layar per jam. Warna
                gelap melambangkan durasi tinggi.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {heatmapHours.map((item) => (
                  <div
                    key={item.hour}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl ${getHeatmapColor(item.value)}`}
                    title={`${item.hour}: value ${item.value}`}
                  >
                    <span className="text-[9px] font-bold text-primary">
                      {item.hour.split(":")[0]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-6 text-[9px] text-muted">
                <span>Rendah</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-muted-light/20 border border-border/40" />
                <span className="w-2.5 h-2.5 rounded-sm bg-muted-light" />
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary/40" />
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span>Tinggi</span>
              </div>
            </div>

            {/* Top Used Apps */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-primary mb-4">
                  Top Used Apps
                </h4>
                <div className="space-y-3.5">
                  {[
                    {
                      rank: 1,
                      name: "TikTok",
                      time: "1j 45m",
                      pct: 33,
                      color: "bg-primary",
                    },
                    {
                      rank: 2,
                      name: "Instagram",
                      time: "1j 25m",
                      pct: 27,
                      color: "bg-secondary",
                    },
                    {
                      rank: 3,
                      name: "YouTube",
                      time: "55m",
                      pct: 18,
                      color: "bg-muted",
                    },
                    {
                      rank: 4,
                      name: "WhatsApp",
                      time: "45m",
                      pct: 14,
                      color: "bg-emerald-600",
                    },
                  ].map((app) => (
                    <div key={app.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-primary">
                          {app.rank}. {app.name}
                        </span>
                        <span className="text-muted font-medium">
                          {app.time} ({app.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted-light rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${app.color}`}
                          style={{ width: `${app.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEHAVIORAL ANALYSIS */}
      {activeTab === "behavior" && (
        <div className="space-y-6 animate-page-enter">
          {/* Main Risk and Score Status Header */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                  Analisis Perilaku
                </span>
                <h2 className="text-2xl font-black text-primary">
                  Tingkat Risiko: MODERATE (Sedang)
                </h2>
                <p className="text-sm text-muted font-light leading-relaxed">
                  Tingkat risiko Anda saat ini tergolong sedang. Anda memiliki
                  kontrol diri yang cukup baik pada siang hari, namun rentan
                  terpengaruh distraksi impulsif di jam malam.
                </p>
              </div>
              <div className="w-32 h-32 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center shrink-0 self-center">
                <AlertTriangle className="w-10 h-10 text-amber-600 mb-1" />
                <span className="text-xl font-black text-amber-800">
                  MODERATE
                </span>
                <span className="text-[10px] text-muted font-semibold mt-0.5">
                  Score: 68/100
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Behavioral score big widget */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[340px]">
              <div>
                <h3 className="font-bold text-base text-primary">
                  Behavioral Score
                </h3>
                <p className="text-[10px] text-muted font-light mt-0.5">
                  Rentang skor 0 (Sangat Sehat) – 100 (Sangat Berisiko)
                </p>
              </div>
              <div className="my-6 relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-12 border-muted-light flex items-center justify-center relative">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-12 border-primary border-t-accent border-r-accent transform -rotate-45" />
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className="text-4xl font-black text-primary">68</span>
                    <span className="text-xs text-muted font-semibold">
                      Cukup Baik
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                  Batas Wajar
                </span>
                <p className="text-[10px] text-muted leading-tight font-light mt-1">
                  Sedikit di atas standar sehat. Disarankan mengurangi frekuensi
                  cek instan.
                </p>
              </div>
            </div>

            {/* Breakdown skor per indikator */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base text-primary">
                Score Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Usage Duration",
                    val: 60,
                    weight: 30,
                    desc: "Durasi keseluruhan harian",
                  },
                  {
                    name: "Open Frequency",
                    val: 75,
                    weight: 20,
                    desc: "Berapa sering membuka HP",
                  },
                  {
                    name: "Midnight Usage",
                    val: 50,
                    weight: 20,
                    desc: "Aktivitas di jam tidur",
                  },
                  {
                    name: "Continuous Usage",
                    val: 85,
                    weight: 15,
                    desc: "Menggunakan nonstop tanpa jeda",
                  },
                  {
                    name: "Productive Hour Usage",
                    val: 70,
                    weight: 15,
                    desc: "Distraksi di jam kerja",
                  },
                ].map((ind) => (
                  <div key={ind.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <div className="flex flex-col">
                        <span className="text-primary">{ind.name}</span>
                        <span className="text-[9px] text-muted font-light">
                          Bobot: {ind.weight}% • {ind.desc}
                        </span>
                      </div>
                      <span className="text-primary">{ind.val}/100</span>
                    </div>
                    <div className="h-2 w-full bg-muted-light rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${ind.val < 60 ? "bg-red-500" : ind.val < 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${ind.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart semua indikator */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-base text-primary mb-4">
                Radar Chart Indikator
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={behaviorRadarData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="subject"
                      fontSize={10}
                      stroke="#506e86"
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      fontSize={8}
                    />
                    <Radar
                      name="Skor Saya"
                      dataKey="A"
                      stroke="#062743"
                      fill="#113a5d"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Behavioral Flags */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-base text-primary mb-4">
                Active Behavioral Flags
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: "✓ Excessive Usage",
                    desc: "Melebihi 4 jam penggunaan",
                    active: true,
                  },
                  {
                    name: "✓ Midnight Usage",
                    desc: "Aktif di jam malam",
                    active: true,
                  },
                  {
                    name: "✓ Distraction Tendency",
                    desc: "Membuka medsos di jam kerja",
                    active: true,
                  },
                  {
                    name: "✗ Continuous Usage",
                    desc: "Aktif > 30 mnt tanpa jeda",
                    active: false,
                  },
                ].map((flag) => (
                  <div
                    key={flag.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      flag.active
                        ? "border-amber-100 bg-amber-50/40"
                        : "border-border bg-card opacity-50"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-primary">
                        {flag.name}
                      </span>
                      <p className="text-[9px] text-muted font-light mt-0.5">
                        {flag.desc}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${flag.active ? "bg-amber-200 text-amber-800" : "bg-muted-light text-muted"} uppercase`}
                    >
                      {flag.active ? "Aktif" : "Tidak"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend behavioral score per minggu (line) */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-base text-primary mb-4">
                Behavioral Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={behaviorTrend}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="week"
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
                      domain={[50, 100]}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#062743"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY REPORT */}
      {activeTab === "weekly" && (
        <div className="space-y-6 animate-page-enter">
          {/* Week Selector & Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedWeek("10 Mei - 16 Mei 2026")}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted-light/40"
              >
                <ChevronLeft className="w-4 h-4 text-primary" />
              </button>
              <span className="text-sm font-bold text-primary">
                {selectedWeek}
              </span>
              <button
                type="button"
                onClick={() => setSelectedWeek("17 Mei - 23 Mei 2026")}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted-light/40"
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => alert("Mengunduh Laporan Mingguan...")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Cards metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Weekly Summary
              </span>
              <h3 className="text-2xl font-black text-primary mt-1">
                26.5 jam
              </h3>
              <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-8.5% vs minggu lalu</span>
              </span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Rata-rata Skor
              </span>
              <h3 className="text-2xl font-black text-primary mt-1">67/100</h3>
              <span className="text-[9px] text-red-600 font-semibold flex items-center gap-0.5 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2.3% (Sedikit memburuk)</span>
              </span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Rata-rata Risiko
              </span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                Moderate
              </h3>
              <span className="text-[9px] text-muted font-light block mt-1.5">
                Sama dengan minggu lalu
              </span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Status Risiko
              </span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                Stabil
              </h3>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-1.5">
                Kondisi terkontrol
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Worst & Best Day */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Best Day
                  </span>
                  <h4 className="text-lg font-black text-primary mt-1">
                    Selasa, 19 Mei
                  </h4>
                  <p className="text-xs text-muted font-light mt-1">
                    2.1 jam total penggunaan. Produktivitas jam kerja tercapai
                    92%.
                  </p>
                </div>
                <div className="bg-red-50/20 border border-red-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                    Worst Day
                  </span>
                  <h4 className="text-lg font-black text-primary mt-1">
                    Kamis, 21 Mei
                  </h4>
                  <p className="text-xs text-muted font-light mt-1">
                    5.2 jam total penggunaan, dengan Midnight Usage aktif pukul
                    23:30.
                  </p>
                </div>
              </div>

              {/* Weekly Risk Trend */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-4">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wider">
                  Weekly Risk Trend
                </h4>
                <div className="relative pl-6 border-l border-border space-y-4">
                  {[
                    {
                      week: "Minggu 4 (24 Mei)",
                      risk: "Moderate",
                      status: "border-amber-400 bg-amber-100 text-amber-800",
                    },
                    {
                      week: "Minggu 3 (17 Mei)",
                      risk: "High",
                      status: "border-red-400 bg-red-100 text-red-800",
                    },
                    {
                      week: "Minggu 2 (10 Mei)",
                      risk: "High",
                      status: "border-red-400 bg-red-100 text-red-800",
                    },
                    {
                      week: "Minggu 1 (03 Mei)",
                      risk: "Moderate",
                      status: "border-amber-400 bg-amber-100 text-amber-800",
                    },
                  ].map((item) => (
                    <div key={item.week} className="relative">
                      <span
                        className={`absolute -left-8.5 top-1.5 w-5 h-5 rounded-full border-4 ${item.status}`}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-primary">
                          {item.week}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${item.status}`}
                        >
                          {item.risk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Weekly Reflection */}
              <div className="bg-gradient-to-tr from-card to-muted-light/20 border border-border rounded-3xl p-6 space-y-3">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-primary" />
                  <span>AI Weekly Reflection</span>
                </h4>
                <p className="text-xs text-muted font-poppins font-light leading-relaxed">
                  Pola screen time Anda minggu ini menunjukkan kestabilan yang
                  baik. Walaupun total durasi screen time menurun 8.5%, Anda
                  masih memiliki lonjakan kebiasaan negatif di hari Kamis malam
                  (Midnight Usage). Pemicunya diduga karena kebiasaan membuka
                  aplikasi TikTok sebelum tidur. Kami merekomendasikan untuk
                  menaruh gawai Anda di meja kerja 30 menit sebelum jadwal tidur
                  guna mempermudah relaksasi alami otak Anda.
                </p>
              </div>
            </div>

            {/* Top Apps List */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-primary mb-4">
                  Top 3 Apps
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      rank: 1,
                      name: "TikTok",
                      time: "9.5 jam",
                      pct: 36,
                      color: "bg-primary",
                    },
                    {
                      rank: 2,
                      name: "Instagram",
                      time: "8.2 jam",
                      pct: 31,
                      color: "bg-secondary",
                    },
                    {
                      rank: 3,
                      name: "YouTube",
                      time: "5.5 jam",
                      pct: 21,
                      color: "bg-muted",
                    },
                  ].map((app) => (
                    <div key={app.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-primary">
                          {app.rank}. {app.name}
                        </span>
                        <span className="text-muted font-medium">
                          {app.time} ({app.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted-light rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${app.color}`}
                          style={{ width: `${app.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted font-light mt-8">
                Tiga aplikasi di atas menyumbang 88% dari total screen time Anda
                minggu ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center text-muted">
          Loading Analytics...
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
