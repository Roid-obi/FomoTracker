import { NextResponse } from "next/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { getByIdService } from "@/lib/services/insight.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

const formatSecToHoursMins = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

/**
 * GET /api/insight/[id]
 *
 * Mengembalikan detail lengkap satu weekly insight berdasarkan ID.
 * Hanya bisa diakses oleh pemilik insight (verifikasi via userId).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json(
        { error: "ID insight tidak valid" },
        { status: 400 },
      );
    }

    // Authenticate user
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak terautentikasi" },
        { status: 401 },
      );
    }

    const result = await getByIdService(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const insight = result.data;

    // Find previous week's details for comparison
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

    // Calculate comparisons
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

    return NextResponse.json({
      success: true,
      data: {
        ...insight,
        comparison: {
          comparisonDuration,
          comparisonDurationText,
          comparisonFlags,
          comparisonFlagsText,
          comparisonOverall,
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
