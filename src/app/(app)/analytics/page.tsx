"use client";

import { AlertTriangle, ArrowRight, BarChart2, Brain, Calendar, ChevronLeft, ChevronRight, Clock, Download, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { analyticsDummy } from "@/lib/databases/dummyData";
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

const overviewPeriodData = analyticsDummy.overviewPeriodData;
const behaviorPeriodDates = analyticsDummy.behaviorPeriodDates;
const behaviorPeriodData = analyticsDummy.behaviorPeriodData;
const behaviorTrend = analyticsDummy.behaviorTrend;

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") as TabType;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [timeRange, setTimeRange] = useState<"hari" | "7hari" | "30hari" | "custom">("7hari");
  const [mounted, setMounted] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("17 Mei - 23 Mei 2026");
  const [behaviorPeriod, setBehaviorPeriod] = useState<"hari" | "7hari" | "30hari" | "custom">("7hari");

  // Sync state with URL search param
  useEffect(() => {
    if (activeTabParam && ["overview", "behavior", "weekly"].includes(activeTabParam)) {
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
    return <div className="h-96 flex items-center justify-center text-muted">Loading Analytics...</div>;
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Analisis Penggunaan</h1>
        <p className="text-sm text-muted font-light mt-1">Laporan terperinci mengenai durasi, kebiasaan, tingkat risiko, dan perkembangan screen time Anda</p>
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
                  active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-muted-light hover:text-primary"
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
      {activeTab === "overview" &&
        (() => {
          const currentOverviewData = overviewPeriodData[timeRange];
          const heatmapHours = Array.from({ length: 24 }, (_, i) => {
            let val = 0;
            if (timeRange === "hari") {
              val = i >= 18 && i <= 21 ? 4 : i >= 8 && i <= 17 ? 2 : 1;
            } else if (timeRange === "7hari") {
              val = i >= 20 && i <= 22 ? 4 : i >= 8 && i <= 15 ? 1 : 2;
            } else if (timeRange === "30hari") {
              val = i >= 21 && i <= 23 ? 4 : i >= 9 && i <= 17 ? 3 : 1;
            } else {
              val = i >= 19 && i <= 22 ? 4 : i >= 8 && i <= 17 ? 2 : 1;
            }
            return {
              hour: `${i.toString().padStart(2, "0")}:00`,
              value: val,
            };
          });

          return (
            <div className="space-y-6 animate-page-enter">
              {/* Filter Periode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-primary">Overview Penggunaan</h3>
                  <p className="text-xs text-muted font-medium mt-1">
                    Periode: <span className="text-primary font-bold">{behaviorPeriodDates[timeRange]}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-semibold">Analisis Periode:</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none cursor-pointer"
                  >
                    <option value="hari">Hari Ini</option>
                    <option value="7hari">7 Hari Terakhir</option>
                    <option value="30hari">30 Hari Terakhir</option>
                    <option value="custom">Custom (1 Mei - 31 Mei)</option>
                  </select>
                </div>
              </div>

              {/* Total Screen Time */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-muted-light/60 text-primary shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Total Duration</span>
                    <h2 className="text-3xl font-black text-primary">{currentOverviewData.total}</h2>
                  </div>
                </div>
                {timeRange !== "hari" && (
                  <div className="border-t border-border md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 flex flex-col justify-center space-y-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Average Per Day (Avg Daily)</span>
                    <div className="text-xl font-bold text-secondary">{currentOverviewData.avg}</div>
                  </div>
                )}
                <div className="self-end md:self-center">
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>Turun 12% vs periode sebelumnya</span>
                  </p>
                </div>
              </div>

              {/* Grid layout for Charts and Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Trend */}
                <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
                  <h4 className="font-bold text-sm text-primary mb-4">Usage Trend</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentOverviewData.trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMenit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#062743" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#062743" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e8ef" />
                        <XAxis dataKey="label" stroke="#506e86" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#506e86" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            borderColor: "#e1e8ef",
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          }}
                        />
                        <Area type="monotone" dataKey="menit" stroke="#062743" strokeWidth={3} fillOpacity={1} fill="url(#colorMenit)" activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* App Usage Breakdown */}
                <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
                  <h4 className="font-bold text-sm text-primary mb-4">App Usage Breakdown</h4>
                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={currentOverviewData.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="menit">
                          {currentOverviewData.breakdown.map((entry, index) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
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
                      <span className="text-lg font-black text-primary">{currentOverviewData.total}</span>
                      <span className="text-[8px] text-muted font-bold uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                    {currentOverviewData.breakdown.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate font-medium text-primary">
                          {item.name} ({Math.round((item.menit / currentOverviewData.totalMin) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Hours Heatmap */}
                <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
                  <h4 className="font-bold text-sm text-primary mb-2">Active Hours Heatmap</h4>
                  <p className="text-[10px] text-muted font-light mb-4">Blok berwarna menunjukkan tingkat keaktifan layar per jam. Warna gelap melambangkan durasi tinggi.</p>
                  <div className="grid grid-cols-6 gap-2">
                    {heatmapHours.map((item) => (
                      <div key={item.hour} className={`flex flex-col items-center justify-center py-2.5 rounded-xl ${getHeatmapColor(item.value)}`} title={`${item.hour}: value ${item.value}`}>
                        <span className="text-[9px] font-bold text-primary">{item.hour.split(":")[0]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-6 text-[9px] text-muted">
                    <span className="font-semibold text-primary bg-muted-light/60 px-2.5 py-1 rounded-lg">
                      Jam teraktif: {timeRange === "7hari" ? "20.00–23.00" : timeRange === "hari" ? "18.00–22.00" : timeRange === "30hari" ? "21.00–00.00" : "19.00–23.00"}
                    </span>
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span>Rendah</span>
                      <span className="w-2.5 h-2.5 rounded-sm bg-muted-light/20 border border-border/40" />
                      <span className="w-2.5 h-2.5 rounded-sm bg-muted-light" />
                      <span className="w-2.5 h-2.5 rounded-sm bg-secondary/40" />
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                      <span>Tinggi</span>
                    </div>
                  </div>
                </div>

                {/* Top Used Apps */}
                <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-primary mb-4">Top Used Apps</h4>
                    <div className="space-y-3.5">
                      {currentOverviewData.topApps.map((app) => (
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
                            <div className={`h-full rounded-full ${app.color}`} style={{ width: `${app.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* TAB 2: BEHAVIORAL ANALYSIS */}
      {activeTab === "behavior" &&
        (() => {
          const currentData = behaviorPeriodData[behaviorPeriod];
          return (
            <div className="space-y-6 animate-page-enter">
              {/* Analysis Period Selector & Explanation Card */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-primary">Behavioral Analysis</h3>
                    <p className="text-xs text-muted font-medium mt-1">
                      Periode: <span className="text-primary font-bold">{behaviorPeriodDates[behaviorPeriod]}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted font-semibold">Analisis Periode:</span>
                    <select
                      value={behaviorPeriod}
                      onChange={(e) => setBehaviorPeriod(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none cursor-pointer"
                    >
                      <option value="hari">Hari Ini</option>
                      <option value="7hari">7 Hari Terakhir</option>
                      <option value="30hari">30 Hari Terakhir</option>
                      <option value="custom">Custom (1 Mei - 31 Mei)</option>
                    </select>
                  </div>
                </div>

                {/* Explanation: Dashboard vs Behavioral Analysis */}
                <div className="bg-gradient-to-r from-[#062743]/5 to-[#113a5d]/5 border border-border rounded-3xl p-6 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary text-white shrink-0">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-primary">💡 Pahami Perbedaan: Dashboard vs Behavioral Analysis</h4>
                        <p className="text-xs text-muted font-light mt-0.5">Penjelasan penting untuk memahami cara FomoTracker mengukur kecanduan media sosial Anda.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-ping" />
                            <span>Dashboard (Kondisi Hari Ini)</span>
                          </div>
                          <p className="text-[10px] text-muted font-light leading-relaxed">
                            Menampilkan aktivitas real-time <span className="font-semibold text-primary">hari ini</span> saja. Fokus pada screen time harian, aplikasi yang paling banyak digunakan hari
                            ini, serta flags/peringatan aktif hari ini.
                          </p>
                        </div>
                        <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span>Behavioral Analysis (Evaluasi Pola)</span>
                          </div>
                          <p className="text-[10px] text-muted font-light leading-relaxed">
                            Mengevaluasi kebiasaan dan <span className="font-semibold text-primary">pola perilaku jangka panjang</span> (default 7 hari). Berguna untuk mendeteksi risiko kecanduan
                            sistemik (BSMAS) yang lebih stabil.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Risk and Score Status Header */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">Analisis Perilaku</span>
                    <h2 className="text-2xl font-black text-primary">Tingkat Risiko: {currentData.risk}</h2>
                    <p className="text-sm text-muted font-light leading-relaxed">{currentData.desc}</p>
                  </div>
                  <div className="w-32 h-32 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center shrink-0 self-center">
                    <AlertTriangle className="w-10 h-10 text-amber-600 mb-1" />
                    <span className="text-xl font-black text-amber-800">{currentData.risk.split(" ")[0]}</span>
                    <span className="text-[10px] text-muted font-semibold mt-0.5">Score: {currentData.score}/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Behavioral score big widget */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[340px]">
                  <div>
                    <h3 className="font-bold text-base text-primary">Behavioral Score</h3>
                    <p className="text-[10px] text-muted font-light mt-0.5">Rentang skor 0 (Sangat Sehat) – 100 (Sangat Berisiko)</p>
                  </div>
                  <div className="my-6 relative flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-12 border-muted-light flex items-center justify-center relative">
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-12 border-primary border-t-accent border-r-accent transform -rotate-45" />
                      <div className="flex flex-col items-center justify-center z-10">
                        <span className="text-4xl font-black text-primary">{currentData.score}</span>
                        <span className="text-xs text-muted font-semibold">{currentData.score < 60 ? "Sehat" : currentData.score < 75 ? "Cukup Baik" : "Berisiko"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide ${currentData.score < 60 ? "bg-emerald-100 text-emerald-800" : currentData.score < 75 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}
                    >
                      {currentData.score < 60 ? "Kondisi Sehat" : currentData.score < 75 ? "Batas Wajar" : "Tingkat Bahaya"}
                    </span>
                    <p className="text-[10px] text-muted leading-tight font-light mt-1">
                      {currentData.score < 60
                        ? "Skor perilaku Anda dalam batas aman dan terkontrol."
                        : currentData.score < 75
                          ? "Sedikit di atas standar sehat. Disarankan mengurangi frekuensi cek instan."
                          : "Tingkat ketergantungan tinggi. Direkomendasikan melakukan detoks digital."}
                    </p>
                  </div>
                </div>

                {/* Breakdown skor per indikator */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-base text-primary">Score Breakdown</h3>
                  <div className="space-y-4">
                    {currentData.breakdown.map((ind) => (
                      <div key={ind.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <div className="flex flex-col">
                            <span className="text-primary">{ind.label}</span>
                            <span className="text-[9px] text-muted font-light">{ind.desc}</span>
                          </div>
                          <span className="text-primary font-bold">{ind.valueText}</span>
                        </div>
                        <div className="h-2 w-full bg-muted-light rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${ind.pct < 40 ? "bg-emerald-500" : ind.pct < 70 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${ind.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar chart semua indikator */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                  <h3 className="font-bold text-base text-primary mb-4">Radar Chart Indikator</h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={currentData.radar}>
                        <PolarGrid stroke="#e1e8ef" />
                        <PolarAngleAxis dataKey="subject" fontSize={10} stroke="#506e86" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                        <Radar name="Skor Saya" dataKey="A" stroke="#062743" fill="#113a5d" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Behavioral Indicators */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                  <h3 className="font-bold text-base text-primary mb-4">Behavioral Indicators</h3>
                  <div className="space-y-3.5">
                    {currentData.indicators.map((ind) => (
                      <div key={ind.name} className="p-3.5 rounded-2xl border border-border bg-card hover:bg-muted-light/20 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{ind.name}</span>
                          <span className="text-xs font-black text-secondary bg-muted-light/60 px-2.5 py-1 rounded-xl">{ind.value}</span>
                        </div>
                        <p className="text-[10px] text-muted font-light mt-1.5 leading-relaxed">{ind.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trend behavioral score per minggu (line) */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
                  <h3 className="font-bold text-base text-primary mb-4">Behavioral Trend</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={behaviorTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#062743" strokeWidth={3} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* TAB 3: WEEKLY REPORT */}
      {activeTab === "weekly" && (
        <div className="space-y-6 animate-page-enter">
          {/* Week Selector & Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSelectedWeek("10 Mei - 16 Mei 2026")} className="p-2 rounded-xl border border-border bg-card hover:bg-muted-light/40">
                <ChevronLeft className="w-4 h-4 text-primary" />
              </button>
              <span className="text-sm font-bold text-primary">{selectedWeek}</span>
              <button type="button" onClick={() => setSelectedWeek("17 Mei - 23 Mei 2026")} className="p-2 rounded-xl border border-border bg-card hover:bg-muted-light/40">
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
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Total Screen Time</span>
              <h3 className="text-2xl font-black text-primary mt-1">32 Jam</h3>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-1.5">Target: &lt; 35 Jam</span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Behavioral Score</span>
              <h3 className="text-2xl font-black text-primary mt-1">58/100</h3>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-1.5">Kondisi Baik</span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Risk Level</span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">Moderate</h3>
              <span className="text-[9px] text-amber-600 font-semibold block mt-1.5">Tingkat Risiko Sedang</span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Change vs Last Week</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <span>↓ 8%</span>
                </h3>
              </div>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-1.5">Lebih baik dari minggu lalu</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Worst & Best Day */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Best Day</span>
                  <h4 className="text-lg font-black text-primary mt-1">Selasa, 19 Mei</h4>
                  <div className="text-xs font-bold text-emerald-700 mt-1">Behavioral Score: 32</div>
                  <p className="text-xs text-muted font-light mt-1.5 leading-relaxed font-poppins">2.1 jam total penggunaan. Produktivitas jam kerja mencapai 92% tanpa gangguan media sosial.</p>
                </div>
                <div className="bg-red-50/20 border border-red-100 rounded-3xl p-5">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">Worst Day</span>
                  <h4 className="text-lg font-black text-primary mt-1">Kamis, 21 Mei</h4>
                  <div className="text-xs font-bold text-red-700 mt-1">Behavioral Score: 78</div>
                  <p className="text-xs text-muted font-light mt-1.5 leading-relaxed font-poppins">5.2 jam total penggunaan, dengan Midnight Usage aktif pukul 23:30 menjelang tidur.</p>
                </div>
              </div>

              {/* View Weekly Insight */}
              <div className="bg-gradient-to-r from-card via-muted-light/10 to-card border border-border rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 shrink-0 text-primary">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-primary">Insight Minggu Ini</h4>
                    <p className="text-xs text-muted font-poppins font-light leading-relaxed max-w-xl">
                      Dapatkan interpretasi AI secara mendalam mengenai pola perilaku digital, deteksi risiko, serta saran taktis mingguan Anda.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 self-end sm:self-auto">
                  <Link
                    href="/insight"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-secondary transition-all cursor-pointer shadow-xs"
                  >
                    <span>Lihat Insight</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Top Apps List */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-primary mb-4">Top 3 Apps</h3>
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
                        <div className={`h-full rounded-full ${app.color}`} style={{ width: `${app.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted font-light mt-8">Tiga aplikasi di atas menyumbang 88% dari total screen time Anda minggu ini.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted">Loading Analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
