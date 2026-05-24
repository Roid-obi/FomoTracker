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
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Bar,
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
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
type TabType = "overview" | "behavior" | "risk" | "timeline" | "weekly";

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
  const [selectedDate, setSelectedDate] = useState("2026-05-23");
  const [selectedWeek, setSelectedWeek] = useState("17 Mei - 23 Mei 2026");

  // Sync state with URL search param
  useEffect(() => {
    if (
      activeTabParam &&
      ["overview", "behavior", "risk", "timeline", "weekly"].includes(
        activeTabParam,
      )
    ) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

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
          timeline screen time Anda
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-1 shrink-0 scrollbar-none select-none">
        {(
          [
            { id: "overview", name: "Overview", icon: BarChart2 },
            { id: "behavior", name: "Behavior", icon: Brain },
            { id: "risk", name: "Risk", icon: AlertTriangle },
            { id: "timeline", name: "Timeline", icon: Clock },
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
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-xs border-t-2 border-primary"
                  : "text-muted hover:bg-muted-light/60 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-page-enter">
          {/* Time range filters */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-primary">
              Overview Penggunaan
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none"
            >
              <option value="hari">Hari ini</option>
              <option value="7hari">7 hari terakhir</option>
              <option value="30hari">30 hari terakhir</option>
              <option value="custom">Rentang Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Screentime per App (Bar) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
              <h4 className="font-bold text-sm text-primary mb-4">
                Total Screen Time per Aplikasi (Menit)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={overviewScreenTime}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
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
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Bar
                      dataKey="menit"
                      fill="#113a5d"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* App breakdown proportion (Pie) */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
              <h4 className="font-bold text-sm text-primary mb-4">
                Proporsi Penggunaan
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                {overviewScreenTime.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate font-medium text-primary">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage trend harian (Line Chart) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
              <h4 className="font-bold text-sm text-primary mb-4">
                Trend Penggunaan Harian (Menit)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyTrend}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
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
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="menit"
                      stroke="#062743"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmap Active Hours */}
            <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
              <h4 className="font-bold text-sm text-primary mb-2">
                Jam Aktif Terpadat
              </h4>
              <p className="text-[10px] text-muted font-light mb-4">
                Blok berwarna menunjukkan tingkat keaktifan layar per jam. Warna
                gelap melambangkan durasi tinggi.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {heatmapHours.map((item) => (
                  <div
                    key={item.hour}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl ${getHeatmapColor(
                      item.value,
                    )}`}
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
          </div>
        </div>
      )}

      {/* TAB 2: BEHAVIOR */}
      {activeTab === "behavior" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-page-enter">
          {/* Behavioral score big widget */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[340px]">
            <div>
              <h3 className="font-bold text-base text-primary">
                Skor Perilaku Digital
              </h3>
              <p className="text-[10px] text-muted font-light mt-0.5">
                Penilaian berdasarkan analisis kebiasaan
              </p>
            </div>
            <div className="my-6 relative flex items-center justify-center">
              {/* Simple simulated Gauge visual */}
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
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2">
            <h3 className="font-bold text-base text-primary mb-4">
              Breakdown Indikator Skor
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: "Usage Duration Score",
                  val: 60,
                  weight: 30,
                  desc: "Durasi keseluruhan harian",
                },
                {
                  name: "Open Frequency Score",
                  val: 75,
                  weight: 20,
                  desc: "Berapa sering membuka HP",
                },
                {
                  name: "Midnight Usage Score",
                  val: 50,
                  weight: 20,
                  desc: "Aktivitas di jam tidur",
                },
                {
                  name: "Continuous Usage Score",
                  val: 85,
                  weight: 15,
                  desc: "Menggunakan nonstop tanpa jeda",
                },
                {
                  name: "Productivity Hour Score",
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
                      className={`h-full rounded-full transition-all duration-500 ${
                        ind.val < 60
                          ? "bg-red-500"
                          : ind.val < 80
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
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
              Radar Karakteristik
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
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
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

          {/* Trend behavioral score per minggu (line) */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2">
            <h3 className="font-bold text-base text-primary mb-4">
              Trend Skor Perilaku (Mingguan)
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
      )}

      {/* TAB 3: RISK LEVEL */}
      {activeTab === "risk" && (
        <div className="space-y-6 animate-page-enter">
          {/* Main Risk Status */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                  Analisis Risiko
                </span>
                <h2 className="text-2xl font-black text-primary">
                  Tingkat Risiko: MODERATE (Sedang)
                </h2>
                <p className="text-sm text-muted font-light leading-relaxed">
                  Tingkat risiko Anda saat ini tergolong sedang. Ini berarti
                  Anda memiliki kontrol diri yang cukup baik pada siang hari,
                  namun rentan terpengaruh distraksi impulsif di jam malam atau
                  saat jam kerja produktif Anda.
                </p>
              </div>
              <div className="w-32 h-32 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center shrink-0 self-center">
                <AlertTriangle className="w-10 h-10 text-amber-600 mb-1" />
                <span className="text-xl font-black text-amber-800">
                  MODERATE
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indikator kontributor risiko tertinggi */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-base text-primary mb-4">
                Kontributor Risiko Tertinggi
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50/40 border border-red-100">
                  <div className="p-2 rounded-xl bg-red-100 text-red-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      Midnight Usage (Penggunaan Tengah Malam)
                    </h4>
                    <p className="text-xs text-muted font-light leading-relaxed mt-1">
                      Aktivitas screen time di atas jam 22.00 menyumbang 40%
                      dari total kenaikan indeks risiko Anda. Menatap layar biru
                      merusak siklus tidur alami.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      Distraction Tendency (Kecenderungan Distraksi)
                    </h4>
                    <p className="text-xs text-muted font-light leading-relaxed mt-1">
                      Membuka aplikasi sosial media pada jam produktif (08:00 -
                      17:00). Hal ini mengganggu retensi fokus kerja Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat risk level per minggu */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <h3 className="font-bold text-base text-primary mb-6">
                Riwayat Tingkat Risiko Mingguan
              </h3>
              <div className="relative pl-6 border-l border-border space-y-6">
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
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-primary">
                        {item.week}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${item.status}`}
                      >
                        {item.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6 animate-page-enter">
          {/* Date Selector */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-primary font-poppins">
              Timeline Aktivitas
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none"
            />
          </div>

          {/* Timeline List */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-6">
            <div className="relative pl-6 border-l-2 border-border space-y-6">
              {/* Item 1 */}
              <div className="relative">
                <span className="absolute -left-9.5 top-1 w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-[10px] font-bold text-red-600">
                  !
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary font-poppins">
                      23:45
                    </span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1 font-poppins">
                      🔴 Midnight Usage
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Membuka Instagram selama 30 menit
                  </p>
                  <p className="text-xs text-muted font-light">
                    Sesi scroll impulsif sebelum tidur terdeteksi.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <span className="absolute -left-9.5 top-1 w-6 h-6 rounded-full bg-muted-light border-2 border-primary flex items-center justify-center text-[10px]" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      19:00
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Membuka TikTok selama 40 menit
                  </p>
                  <p className="text-xs text-muted font-light">
                    Sesi santai setelah makan malam.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <span className="absolute -left-9.5 top-1 w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-600">
                  !
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary">
                      15:00
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                      🟡 Productive Hour Usage
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Membuka TikTok selama 15 menit
                  </p>
                  <p className="text-xs text-muted font-light">
                    Membuka media sosial di tengah jam kerja/belajar produktif.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative">
                <span className="absolute -left-9.5 top-1 w-6 h-6 rounded-full bg-muted-light border-2 border-primary flex items-center justify-center text-[10px]" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      12:30
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Membuka YouTube selama 45 menit
                  </p>
                  <p className="text-xs text-muted font-light">
                    Menonton video pada jam istirahat siang.
                  </p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="relative">
                <span className="absolute -left-9.5 top-1 w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-600">
                  !
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary">
                      10:15
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                      🟡 Productive Hour Usage
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Membuka Instagram selama 20 menit
                  </p>
                  <p className="text-xs text-muted font-light">
                    Sesi buka HP spontan pada jam kerja utama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEEKLY REPORT */}
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
              <span>Unduh Laporan (PDF)</span>
            </button>
          </div>

          {/* Cards metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Total Screen Time
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
                Kategori Risiko
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
                <div className="bg-red-50/20 border border-red-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                    Worst Day (Hari Terburuk)
                  </span>
                  <h4 className="text-lg font-black text-primary mt-1">
                    Kamis, 21 Mei
                  </h4>
                  <p className="text-xs text-muted font-light mt-1">
                    5.2 jam total penggunaan, dengan Midnight Usage aktif pukul
                    23:30.
                  </p>
                </div>
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Best Day (Hari Terbaik)
                  </span>
                  <h4 className="text-lg font-black text-primary mt-1">
                    Selasa, 19 Mei
                  </h4>
                  <p className="text-xs text-muted font-light mt-1">
                    2.1 jam total penggunaan. Produktivitas jam kerja tercapai
                    92%.
                  </p>
                </div>
              </div>

              {/* AI Reflection */}
              <div className="bg-gradient-to-tr from-card to-muted-light/20 border border-border rounded-3xl p-6 space-y-3">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-primary" />
                  <span>AI Weekly Reflection (Refleksi AI)</span>
                </h4>
                <p className="text-xs text-muted font-poppins font-light leading-relaxed">
                  Pola screen time Anda minggu ini menunjukkan kestabilan yang
                  baik. Walaupun total durasi screen time menurun 8.5%, Anda
                  masih memiliki lonjakan kebiasaan negatif di hari Kamis malam
                  (Midnight Usage). Pemicunya diduga karena kebiasaan membuka
                  aplikasi TikTok sebelum tidur. Kami merekomendasikan untuk
                  menaruh gadget Anda di meja kerja 30 menit sebelum jadwal
                  tidur guna mempermudah relaksasi alami otak Anda.
                </p>
              </div>
            </div>

            {/* Top Apps List */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-primary mb-4">
                  Top 3 Aplikasi Terbanyak
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
