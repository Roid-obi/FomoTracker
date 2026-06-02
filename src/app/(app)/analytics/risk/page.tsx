"use client";

import { useState } from "react";
import { analyticsDummy } from "@/lib/databases/dummyData";
import {
  AlertTriangle,
  Flame,
  Moon,
  Clock,
  Activity,
  Briefcase,
  AlertCircle,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RiskPeriodType = "hari" | "7hari" | "30hari" | "custom";

const behaviorPeriodDates = analyticsDummy.behaviorPeriodDates;
const behaviorPeriodData = analyticsDummy.behaviorPeriodData;

export default function AnalyticsRiskPage() {
  const [riskPeriod, setRiskPeriod] = useState<RiskPeriodType>("7hari");

  const currentData = behaviorPeriodData[riskPeriod];
  
  // Calculate a risk score (slightly different from behavioral score for variance, e.g., +5 or capped at 100)
  const riskScore = Math.min(100, Math.round(currentData.score * 1.05));
  
  // Risk contributors based on period
  const riskContributors = [
    {
      name: "Midnight Usage",
      impact: "High",
      impactColor: "text-red-600 bg-red-50 border-red-100",
      desc: "Scrolling larut malam di atas pukul 22:00 mengganggu produksi melatonin alami dan menurunkan kualitas tidur Anda.",
      icon: Moon,
    },
    {
      name: "Compulsive Checking",
      impact: "High",
      impactColor: "text-red-600 bg-red-50 border-red-100",
      desc: "Membuka kunci layar ponsel lebih dari 45 kali sehari secara tidak sadar memecah konsentrasi mendalam Anda.",
      icon: Activity,
    },
    {
      name: "Excessive Screen Time",
      impact: "Medium",
      impactColor: "text-amber-600 bg-amber-50 border-amber-100",
      desc: "Menghabiskan rata-rata durasi harian di atas 4 jam untuk media sosial menguras energi kognitif.",
      icon: Clock,
    },
    {
      name: "Productive Hour Distraction",
      impact: "Medium",
      impactColor: "text-amber-600 bg-amber-50 border-amber-100",
      desc: "Distraksi media sosial pada jam kerja (08:00 - 17:00) menurunkan produktivitas akademik/profesional Anda.",
      icon: Briefcase,
    },
  ];

  // Risk Trend Data over past weeks
  const riskTrendData = [
    { week: "M1", riskScore: 78 },
    { week: "M2", riskScore: 74 },
    { week: "M3", riskScore: 68 },
    { week: "M4", riskScore: 66 },
  ];

  // Risk timeline items
  const riskTimeline = [
    {
      time: "Hari ini, 00:45",
      title: "Midnight Usage Terdeteksi",
      desc: "Membuka Instagram selama 15 menit pada pukul 23:45.",
      badge: "Kritis",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
    },
    {
      time: "Kemarin, 22:30",
      title: "Batas Durasi TikTok Terlampaui",
      desc: "TikTok digunakan selama 1j 45m hari ini (Batas wajar: 1.5j).",
      badge: "Peringatan",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      time: "Kemarin, 13:10",
      title: "Distraksi Jam Produktif",
      desc: "Terdeteksi aktif membuka YouTube selama jam belajar (13:10 – 13:40).",
      badge: "Info",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      time: "2 hari lalu, 18:22",
      title: "Sesi Nonstop Berlebih (Continuous Usage)",
      desc: "Scrolling media sosial selama 40 menit nonstop tanpa jeda rileksasi mata.",
      badge: "Peringatan",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
  ];

  const getRiskColorClass = (score: number) => {
    if (score < 40) return { text: "text-emerald-600", bg: "bg-emerald-50/50 border-emerald-200", badge: "bg-emerald-100 text-emerald-800", level: "Low Risk" };
    if (score < 70) return { text: "text-amber-600", bg: "bg-amber-50/50 border-amber-200", badge: "bg-amber-100 text-amber-800", level: "Moderate Risk" };
    return { text: "text-red-600", bg: "bg-red-50/50 border-red-200", badge: "bg-red-100 text-red-800", level: "High Risk" };
  };

  const riskMeta = getRiskColorClass(riskScore);

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-primary">Risk Analysis</h3>
          <p className="text-xs text-muted font-medium mt-1">
            Periode: <span className="text-primary font-bold">{behaviorPeriodDates[riskPeriod]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-semibold">Analisis Periode:</span>
          <select
            value={riskPeriod}
            onChange={(e) => setRiskPeriod(e.target.value as RiskPeriodType)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary font-poppins focus:outline-none cursor-pointer"
          >
            <option value="hari">Hari Ini</option>
            <option value="7hari">7 Hari Terakhir</option>
            <option value="30hari">30 Hari Terakhir</option>
            <option value="custom">Custom (1 Mei - 31 Mei)</option>
          </select>
        </div>
      </div>

      {/* Risk Score Gauge & Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Widget */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[320px]">
          <div>
            <h3 className="font-bold text-base text-primary">Risk Score</h3>
            <p className="text-[10px] text-muted font-light mt-0.5">Tingkat kecanduan media sosial Anda (Skor 0 - 100)</p>
          </div>
          <div className="my-5 relative flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-12 border-muted-light flex items-center justify-center relative">
              <div
                className={`absolute top-0 left-0 w-full h-full rounded-full border-12 transform -rotate-45 ${
                  riskScore < 40 ? "border-emerald-500" : riskScore < 70 ? "border-amber-500" : "border-red-500"
                }`}
                style={{ clipPath: `polygon(50% 50%, -50% -50%, ${riskScore}% -50%, ${riskScore}% ${riskScore}%, 50% 50%)` }}
              />
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-4xl font-black text-primary">{riskScore}</span>
                <span className={`text-xs font-bold ${riskMeta.text}`}>{riskMeta.level}</span>
              </div>
            </div>
          </div>
          <div>
            <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide ${riskMeta.badge}`}>
              {riskMeta.level}
            </span>
          </div>
        </div>

        {/* Risk Contributors */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-base text-primary">Risk Contributors</h3>
            <p className="text-xs text-muted font-light mt-0.5">Faktor-faktor utama yang memicu naiknya tingkat risiko Anda hari ini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskContributors.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="p-4 rounded-2xl border border-border bg-background hover:bg-muted-light/10 transition-all flex gap-3 items-start">
                  <div className="p-2 bg-secondary/5 rounded-xl border border-secondary/10 text-secondary shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{c.name}</span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${c.impactColor}`}>
                        {c.impact}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted font-light leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Trend & Risk Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-primary">Risk Trend</h3>
              <p className="text-xs text-muted font-light mt-0.5">Perkembangan tingkat risiko Anda selama 4 minggu terakhir.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Membaik</span>
            </span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#113a5d" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#113a5d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e8ef" />
                <XAxis dataKey="week" stroke="#506e86" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#506e86" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    borderColor: "#e1e8ef",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="riskScore" stroke="#113a5d" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Explanation */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary flex items-center gap-1.5">
              <Info className="w-4 h-4 text-secondary" />
              <span>Penjelasan Risiko</span>
            </h3>
            <div className="space-y-3.5 text-xs text-muted leading-relaxed font-light font-poppins">
              <p>
                Tingkat risiko dihitung berdasarkan instrumen **Bergen Social Media Addiction Scale (BSMAS)** yang mengevaluasi enam aspek perilaku:
              </p>
              <ul className="space-y-2 text-[11px] font-medium text-primary">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  Salience (Pikiran didominasi medsos)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  Tolerance (Meningkatkan durasi akses)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  Mood Modification (Mencari pelarian)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  Relapse (Gagal mengurangi pemakaian)
                </li>
              </ul>
              <p>
                Risiko **Moderate** menandakan Anda menunjukkan tanda-tanda kecanduan situasional (misal scroll malam dan distraksi kerja) yang berpotensi menjadi permanen jika tidak diintervensi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Timeline Section */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-primary">Risk Timeline</h3>
          <p className="text-xs text-muted font-light mt-0.5">Daftar kronologis insiden perilaku berisiko yang terdeteksi pada perangkat Anda.</p>
        </div>
        <div className="relative border-l-2 border-border pl-6 ml-4 space-y-6 pt-2">
          {riskTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1">
              {/* Dot indicator */}
              <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-card bg-primary flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
              <span className="text-[10px] text-muted font-bold tracking-wider">{item.time}</span>
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold text-primary">{item.title}</h4>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
