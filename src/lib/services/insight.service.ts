import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { InsightModel } from "@/lib/models/insight.model";
import { generateWeeklyInsightAI } from "@/lib/utils/ai";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function validationError(error: z.ZodError) {
  return z.treeifyError(error);
}

/**
 * Hitung Senin & Minggu dari suatu minggu (berdasar weekStart).
 * Jika tidak diberikan, default = minggu lalu (Senin s/d Minggu).
 */
function resolveWeekRange(weekStart?: string): {
  weekStart: string;
  weekEnd: string;
} {
  let monday: Date;

  if (weekStart) {
    monday = new Date(`${weekStart}T00:00:00Z`);
  } else {
    // Ambil Senin minggu lalu
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0=Sun, 1=Mon, ...
    // Mundur ke Senin minggu ini, lalu kurangi 7 hari
    const daysToLastMonday = dayOfWeek === 0 ? 13 : dayOfWeek + 6;
    monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - daysToLastMonday);
  }

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}

/** Ubah row DB menjadi InsightModel.insightDetail */
function rowToDetail(
  row: {
    id: string;
    weekStart: string;
    weekEnd: string;
    generatedAt: Date;
    totalScreenTimeSeconds: number;
    avgBehavioralScore: number;
    weeklyStatus: string;
    bestDay: string | null;
    worstDay: string | null;
    prevWeekScreenTimeSeconds: number | null;
    aiWeeklyStatusLabel: string | null;
    aiPositiveNotes: string | null;
    aiConcernNotes: string | null;
    aiAnalysis: string | null;
    aiTips: string | null;
    generationStatus: string | null;
    topAppId: string | null;
    topAppName: string | null;
    topAppIconUrl: string | null;
  },
): InsightModel.insightDetail {
  return {
    id: row.id,
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    generatedAt: row.generatedAt,
    totalScreenTimeSeconds: row.totalScreenTimeSeconds,
    avgBehavioralScore: row.avgBehavioralScore,
    weeklyStatus: row.weeklyStatus as InsightModel.insightDetail["weeklyStatus"],
    bestDay: row.bestDay,
    worstDay: row.worstDay,
    prevWeekScreenTimeSeconds: row.prevWeekScreenTimeSeconds,
    topApp:
      row.topAppId && row.topAppName
        ? {
            appId: row.topAppId,
            appName: row.topAppName,
            iconUrl: row.topAppIconUrl ?? null,
          }
        : null,
    aiWeeklyStatusLabel: row.aiWeeklyStatusLabel,
    aiPositiveNotes: row.aiPositiveNotes,
    aiConcernNotes: row.aiConcernNotes,
    aiAnalysis: row.aiAnalysis,
    aiTips: row.aiTips,
    generationStatus: (row.generationStatus ?? "pending") as InsightModel.insightDetail["generationStatus"],
  };
}

// Kolom select untuk insight lengkap (JOIN dengan apps)
const insightDetailSelect = {
  id: table.weeklyInsights.id,
  weekStart: table.weeklyInsights.weekStart,
  weekEnd: table.weeklyInsights.weekEnd,
  generatedAt: table.weeklyInsights.generatedAt,
  totalScreenTimeSeconds: table.weeklyInsights.totalScreenTimeSeconds,
  avgBehavioralScore: table.weeklyInsights.avgBehavioralScore,
  weeklyStatus: table.weeklyInsights.weeklyStatus,
  bestDay: table.weeklyInsights.bestDay,
  worstDay: table.weeklyInsights.worstDay,
  prevWeekScreenTimeSeconds: table.weeklyInsights.prevWeekScreenTimeSeconds,
  aiWeeklyStatusLabel: table.weeklyInsights.aiWeeklyStatusLabel,
  aiPositiveNotes: table.weeklyInsights.aiPositiveNotes,
  aiConcernNotes: table.weeklyInsights.aiConcernNotes,
  aiAnalysis: table.weeklyInsights.aiAnalysis,
  aiTips: table.weeklyInsights.aiTips,
  generationStatus: table.weeklyInsights.generationStatus,
  topAppId: table.weeklyInsights.topAppId,
  topAppName: table.apps.name,
  topAppIconUrl: table.apps.iconUrl,
};

export async function getLatestService(): Promise<
  ServiceResult<InsightModel.getLatestResponse>
> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const [row] = await db
    .select(insightDetailSelect)
    .from(table.weeklyInsights)
    .leftJoin(table.apps, eq(table.weeklyInsights.topAppId, table.apps.id))
    .where(
      and(
        eq(table.weeklyInsights.userId, userId),
        eq(table.weeklyInsights.generationStatus, "generated"),
      ),
    )
    .orderBy(desc(table.weeklyInsights.weekStart))
    .limit(1);

  if (!row) {
    return { success: false, error: "Belum ada insight yang tersedia" };
  }

  const parsed = InsightModel.getLatestResponse.safeParse(rowToDetail(row));
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

export async function getHistoryService(
  page = 1,
  limit = 10,
): Promise<ServiceResult<InsightModel.getHistoryResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const offset = (page - 1) * limit;

  const [countRow] = await db
    .select({ total: sql<number>`cast(count(*) as integer)` })
    .from(table.weeklyInsights)
    .where(eq(table.weeklyInsights.userId, userId));

  const rows = await db
    .select({
      id: table.weeklyInsights.id,
      weekStart: table.weeklyInsights.weekStart,
      weekEnd: table.weeklyInsights.weekEnd,
      generatedAt: table.weeklyInsights.generatedAt,
      totalScreenTimeSeconds: table.weeklyInsights.totalScreenTimeSeconds,
      avgBehavioralScore: table.weeklyInsights.avgBehavioralScore,
      weeklyStatus: table.weeklyInsights.weeklyStatus,
      generationStatus: table.weeklyInsights.generationStatus,
      aiWeeklyStatusLabel: table.weeklyInsights.aiWeeklyStatusLabel,
    })
    .from(table.weeklyInsights)
    .where(eq(table.weeklyInsights.userId, userId))
    .orderBy(desc(table.weeklyInsights.weekStart))
    .limit(limit)
    .offset(offset);

  const items = rows.map((r) => ({
    ...r,
    weeklyStatus: r.weeklyStatus as InsightModel.insightSummary["weeklyStatus"],
    generationStatus: (r.generationStatus ?? "pending") as InsightModel.insightSummary["generationStatus"],
    aiWeeklyStatusLabel: r.aiWeeklyStatusLabel ?? null,
  }));

  const parsed = InsightModel.getHistoryResponse.safeParse({
    items,
    total: countRow?.total ?? 0,
  });
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

export async function getByIdService(
  id: string,
): Promise<ServiceResult<InsightModel.getByIdResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const [row] = await db
    .select(insightDetailSelect)
    .from(table.weeklyInsights)
    .leftJoin(table.apps, eq(table.weeklyInsights.topAppId, table.apps.id))
    .where(
      and(
        eq(table.weeklyInsights.id, id),
        eq(table.weeklyInsights.userId, userId),
      ),
    )
    .limit(1);

  if (!row) {
    return { success: false, error: "Insight tidak ditemukan" };
  }

  const parsed = InsightModel.getByIdResponse.safeParse(rowToDetail(row));
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

export async function generateInsightService(
  body: unknown,
): Promise<ServiceResult<InsightModel.generateResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  // 1. Parse request body
  const reqParsed = InsightModel.generateRequest.safeParse(body);
  if (!reqParsed.success) return { success: false, error: validationError(reqParsed.error) };

  const { weekStart, weekEnd } = resolveWeekRange(reqParsed.data?.weekStart);

  // 2. Cek apakah sudah ada insight untuk minggu ini
  const [existing] = await db
    .select({ id: table.weeklyInsights.id, status: table.weeklyInsights.generationStatus })
    .from(table.weeklyInsights)
    .where(
      and(
        eq(table.weeklyInsights.userId, userId),
        eq(table.weeklyInsights.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (existing?.status === "generated") {
    return {
      success: false,
      error: `Insight untuk minggu ${weekStart} sudah tersedia (id: ${existing.id})`,
    };
  }

  // 3. Buat atau update record ke status "pending"
  const [insightRow] = await db
    .insert(table.weeklyInsights)
    .values({
      userId,
      weekStart,
      weekEnd,
      generatedAt: new Date(),
      generationStatus: "pending",
      weeklyStatus: "good",          // placeholder
      totalScreenTimeSeconds: 0,
      avgBehavioralScore: 0,
    })
    .onConflictDoUpdate({
      target: [table.weeklyInsights.userId, table.weeklyInsights.weekStart],
      set: { generationStatus: "pending", updatedAt: new Date() },
    })
    .returning({ id: table.weeklyInsights.id });

  const insightId = insightRow.id;

  try {
    // 4. Baca behavioral_scores 7 hari dalam minggu tersebut
    const scoreRows = await db
      .select({
        scoreDate: table.behavioralScores.scoreDate,
        dailyStatus: table.behavioralScores.dailyStatus,
        totalScore: table.behavioralScores.totalScore,
        usageDurationScore: table.behavioralScores.usageDurationScore,
        openFrequencyScore: table.behavioralScores.openFrequencyScore,
        midnightUsageScore: table.behavioralScores.midnightUsageScore,
        continuousUsageScore: table.behavioralScores.continuousUsageScore,
        productiveHourScore: table.behavioralScores.productiveHourScore,
        flagExcessiveUsage: table.behavioralScores.flagExcessiveUsage,
        flagCompulsiveChecking: table.behavioralScores.flagCompulsiveChecking,
        flagMidnightUsage: table.behavioralScores.flagMidnightUsage,
        flagContinuousUsage: table.behavioralScores.flagContinuousUsage,
        flagProductiveHourDistraction: table.behavioralScores.flagProductiveHourDistraction,
      })
      .from(table.behavioralScores)
      .where(
        and(
          eq(table.behavioralScores.userId, userId),
          gte(table.behavioralScores.scoreDate, weekStart),
          lte(table.behavioralScores.scoreDate, weekEnd),
        ),
      )
      .orderBy(table.behavioralScores.scoreDate);

    // 5. Baca daily_stats 7 hari (agregasi semua app per hari)
    const statRows = await db
      .select({
        statDate: table.dailyStats.statDate,
        totalDurationSeconds: sql<number>`cast(sum(${table.dailyStats.totalDurationSeconds}) as integer)`,
        openFrequency: sql<number>`cast(sum(${table.dailyStats.openFrequency}) as integer)`,
        midnightDurationSeconds: sql<number>`cast(sum(${table.dailyStats.midnightDurationSeconds}) as integer)`,
        productiveHourDurationSeconds: sql<number>`cast(sum(${table.dailyStats.productiveHourDurationSeconds}) as integer)`,
        maxContinuousSeconds: sql<number>`cast(max(${table.dailyStats.maxContinuousSeconds}) as integer)`,
      })
      .from(table.dailyStats)
      .where(
        and(
          eq(table.dailyStats.userId, userId),
          gte(table.dailyStats.statDate, weekStart),
          lte(table.dailyStats.statDate, weekEnd),
        ),
      )
      .groupBy(table.dailyStats.statDate)
      .orderBy(table.dailyStats.statDate);

    // 6. Hitung ringkasan numerik
    const totalScreenTimeSeconds = statRows.reduce(
      (s, r) => s + (r.totalDurationSeconds ?? 0),
      0,
    );
    const avgBehavioralScore =
      scoreRows.length > 0
        ? scoreRows.reduce((s, r) => s + r.totalScore, 0) / scoreRows.length
        : 0;

    // Hari terbaik = skor terendah (semakin rendah = semakin baik)
    const bestScoreRow = scoreRows.reduce<(typeof scoreRows)[number] | null>(
      (best, r) => (!best || r.totalScore < best.totalScore ? r : best),
      null,
    );
    const worstScoreRow = scoreRows.reduce<(typeof scoreRows)[number] | null>(
      (worst, r) => (!worst || r.totalScore > worst.totalScore ? r : worst),
      null,
    );

    const weeklyStatus: "good" | "attention" | "heavy" =
      avgBehavioralScore < 40
        ? "good"
        : avgBehavioralScore < 70
          ? "attention"
          : "heavy";

    // 7. Cari top app (app dengan total durasi tertinggi minggu ini)
    const [topAppRow] = await db
      .select({
        appId: table.dailyStats.appId,
        appName: table.apps.name,
        total: sql<number>`sum(${table.dailyStats.totalDurationSeconds})`,
      })
      .from(table.dailyStats)
      .innerJoin(table.apps, eq(table.dailyStats.appId, table.apps.id))
      .where(
        and(
          eq(table.dailyStats.userId, userId),
          gte(table.dailyStats.statDate, weekStart),
          lte(table.dailyStats.statDate, weekEnd),
        ),
      )
      .groupBy(table.dailyStats.appId, table.apps.name)
      .orderBy(sql`sum(${table.dailyStats.totalDurationSeconds}) desc`)
      .limit(1);

    // 8. Cari total screen time minggu sebelumnya untuk perbandingan
    const prevWeekStart = new Date(`${weekStart}T00:00:00Z`);
    prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setUTCDate(prevWeekStart.getUTCDate() + 6);

    const [prevWeekRow] = await db
      .select({
        total: sql<number>`cast(sum(${table.dailyStats.totalDurationSeconds}) as integer)`,
      })
      .from(table.dailyStats)
      .where(
        and(
          eq(table.dailyStats.userId, userId),
          gte(table.dailyStats.statDate, prevWeekStart.toISOString().slice(0, 10)),
          lte(table.dailyStats.statDate, prevWeekEnd.toISOString().slice(0, 10)),
        ),
      );

    // 9. Panggil AI
    const aiOutput = await generateWeeklyInsightAI({
      weekStart,
      weekEnd,
      weeklyStatus,
      avgBehavioralScore,
      totalScreenTimeSeconds,
      prevWeekScreenTimeSeconds: prevWeekRow?.total ?? null,
      bestDay: bestScoreRow?.scoreDate ?? null,
      worstDay: worstScoreRow?.scoreDate ?? null,
      topAppName: topAppRow?.appName ?? null,
      dailyScores: scoreRows.map((r) => ({
        scoreDate: r.scoreDate,
        dailyStatus: r.dailyStatus,
        totalScore: r.totalScore,
        usageDurationScore: r.usageDurationScore,
        openFrequencyScore: r.openFrequencyScore,
        midnightUsageScore: r.midnightUsageScore,
        continuousUsageScore: r.continuousUsageScore,
        productiveHourScore: r.productiveHourScore,
        flagExcessiveUsage: r.flagExcessiveUsage ?? false,
        flagCompulsiveChecking: r.flagCompulsiveChecking ?? false,
        flagMidnightUsage: r.flagMidnightUsage ?? false,
        flagContinuousUsage: r.flagContinuousUsage ?? false,
        flagProductiveHourDistraction: r.flagProductiveHourDistraction ?? false,
      })),
      dailyStats: statRows.map((r) => ({
        statDate: r.statDate,
        totalDurationSeconds: r.totalDurationSeconds ?? 0,
        openFrequency: r.openFrequency ?? 0,
        midnightDurationSeconds: r.midnightDurationSeconds ?? 0,
        productiveHourDurationSeconds: r.productiveHourDurationSeconds ?? 0,
        maxContinuousSeconds: r.maxContinuousSeconds ?? 0,
      })),
    });

    // 10. Simpan hasil ke weekly_insights
    await db
      .update(table.weeklyInsights)
      .set({
        totalScreenTimeSeconds,
        avgBehavioralScore,
        weeklyStatus,
        bestDay: bestScoreRow?.scoreDate ?? null,
        worstDay: worstScoreRow?.scoreDate ?? null,
        topAppId: topAppRow?.appId ?? null,
        prevWeekScreenTimeSeconds: prevWeekRow?.total ?? null,
        aiWeeklyStatusLabel: aiOutput.weeklyStatusLabel,
        aiPositiveNotes: aiOutput.positiveNotes,
        aiConcernNotes: aiOutput.concernNotes,
        aiAnalysis: aiOutput.analysis,
        aiTips: JSON.stringify(aiOutput.tips),
        generationStatus: "generated",
        generatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(table.weeklyInsights.id, insightId));

    const parsed = InsightModel.generateResponse.safeParse({
      id: insightId,
      weekStart,
      weekEnd,
      generationStatus: "generated",
      message: `Insight minggu ${weekStart} berhasil di-generate`,
    });
    if (!parsed.success) return { success: false, error: validationError(parsed.error) };
    return { success: true, data: parsed.data };
  } catch (err) {
    // Tandai sebagai failed agar bisa di-retry
    await db
      .update(table.weeklyInsights)
      .set({ generationStatus: "failed", updatedAt: new Date() })
      .where(eq(table.weeklyInsights.id, insightId));

    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}