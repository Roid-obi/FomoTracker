"use client";

import { useState } from "react";
import { analyticsDummy } from "@/lib/data/initialData";
import {
  Clock,
  TrendingDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeRangeType = "hari" | "7hari" | "30hari" | "custom";

const COLORS = ["#062743", "#113a5d", "#c4ffdd", "#e6eef4", "#888888"];

const overviewPeriodData = analyticsDummy.overviewPeriodData;
const behaviorPeriodDates = analyticsDummy.behaviorPeriodDates;

export default function AnalyticsOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeType>("7hari");

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

  const getHeatmapColor = (val: number) => {
    if (val === 0) return "bg-muted-light/20 border border-border/40";
    if (val === 1) return "bg-muted-light border border-border/80";
    if (val === 2) return "bg-secondary/40";
    if (val === 3) return "bg-secondary/70";
    return "bg-primary";
  };

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
            onChange={(e) => setTimeRange(e.target.value as TimeRangeType)}
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
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Average Per Day</span>
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
}
