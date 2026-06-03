import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// Mock database details for older weeks
const pastInsightsDetails: Record<string, any> = {
  "w-prev-1": {
    week_start: "19 Mei 2026",
    week_end: "25 Mei 2026",
    weekly_status: "heavy",
    ai_weekly_status_label: "Minggu yang Cukup Berat Secara Digital",
    ai_weekly_desc: "Tingkat screen time meningkat tajam di akhir pekan terutama pada aplikasi TikTok.",
    emoji: "😟",
    avg_score: 72,
    positive: "Kamu berupaya mematikan HP pada hari Kamis malam untuk tidur tepat waktu.",
    concern: "Terdeteksi 4 sesi bermain HP nonstop lebih dari 1 jam di hari Sabtu dan Minggu.",
    analysis: "Pola akhir pekan menunjukkan penurunan kontrol diri yang cukup signifikan. Peningkatan aktivitas TikTok didorong oleh scroll video larut malam di atas jam 23:00.",
    tips: [
      "Letakkan HP minimal 2 meter dari kasur saat tidur",
      "Pasang batas pemakaian TikTok maksimal 45 menit",
      "Sisipkan jeda berdiri 5 menit setiap bermain HP 30 menit"
    ],
    comparison: {
      duration: "up", // up | down | same
      durationText: "Naik 1j 45m dibanding minggu sebelumnya",
      flags: "lebih banyak",
      flagsText: "Lebih banyak 2 flag dibanding minggu sebelumnya",
      overall: "Memburuk",
      overallColor: "text-red-500 font-bold"
    }
  },
  "w-prev-2": {
    week_start: "12 Mei 2026",
    week_end: "18 Mei 2026",
    weekly_status: "attention",
    ai_weekly_status_label: "Minggu yang Cukup Padat",
    ai_weekly_desc: "Ada beberapa kecenderungan scroll berlebihan di jam produktif siang hari.",
    emoji: "😐",
    avg_score: 58,
    positive: "Tidur malam terjaga dengan baik hampir setiap hari kerja.",
    concern: "Membuka Instagram secara berulang-ulang saat jam kerja kantor (09:00 - 12:00).",
    analysis: "Kebiasaan memeriksa Instagram setiap beberapa menit (compulsive checking) masih sering muncul di jam produktif. Disarankan untuk menggunakan pemblokir situs sementara.",
    tips: [
      "Aktifkan mode fokus saat jam kerja 08:00 - 17:00",
      "Batasi membuka Instagram hanya setelah makan siang",
      "Matikan notifikasi Instagram yang tidak mendesak"
    ],
    comparison: {
      duration: "down",
      durationText: "Turun 45m dibanding minggu sebelumnya",
      flags: "lebih sedikit",
      flagsText: "Lebih sedikit 1 flag dibanding minggu sebelumnya",
      overall: "Membaik",
      overallColor: "text-emerald-600 font-bold"
    }
  },
  "w-prev-3": {
    week_start: "5 Mei 2026",
    week_end: "11 Mei 2026",
    weekly_status: "good",
    ai_weekly_status_label: "Minggu yang Sangat Baik!",
    ai_weekly_desc: "Penggunaan HP-mu terkontrol dengan sangat baik di semua rentang waktu.",
    emoji: "😊",
    avg_score: 35,
    positive: "Sangat jarang membuka medsos di jam produktif. Kontrol luar biasa!",
    concern: "Hanya sedikit scroll Instagram di hari Minggu malam sebelum tidur.",
    analysis: "Minggu ini menjadi performa terbaikmu. Kamu berhasil membagi waktu antara HP dan porsi istirahat secara berimbang.",
    tips: [
      "Pertahankan rutinitas membatasi HP jam 22:00 malam",
      "Jaga konsistensi menolak godaan scrolling siang hari",
      "Rayakan pencapaian ini dengan hobi fisik di luar layar!"
    ],
    comparison: {
      duration: "down",
      durationText: "Turun 2j 15m dibanding minggu sebelumnya",
      flags: "lebih sedikit",
      flagsText: "Lebih sedikit 3 flag dibanding minggu sebelumnya",
      overall: "Stabil Membaik",
      overallColor: "text-emerald-600 font-bold"
    }
  }
};

export async function generateStaticParams() {
  return [
    { id: "w-prev-1" },
    { id: "w-prev-2" },
    { id: "w-prev-3" },
  ];
}

export default async function DetailInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const detail = pastInsightsDetails[id] || pastInsightsDetails["w-prev-1"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "attention":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "heavy":
        return "text-red-500 bg-red-50 border-red-100";
      default:
        return "text-muted bg-muted-light/50 border-border";
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Back Button */}
      <Link
        href="/insight"
        className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Insight
      </Link>

      {/* Header */}
      <div>
        <span className="text-[10px] text-muted font-bold tracking-wider uppercase bg-muted-light/60 border border-border px-3 py-1 rounded-full">
          Detail Laporan Mingguan
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight mt-2.5">
          Insight Minggu: {detail.week_start} – {detail.week_end}
        </h1>
      </div>

      {/* Kondisi Minggu Itu */}
      <div className={`p-6 rounded-3xl border flex items-center gap-4 ${getStatusColor(detail.weekly_status)}`}>
        <span className="text-4xl select-none">{detail.emoji}</span>
        <div>
          <h3 className="text-lg font-black">{detail.ai_weekly_status_label}</h3>
          <p className="text-xs font-light mt-0.5 leading-relaxed">
            {detail.ai_weekly_desc} (Skor Rata-rata: {detail.avg_score}/100)
          </p>
        </div>
      </div>

      {/* Comparison section */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-muted" />
          <span>Dibanding Minggu Sebelumnya</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Durasi pakai HP</span>
            <div className="flex items-center gap-1.5 mt-1">
              {detail.comparison.duration === "up" ? (
                <TrendingUp className="w-4.5 h-4.5 text-red-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              )}
              <span className="text-xs font-bold text-primary">{detail.comparison.durationText}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Kebiasaan Bermasalah</span>
            <p className="text-xs font-bold text-primary mt-1">{detail.comparison.flagsText}</p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Kondisi Keseluruhan</span>
            <p className={`text-xs mt-1 ${detail.comparison.overallColor}`}>{detail.comparison.overall}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yang Sudah Dilakukan dengan Baik */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>Yang Sudah Dilakukan dengan Baik 👍</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {detail.positive}
          </p>
        </div>

        {/* Yang Perlu Diperhatikan */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 text-amber-500" />
            <span>Yang Perlu Diperhatikan ⚠️</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {detail.concern}
          </p>
        </div>
      </div>

      {/* Analisis AI */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-base text-primary">Analisis Minggu Itu 🤖</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
          {detail.analysis}
        </p>
      </div>

      {/* Tips yang Diberikan */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-base text-primary">Tips yang Diberikan 💡</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {detail.tips.map((tip: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-border/60 bg-muted-light/10 space-y-2 flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Saran 0{idx + 1}</span>
              <p className="text-xs text-primary font-semibold leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
