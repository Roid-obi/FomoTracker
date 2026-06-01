"use client";

import { Bookmark, Brain, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Info, Share2, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { insightDummy } from "@/lib/databases/dummyData";

const PAST_INSIGHTS = insightDummy.pastInsights;

export default function InsightPage() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const analysisPeriod = insightDummy.analysisPeriod;
  const recommendationList = insightDummy.recommendationList;

  return (
    <div className="space-y-6 font-poppins relative">
      {/* Simulation Toggle float/badge */}
      <div className="flex justify-end select-none">
        <button
          type="button"
          onClick={() => setIsNewUser(!isNewUser)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow-xs cursor-pointer ${
            isNewUser ? "bg-secondary border-secondary text-white" : "bg-card border-border text-muted hover:text-primary hover:bg-muted-light/20"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isNewUser ? "Simulasi Pengguna Baru (Aktif)" : "Simulasikan Pengguna Baru (< 7 Hari)"}</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">AI Insight Personal</h1>
        <p className="text-sm text-muted font-light mt-1">Analisis kecerdasan buatan terhadap pola perilaku digital dan risiko penggunaan gawai Anda</p>
      </div>

      {/* RENDER NEW USER BANNER AND MOCK INTERFACE */}
      {isNewUser ? (
        <div className="space-y-6 animate-page-enter">
          {/* Scientific study tracking banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-4 items-start shadow-xs">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-amber-900">Sedang mempelajari pola penggunaan Anda</h3>
              <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed font-light">
                Analisis penuh dan refleksi kecerdasan buatan akan otomatis tersedia setelah **minimal 7 hari** data aktivitas digital Anda terkumpul.
              </p>
              <div className="pt-2 max-w-md">
                <div className="flex justify-between text-[10px] text-amber-800 font-semibold mb-1">
                  <span>Progres Pengumpulan Data</span>
                  <span>2 dari 7 Hari (28%)</span>
                </div>
                <div className="w-full h-2 bg-amber-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Locked features placeholder */}
          <div className="relative rounded-3xl border border-dashed border-border p-12 text-center bg-card/40 overflow-hidden select-none">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-muted-light/60 text-muted mx-auto flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-primary">Analisis Perilaku Mingguan Belum Tersedia</h4>
              <p className="text-xs text-muted font-light leading-relaxed">
                Asisten AI memerlukan riwayat data aktivitas digital yang cukup (minimal 7 hari) untuk mengenali kecenderungan screen time malam hari, open frequency, dan jam produktif Anda secara
                akurat.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* RENDER FULL ANALYSIS FOR OLD USER */
        <div className="space-y-6 animate-page-enter">
          {/* Latest Insight Card */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Calendar className="w-4 h-4 text-muted" />
                <span>Periode Analisis: {analysisPeriod}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Pola: Moderate Risk</span>
              </div>
            </div>

            {/* Executive summary banner */}
            <div className="p-5 rounded-2xl bg-muted-light/30 border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-primary">Behavioral Summary (Ringkasan Perilaku)</h3>
              <p className="text-xs text-muted font-light leading-relaxed">
                "Kecenderungan adiksi media sosial tingkat menengah (Moderate) dengan fokus distraksi tinggi pada jam produktif siang hari dan sesi scroll impulsif pada tengah malam."
              </p>
            </div>

            {/* Detailed AI commentary */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">AI Analysis</h3>
              <div className="space-y-4 text-xs sm:text-sm text-muted font-light leading-relaxed">
                <p>
                  Berdasarkan data aktivitas pelacakan dari perangkat Anda minggu ini, FomoTracker mendeteksi peningkatan screen time yang cukup konstan pada aplikasi hiburan visual, khususnya TikTok
                  dan Instagram. Jam aktif terpadat Anda bergeser ke pukul 20:00 – 22:30, yang beririsan langsung dengan jam persiapan istirahat biologis Anda. Keterlambatan tidur di hari Kamis malam
                  disebabkan oleh aktivitas menatap layar selama lebih dari 30 menit tanpa henti setelah pukul 23:00.
                </p>
                <p>
                  Selanjutnya, pada jam produktif (08:00 – 17:00), kami mendeteksi pola pengecekan impulsif (Compulsive Checking) di mana aplikasi Instagram dibuka lebih dari 12 kali dalam selang
                  waktu 1 jam, meskipun rata-rata durasi per sesi hanya berkisar antara 2 hingga 5 menit. Perilaku mikro-distraksi ini memecah konsentrasi mendalam Anda dan memperlambat pencapaian
                  performa tugas harian Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Actionable recommendations */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-primary">Recommendations (Rekomendasi)</h3>
              <p className="text-xs text-muted font-light mt-0.5">Langkah konkret rekomendasi AI untuk memperbaiki kebiasaan Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendationList.map((rec) => (
                <div key={rec.title} className="p-5 rounded-2xl border border-border bg-card flex gap-3.5 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-primary">{rec.title}</h4>
                    <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 rounded-xl border border-border text-muted hover:text-primary transition-all cursor-pointer">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 rounded-xl border border-border text-muted hover:text-primary transition-all cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-primary">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Related Risk Factors: Midnight Usage, Distraction Tendency</span>
                </span>
              </div>
            </div>
          </div>

          {/* Insight History (Accordion List) */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary">Insight History</h3>
            <div className="space-y-3">
              {PAST_INSIGHTS.map((report) => {
                const isExpanded = expandedCard === report.id;
                return (
                  <div key={report.id} className="bg-card border border-border rounded-3xl overflow-hidden transition-all shadow-xs">
                    {/* Card Header */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(report.id)}
                      className="w-full text-left p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted-light/20 flex-col sm:flex-row bg-transparent border-none focus:outline-none"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-primary">{report.period}</span>
                          <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${report.riskColor}`}>{report.risk} Risk</span>
                        </div>
                        <p className="text-xs text-muted font-light leading-relaxed max-w-xl">{report.summary}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t border-border pt-3 sm:border-none sm:pt-0 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted font-light">Skor Perilaku</span>
                          <span className="text-sm font-black text-primary">{report.score}/100</span>
                        </div>
                        <div className="p-2 rounded-xl bg-muted-light/50 text-primary">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                      </div>
                    </button>

                    {/* Expandable Panel */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-border bg-muted-light/5 space-y-4 animate-page-enter">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            <span>Analisis Detail</span>
                          </h4>
                          <p className="text-xs text-muted font-light leading-relaxed">{report.details}</p>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Rekomendasi</h4>
                          <ul className="space-y-1.5">
                            {report.recommendations.map((rec) => (
                              <li key={rec} className="flex gap-2 items-start text-xs text-muted font-light">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
