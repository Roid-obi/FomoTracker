"use client";

import {
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock Historical Data
const PAST_INSIGHTS = [
  {
    id: "w3",
    period: "10 Mei – 16 Mei 2026",
    score: 65,
    risk: "High",
    riskColor: "bg-red-100 text-red-800 border-red-200",
    summary:
      "Terjadi peningkatan durasi screen time di hari libur sebesar 45%. Sesi malam hari sangat mendominasi aktivitas.",
    details:
      "Pada pertengahan Mei, kami mencatat kenaikan signifikan pada penggunaan YouTube di tablet/browser Anda pada hari Sabtu dan Minggu. Total screen time harian menyentuh angka 6.2 jam. Kontributor utama adalah binge-watching video hiburan. Kami merekomendasikan pengetatan kuota harian khusus weekend.",
    recommendations: [
      "Batas 2 Jam Weekend: Terapkan batas waktu kumulatif maksimal 2 jam untuk hari Sabtu dan Minggu.",
      "No Screen Zone: Definisikan area meja makan sebagai area bebas gadget.",
    ],
  },
  {
    id: "w2",
    period: "3 Mei – 9 Mei 2026",
    score: 72,
    risk: "Moderate",
    riskColor: "bg-amber-100 text-amber-800 border-amber-200",
    summary:
      "Penggunaan jam kerja produktif membaik secara perlahan. Namun, frekuensi mengecek notifikasi instan masih tinggi.",
    details:
      "Skor perilaku Anda naik menjadi 72 karena Anda sukses menekan pemakaian Instagram di sela-sela jam kantor. Masalah yang tersisa adalah kebiasaan membuka WhatsApp Web secara berulang setiap 5 menit. Disarankan menutup tab WhatsApp Web saat membutuhkan konsentrasi penuh.",
    recommendations: [
      "Tab Pemblokir Mandiri: Gunakan pemblokir situs web untuk menutup akses chat selama sesi fokus.",
      "Metode Pomodoro: Terapkan jeda 5 menit setiap 25 menit bekerja.",
    ],
  },
  {
    id: "w1",
    period: "26 Apr – 2 Mei 2026",
    score: 75,
    risk: "Low",
    riskColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    summary:
      "Awal pelacakan yang sehat. Kontrol diri prima dengan tingkat istirahat malam yang sangat teratur.",
    details:
      "Minggu pertama perekaman menunjukkan performa ideal. Screen time harian rata-rata berada pada 2.5 jam. Tidak terdeteksi adanya pelanggaran jam malam atau distraksi jam produktif yang berat. Pertahankan kestabilan ini.",
    recommendations: [
      "Pertahankan Rutinitas: Jaga konsistensi jadwal tidur pukul 22:00.",
      "Review Harian: Buka dashboard setiap malam untuk memantau performa.",
    ],
  },
];

export default function InsightHistoryPage() {
  const [selectedMonth, setSelectedMonth] = useState("Mei");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Riwayat AI Insight
          </h1>
          <p className="text-sm text-muted font-light mt-1">
            Telusuri arsip analisis mingguan Anda untuk memantau perkembangan
            jangka panjang
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto select-none">
          <Link
            href="/insight/latest"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-light/60 hover:text-primary transition-all border border-border"
          >
            Insight Terbaru
          </Link>
          <Link
            href="/insight/history"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white shadow-xs"
          >
            Riwayat Insight
          </Link>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-4 shadow-xs">
        <span className="text-xs font-semibold text-primary">Filter Arsip</span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
        >
          <option value="Mei">Mei 2026</option>
          <option value="April">April 2026</option>
        </select>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {PAST_INSIGHTS.map((report) => {
          const isExpanded = expandedCard === report.id;
          return (
            <div
              key={report.id}
              className="bg-card border border-border rounded-3xl overflow-hidden transition-all shadow-xs"
            >
              {/* Card Header (always visible) */}
              <button
                type="button"
                onClick={() => toggleExpand(report.id)}
                className="w-full text-left p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted-light/20 select-none flex-col sm:flex-row bg-transparent border-none focus:outline-none"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted shrink-0" />
                    <span className="text-sm font-bold text-primary">
                      {report.period}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${report.riskColor}`}
                    >
                      {report.risk} Risk
                    </span>
                  </div>
                  <p className="text-xs text-muted font-light leading-relaxed max-w-xl">
                    {report.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t border-border pt-4 sm:border-none sm:pt-0 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted font-light">
                      Skor Perilaku
                    </span>
                    <span className="text-lg font-black text-primary">
                      {report.score}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted-light/50 text-primary">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expandable Content Panel */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-4 border-t border-border bg-muted-light/5 space-y-4 animate-page-enter">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Analisis Detail</span>
                    </h4>
                    <p className="text-xs text-muted font-light leading-relaxed">
                      {report.details}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                      Rekomendasi
                    </h4>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec) => (
                        <li
                          key={rec}
                          className="flex gap-2 items-start text-xs text-muted font-light"
                        >
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
  );
}
