import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Comparison {
  duration: string;
  durationText: string;
  flags: string;
  flagsText: string;
  overall: string;
}

interface InsightDetail {
  week_start: string;
  week_end: string;
  weekly_status: string;
  ai_weekly_status_label: string;
  ai_weekly_desc: string;
  emoji: string;
  avg_score: number;
  positive: string;
  concern: string;
  analysis: string;
  tips: string[];
  comparison: Comparison;
}

// Mock database details for older weeks
const pastInsightsDetails: Record<string, InsightDetail> = {
  "w-prev-1": {
    week_start: "19 Mei",
    week_end: "25 Mei 2026",
    weekly_status: "heavy",
    ai_weekly_status_label: "Minggu yang Cukup Berat Secara Digital",
    ai_weekly_desc:
      "Tingkat screen time meningkat tajam di akhir pekan terutama pada aplikasi TikTok.",
    emoji: "😟",
    avg_score: 72,
    positive:
      "Kamu berupaya mematikan HP pada hari Kamis malam untuk tidur tepat waktu.",
    concern:
      "Terdeteksi 4 sesi bermain HP nonstop lebih dari 1 jam di hari Sabtu dan Minggu.",
    analysis:
      "Pola akhir pekan menunjukkan penurunan kontrol diri yang cukup signifikan. Peningkatan aktivitas TikTok didorong oleh scroll video larut malam di atas jam 23:00.",
    tips: [
      "Letakkan HP minimal 2 meter dari kasur saat tidur untuk meminimalkan midnight usage",
      "Pasang batas pemakaian TikTok maksimal 45 menit per hari",
      "Sisipkan jeda berdiri 5 menit setiap bermain HP selama 30 menit",
    ],
    comparison: {
      duration: "up", // up | down | same
      durationText: "Naik 1j 45m dibanding minggu sebelumnya",
      flags: "lebih banyak",
      flagsText: "Lebih banyak 2 flag dibanding minggu sebelumnya",
      overall: "Memburuk",
    },
  },
  "w-prev-2": {
    week_start: "12 Mei",
    week_end: "18 Mei 2026",
    weekly_status: "attention",
    ai_weekly_status_label: "Minggu yang Cukup Padat",
    ai_weekly_desc:
      "Ada beberapa kecenderungan scroll berlebihan di jam produktif siang hari.",
    emoji: "😐",
    avg_score: 58,
    positive: "Tidur malam terjaga dengan baik hampir setiap hari kerja.",
    concern:
      "Membuka Instagram secara berulang-ulang saat jam kerja kantor (09:00 - 12:00).",
    analysis:
      "Kebiasaan memeriksa Instagram setiap beberapa menit (compulsive checking) masih sering muncul di jam produktif. Disarankan untuk menggunakan pemblokir situs sementara.",
    tips: [
      "Aktifkan mode fokus saat jam kerja 08:00 - 17:00",
      "Batasi membuka Instagram hanya setelah makan siang",
      "Matikan notifikasi Instagram yang tidak mendesak",
    ],
    comparison: {
      duration: "down",
      durationText: "Turun 45m dibanding minggu sebelumnya",
      flags: "lebih sedikit",
      flagsText: "Lebih sedikit 1 flag dibanding minggu sebelumnya",
      overall: "Membaik",
    },
  },
  "w-prev-3": {
    week_start: "5 Mei",
    week_end: "11 Mei 2026",
    weekly_status: "good",
    ai_weekly_status_label: "Minggu yang Sangat Baik!",
    ai_weekly_desc:
      "Penggunaan HP-mu terkontrol dengan sangat baik di semua rentang waktu.",
    emoji: "😊",
    avg_score: 35,
    positive:
      "Sangat jarang membuka medsos di jam produktif. Kontrol luar biasa!",
    concern:
      "Hanya sedikit scroll Instagram di hari Minggu malam sebelum tidur.",
    analysis:
      "Minggu ini menjadi performa terbaikmu. Kamu berhasil membagi waktu antara HP dan porsi istirahat secara berimbang.",
    tips: [
      "Pertahankan rutinitas membatasi HP jam 22:00 malam",
      "Jaga konsistensi menolak godaan scrolling siang hari",
      "Rayakan pencapaian ini dengan hobi fisik di luar layar!",
    ],
    comparison: {
      duration: "down",
      durationText: "Turun 2j 15m dibanding minggu sebelumnya",
      flags: "lebih sedikit",
      flagsText: "Lebih sedikit 3 flag dibanding minggu sebelumnya",
      overall: "Stabil Membaik",
    },
  },
};

export async function generateStaticParams() {
  return [{ id: "w-prev-1" }, { id: "w-prev-2" }, { id: "w-prev-3" }];
}

export default async function DetailInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const detail = pastInsightsDetails[id] || pastInsightsDetails["w-prev-1"];

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "good":
        return {
          emoji: "😊",
          label: "Minggu yang Baik!",
          colorClass:
            "text-emerald-800 bg-emerald-50 border-emerald-200 shadow-xs",
        };
      case "attention":
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-amber-800 bg-amber-50 border-amber-200 shadow-xs",
        };
      case "heavy":
        return {
          emoji: "😟",
          label: "Minggu yang Cukup Berat",
          colorClass: "text-red-800 bg-red-50 border-red-200 shadow-xs",
        };
      default:
        return {
          emoji: "😐",
          label: "Minggu yang Cukup Padat",
          colorClass: "text-muted bg-muted-light/60 border-border shadow-xs",
        };
    }
  };

  // Helper mappers for comparisons
  const getDurationComparison = (duration: string) => {
    if (duration === "up") {
      return {
        label: "↑ Lebih lama",
        colorClass: "text-red-600 bg-red-50/50 border-red-100",
        icon: <TrendingUp className="w-4 h-4 text-red-500 shrink-0" />,
      };
    }
    if (duration === "down") {
      return {
        label: "↓ Lebih singkat",
        colorClass: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
        icon: <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />,
      };
    }
    return {
      label: "→ Sama",
      colorClass: "text-slate-600 bg-slate-50/50 border-slate-100",
      icon: <Minus className="w-4 h-4 text-slate-500 shrink-0" />,
    };
  };

  const getFlagsComparison = (flags: string) => {
    const isMore = flags.includes("banyak");
    const isLess = flags.includes("sedikit");
    if (isMore) {
      return {
        label: "Lebih banyak",
        colorClass: "text-red-700 bg-red-50/50 border-red-100",
      };
    }
    if (isLess) {
      return {
        label: "Lebih sedikit",
        colorClass: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
      };
    }
    return {
      label: "Sama",
      colorClass: "text-slate-600 bg-slate-50/50 border-slate-100",
    };
  };

  const getOverallComparison = (overall: string) => {
    const text = overall.toLowerCase();
    if (text.includes("memburuk")) {
      return {
        label: "Memburuk",
        colorClass: "text-red-700 bg-red-50/50 border-red-100 font-bold",
      };
    }
    if (text.includes("membaik")) {
      return {
        label: "Membaik",
        colorClass:
          "text-emerald-700 bg-emerald-50/50 border-emerald-100 font-bold",
      };
    }
    return {
      label: "Stabil",
      colorClass: "text-slate-700 bg-slate-50/50 border-slate-100 font-bold",
    };
  };

  const durComp = getDurationComparison(detail.comparison.duration);
  const flagComp = getFlagsComparison(detail.comparison.flags);
  const overallComp = getOverallComparison(detail.comparison.overall);

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
      {(() => {
        const cond = getStatusDetails(detail.weekly_status);
        return (
          <div
            className={`p-6 rounded-3xl border flex items-center gap-4 ${cond.colorClass}`}
          >
            <span
              className="text-4xl select-none"
              role="img"
              aria-label="Status Emoji"
            >
              {cond.emoji}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-75">
                Status Rata-rata
              </span>
              <h3 className="text-base sm:text-lg font-black">{cond.label}</h3>
              <p className="text-xs font-light mt-0.5 leading-relaxed opacity-95">
                Rata-rata skor perilakumu berada pada {detail.avg_score}/100.{" "}
                {detail.ai_weekly_status_label}.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Comparison section */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
          <Clock className="w-4.5 h-4.5 text-muted shrink-0" />
          <span>Dibanding Minggu Sebelumnya</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Durasi HP */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Durasi pakai HP
            </span>
            <div>
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${durComp.colorClass}`}
              >
                {durComp.icon}
                <span>{durComp.label}</span>
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                {detail.comparison.durationText}
              </p>
            </div>
          </div>

          {/* Kebiasaan Bermasalah */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Kebiasaan Bermasalah
            </span>
            <div>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${flagComp.colorClass}`}
              >
                {flagComp.label}
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                {detail.comparison.flagsText}
              </p>
            </div>
          </div>

          {/* Kondisi Keseluruhan */}
          <div className="p-4 rounded-2xl border border-border/60 bg-background/40 space-y-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">
              Kondisi Keseluruhan
            </span>
            <div>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] ${overallComp.colorClass}`}
              >
                {overallComp.label}
              </div>
              <p className="text-[10px] text-muted font-light mt-1.5 leading-snug">
                Pola perilaku secara umum menunjukkan tanda stabilisasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yang Sudah Dilakukan dengan Baik */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span>Yang Sudah Dilakukan dengan Baik 👍</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {detail.positive}
          </p>
        </div>

        {/* Yang Perlu Diperhatikan */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
            <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <span>Yang Perlu Diperhatikan ⚠️</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {detail.concern}
          </p>
        </div>
      </div>

      {/* Analisis AI */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Brain className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Analisis Minggu Itu 🤖
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
          {detail.analysis}
        </p>
      </div>

      {/* Tips yang Diberikan */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Lightbulb className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Tips yang Diberikan 💡
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {detail.tips.map((tip: string, idx: number) => (
            <div
              key={tip}
              className="p-4 rounded-2xl border border-border/60 bg-muted-light/10 space-y-2 flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Saran 0{idx + 1}
              </span>
              <p className="text-xs text-primary font-semibold leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
