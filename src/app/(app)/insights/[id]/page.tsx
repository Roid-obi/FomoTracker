import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ShieldAlert,
  Brain,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { insightDummy } from "@/lib/databases/dummyData";

// Define generateStaticParams to allow static export for dynamic route
export async function generateStaticParams() {
  return insightDummy.pastInsights.map((insight) => ({
    id: insight.id,
  }));
}

interface DetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function InsightDetailPage({ params }: DetailPageProps) {
  // Resolve params if it is a Promise (Next.js 15 compatibility)
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const pastInsights = insightDummy.pastInsights;
  const currentInsightIndex = pastInsights.findIndex((item) => item.id === id);

  if (currentInsightIndex === -1) {
    notFound();
  }

  const currentInsight = pastInsights[currentInsightIndex];

  // Previous week is the next element in reverse-chronological order (i.e. index + 1)
  const previousInsight =
    currentInsightIndex + 1 < pastInsights.length
      ? pastInsights[currentInsightIndex + 1]
      : null;

  // Comparison metrics
  let scoreDiff = 0;
  let scoreTrend: "better" | "worse" | "neutral" = "neutral";
  if (previousInsight) {
    scoreDiff = currentInsight.score - previousInsight.score;
    // Higher behavior score is better
    if (scoreDiff > 0) {
      scoreTrend = "better";
    } else if (scoreDiff < 0) {
      scoreTrend = "worse";
    }
  }

  return (
    <div className="space-y-6 font-poppins relative">
      {/* Back to History */}
      <div className="flex items-center">
        <Link
          href="/insights/history"
          className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-primary transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            AI Insight Detail
          </h1>
          <p className="text-sm text-muted font-light mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Laporan Periode: {currentInsight.period}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-extrabold px-3 py-1.5 rounded-full border uppercase shadow-xs ${currentInsight.riskColor}`}
          >
            {currentInsight.risk} Risk
          </span>
        </div>
      </div>

      {/* Grid Summary and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Card */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="p-5 rounded-2xl bg-muted-light/30 border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-primary" />
                <span>Executive Summary</span>
              </h3>
              <p className="text-xs text-muted font-light leading-relaxed">
                "{currentInsight.summary}"
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                AI Analysis & Commentary
              </h3>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed whitespace-pre-line">
                {currentInsight.details}
              </p>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-primary">
                Recommendations (Rekomendasi Terkait)
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Rekomendasi yang disusun AI khusus untuk periode ini
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentInsight.recommendations.map((rec, index) => (
                <div
                  key={rec}
                  className="p-5 rounded-2xl border border-border bg-card flex gap-3.5 items-start"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-primary">
                      Rekomendasi {index + 1}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed">
                      {rec}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Comparison & Stats */}
        <div className="space-y-6">
          {/* Score Circle Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Skor Perilaku Digital
            </h3>

            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted-light/30"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={
                    2 * Math.PI * 62 * (1 - currentInsight.score / 100)
                  }
                  className="text-primary"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-primary leading-none">
                  {currentInsight.score}
                </span>
                <span className="text-[10px] text-muted font-semibold mt-1">
                  Skor Total
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted font-light max-w-[200px] leading-relaxed">
              Skor perilaku merepresentasikan tingkat kesehatan penggunaan
              gadget Anda secara keseluruhan.
            </p>
          </div>

          {/* Comparison Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              Perbandingan Mingguan
            </h3>

            {previousInsight ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted font-light">
                    Skor Minggu Lalu
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {previousInsight.score}/100
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted font-light">
                    Perubahan Skor
                  </span>
                  <div className="flex items-center gap-1">
                    {scoreTrend === "better" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{scoreDiff}</span>
                      </span>
                    ) : scoreTrend === "worse" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{scoreDiff}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-muted">0</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted font-light">
                    Tingkat Risiko
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {previousInsight.risk} → {currentInsight.risk}
                  </span>
                </div>

                <div className="p-3 bg-muted-light/30 border border-border rounded-xl">
                  <p className="text-[11px] text-muted font-light leading-relaxed">
                    {scoreTrend === "better"
                      ? "Perilaku Anda menunjukkan perbaikan dibanding minggu sebelumnya. Pertahankan performa positif ini!"
                      : scoreTrend === "worse"
                        ? "Terdapat penurunan kualitas perilaku digital. Terapkan rekomendasi di samping untuk memperbaikinya."
                        : "Perilaku digital Anda relatif stabil dibanding minggu sebelumnya."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <ShieldAlert className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted font-light">
                  Ini adalah minggu pertama pelacakan Anda. Data perbandingan
                  akan tersedia di minggu berikutnya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
