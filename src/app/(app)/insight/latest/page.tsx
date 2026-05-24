"use client";

import {
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Share2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function LatestInsightPage() {
  const analysisPeriod = "17 Mei – 23 Mei 2026";
  const recommendationList = [
    {
      title: "Aktifkan Screen Time Limit TikTok",
      desc: "Batasi penggunaan harian TikTok maksimal 30 menit. Batas ini akan memicu peringatan keras saat Anda melewatinya.",
    },
    {
      title: "Jauhkan Ponsel 30 Menit Sebelum Tidur",
      desc: "Hindari membuka media sosial setelah jam 21:30. Letakkan ponsel di meja kerja atau di luar jangkauan tempat tidur Anda.",
    },
    {
      title: "Gunakan Mode Fokus Selama Jam Kerja",
      desc: "Aktifkan pemblokiran sementara untuk Instagram dan TikTok pada jam 08:00 – 17:00 untuk mengurangi distraksi impulsif.",
    },
    {
      title: "Lakukan Aktivitas Pengganti Malam Hari",
      desc: "Gantikan sesi scroll malam dengan membaca buku fisik atau jurnal harian guna mempermudah pelepasan melatonin alami.",
    },
  ];

  return (
    <div className="space-y-6 font-poppins">
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            AI Insight Personal
          </h1>
          <p className="text-sm text-muted font-light mt-1">
            Analisis kecerdasan buatan terhadap kebiasaan digital Anda
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto select-none">
          <Link
            href="/insight/latest"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white shadow-xs"
          >
            Insight Terbaru
          </Link>
          <Link
            href="/insight/history"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-light/60 hover:text-primary transition-all border border-border"
          >
            Riwayat Insight
          </Link>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        {/* Subheader info */}
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
          <h3 className="font-bold text-sm text-primary">
            Ringkasan Pola Perilaku
          </h3>
          <p className="text-xs text-muted font-light leading-relaxed">
            "Kecenderungan adiksi media sosial tingkat menengah (Moderate)
            dengan fokus distraksi tinggi pada jam produktif siang hari dan sesi
            scroll impulsif pada tengah malam."
          </p>
        </div>

        {/* Detailed AI commentary */}
        <div className="space-y-4 text-xs sm:text-sm text-muted font-light leading-relaxed">
          <p>
            Berdasarkan data aktivitas pelacakan dari perangkat Anda minggu ini,
            FomoTracker mendeteksi peningkatan screen time yang cukup konstan
            pada aplikasi hiburan visual, khususnya TikTok dan Instagram. Jam
            aktif terpadat Anda bergeser ke pukul 20:00 – 22:30, yang beririsan
            langsung dengan jam persiapan istirahat biologis Anda. Keterlambatan
            tidur di hari Kamis malam disebabkan oleh aktivitas menatap layar
            selama lebih dari 30 menit tanpa henti setelah pukul 23:00.
          </p>
          <p>
            Selanjutnya, pada jam produktif (08:00 – 17:00), kami mendeteksi
            pola pengecekan impulsif (Compulsive Checking) di mana aplikasi
            Instagram dibuka lebih dari 12 kali dalam selang waktu 1 jam,
            meskipun rata-rata durasi per sesi hanya berkisar antara 2 hingga 5
            menit. Perilaku mikro-distraksi ini memecah konsentrasi mendalam
            Anda dan memperlambat pencapaian performa tugas harian Anda.
          </p>
          <p>
            Meskipun demikian, ada kemajuan positif: total screen time mingguan
            Anda berhasil ditekan sebesar 8.5% berkat penurunan durasi bermain
            YouTube pada siang hari. Ini menunjukkan Anda memiliki kendali yang
            kuat jika dipandu dengan target batasan yang jelas.
          </p>
        </div>
      </div>

      {/* Actionable recommendations */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-base text-primary">
            Rekomendasi Personal Anda
          </h3>
          <p className="text-xs text-muted font-light mt-0.5">
            Langkah konkret yang dapat Anda lakukan hari ini
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendationList.map((rec, _index) => (
            <div
              key={rec.title}
              className="p-5 rounded-2xl border border-border bg-card flex gap-3.5 items-start"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-primary">
                  {rec.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-xl border border-border text-muted hover:text-primary transition-all"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-xl border border-border text-muted hover:text-primary transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/analytics?tab=behavior"
            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline self-start sm:self-auto"
          >
            <span>Analisis Perilaku Terkait</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
