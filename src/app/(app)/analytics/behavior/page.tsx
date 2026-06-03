"use client";

import { useState } from "react";
import { analyticsDummy } from "@/lib/data/initialData";
import {
  AlertTriangle,
  Brain,
} from "lucide-react";
import {
  Line,
  LineChart,
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

type BehaviorPeriodType = "hari" | "7hari" | "30hari" | "custom";

const behaviorPeriodDates = analyticsDummy.behaviorPeriodDates;
const behaviorPeriodData = analyticsDummy.behaviorPeriodData;
const behaviorTrend = analyticsDummy.behaviorTrend;

export default function AnalyticsBehaviorPage() {
  const [behaviorPeriod, setBehaviorPeriod] = useState<BehaviorPeriodType>("7hari");

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
              onChange={(e) => setBehaviorPeriod(e.target.value as BehaviorPeriodType)}
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
}
