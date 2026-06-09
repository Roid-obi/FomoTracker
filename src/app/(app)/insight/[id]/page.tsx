import { and, eq, gte, lte, sql } from "drizzle-orm";
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
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { getByIdService } from "@/lib/services/insight.service";

export const dynamic = "force-dynamic";

const formatSecToHoursMins = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

const formatPeriodRange = (startStr: string, endStr: string) => {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
};

export default async function DetailInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 1. Authenticate user
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. Fetch insight details
  const result = await getByIdService(id);
  if (!result.success) {
    notFound();
  }
  const insight = result.data;

  // 3. Find previous week's details for comparison
  const prevWeekStart = new Date(`${insight.weekStart}T00:00:00Z`);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const prevWeekStartStr = prevWeekStart.toISOString().slice(0, 10);

  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setUTCDate(prevWeekStart.getUTCDate() + 6);
  const prevWeekEndStr = prevWeekEnd.toISOString().slice(0, 10);

  const [prevInsight] = await db
    .select({
      totalScreenTimeSeconds: table.weeklyInsights.totalScreenTimeSeconds,
      avgBehavioralScore: table.weeklyInsights.avgBehavioralScore,
    })
    .from(table.weeklyInsights)
    .where(
      and(
        eq(table.weeklyInsights.userId, user.id),
        eq(table.weeklyInsights.weekStart, prevWeekStartStr),
        eq(table.weeklyInsights.generationStatus, "generated"),
      ),
    )
    .limit(1);

  // 4. Calculate comparisons
  let comparisonDuration = "same";
  let comparisonDurationText = "Tidak ada data pembanding minggu sebelumnya";
  let comparisonFlags = "sama";
  let comparisonFlagsText = "Tidak ada data pembanding minggu sebelumnya";
  let comparisonOverall = "Stabil";

  if (prevInsight) {
    // Screen time comparison
    const timeDiff =
      insight.totalScreenTimeSeconds - prevInsight.totalScreenTimeSeconds;
    if (timeDiff > 0) {
      comparisonDuration = "up";
      comparisonDurationText = `Naik ${formatSecToHoursMins(timeDiff)} dibanding minggu sebelumnya`;
    } else if (timeDiff < 0) {
      comparisonDuration = "down";
      comparisonDurationText = `Turun ${formatSecToHoursMins(Math.abs(timeDiff))} dibanding minggu sebelumnya`;
    } else {
      comparisonDuration = "same";
      comparisonDurationText = "Sama dengan minggu sebelumnya";
    }

    // Score comparison (lower score is better)
    const scoreDiff =
      insight.avgBehavioralScore - prevInsight.avgBehavioralScore;
    if (scoreDiff < 0) {
      comparisonOverall = "Membaik";
    } else if (scoreDiff > 0) {
      comparisonOverall = "Memburuk";
    } else {
      comparisonOverall = "Stabil";
    }

    // Query flag count for both weeks to compare flags
    const queryFlagsCount = async (start: string, end: string) => {
      const [row] = await db
        .select({
          excessive: sql<number>`sum(case when ${table.behavioralScores.flagExcessiveUsage} = true then 1 else 0 end)`,
          compulsive: sql<number>`sum(case when ${table.behavioralScores.flagCompulsiveChecking} = true then 1 else 0 end)`,
          midnight: sql<number>`sum(case when ${table.behavioralScores.flagMidnightUsage} = true then 1 else 0 end)`,
          continuous: sql<number>`sum(case when ${table.behavioralScores.flagContinuousUsage} = true then 1 else 0 end)`,
          distraction: sql<number>`sum(case when ${table.behavioralScores.flagProductiveHourDistraction} = true then 1 else 0 end)`,
        })
        .from(table.behavioralScores)
        .where(
          and(
            eq(table.behavioralScores.userId, user.id),
            gte(table.behavioralScores.scoreDate, start),
            lte(table.behavioralScores.scoreDate, end),
          ),
        );
      return (
        Number(row?.excessive ?? 0) +
        Number(row?.compulsive ?? 0) +
        Number(row?.midnight ?? 0) +
        Number(row?.continuous ?? 0) +
        Number(row?.distraction ?? 0)
      );
    };

    const currentFlagsSum = await queryFlagsCount(
      insight.weekStart,
      insight.weekEnd,
    );
    const prevFlagsSum = await queryFlagsCount(
      prevWeekStartStr,
      prevWeekEndStr,
    );

    const flagDiff = currentFlagsSum - prevFlagsSum;
    if (flagDiff > 0) {
      comparisonFlags = "lebih banyak";
      comparisonFlagsText = `Lebih banyak ${flagDiff} flag dibanding minggu sebelumnya`;
    } else if (flagDiff < 0) {
      comparisonFlags = "lebih sedikit";
      comparisonFlagsText = `Lebih sedikit ${Math.abs(flagDiff)} flag dibanding minggu sebelumnya`;
    } else {
      comparisonFlags = "sama";
      comparisonFlagsText = "Jumlah flag sama dengan minggu sebelumnya";
    }
  }

  // Parse tips
  let tips: string[] = [];
  if (insight.aiTips) {
    try {
      tips = JSON.parse(insight.aiTips);
    } catch {
      tips = [];
    }
  }

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

  const cond = getStatusDetails(insight.weeklyStatus);
  const durComp = getDurationComparison(comparisonDuration);
  const flagComp = getFlagsComparison(comparisonFlags);
  const overallComp = getOverallComparison(comparisonOverall);

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
          Insight Minggu:{" "}
          {formatPeriodRange(insight.weekStart, insight.weekEnd)}
        </h1>
      </div>

      {/* Kondisi Minggu Itu */}
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
            Rata-rata skor perilakumu berada pada {insight.avgBehavioralScore}
            /100. {insight.aiWeeklyStatusLabel}.
          </p>
        </div>
      </div>

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
                {comparisonDurationText}
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
                {comparisonFlagsText}
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
                Pola perilaku secara umum menunjukkan tanda{" "}
                {comparisonOverall.toLowerCase() === "membaik"
                  ? "peningkatan kontrol diri"
                  : comparisonOverall.toLowerCase() === "memburuk"
                    ? "penurunan kontrol diri"
                    : "stabilisasi"}
                .
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
            <span>Yang Sudah Dilakukan dengan Baik</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {insight.aiPositiveNotes || "Tidak ada catatan khusus."}
          </p>
        </div>

        {/* Yang Perlu Diperhatikan */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-primary flex items-center gap-2 border-b border-border/40 pb-2">
            <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <span>Yang Perlu Diperhatikan</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed font-light">
            {insight.aiConcernNotes || "Tidak ada catatan khusus."}
          </p>
        </div>
      </div>

      {/* Analisis AI */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Brain className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Analisis Minggu Itu
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted leading-relaxed font-light whitespace-pre-line">
          {insight.aiAnalysis}
        </p>
      </div>

      {/* Tips yang Diberikan */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Lightbulb className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-primary">
            Tips yang Diberikan
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.length === 0 ? (
            <p className="text-xs text-muted font-light">
              Tidak ada saran khusus.
            </p>
          ) : (
            tips.map((tip: string, idx: number) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
