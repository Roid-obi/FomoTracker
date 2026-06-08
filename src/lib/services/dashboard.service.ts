import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { DashboardModel } from "@/lib/models/dashboard.model";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

async function getAuthenticatedUserId() {
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
 * Ambil skor behavioral dan status harian untuk tanggal tertentu.
 * Default: hari ini (UTC).
 */
export async function getDailyStatusService(
  date?: string,
): Promise<ServiceResult<DashboardModel.getDailyStatusResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const [row] = await db
    .select({
      scoreDate: table.behavioralScores.scoreDate,
      dailyStatus: table.behavioralScores.dailyStatus,
      usageDurationScore: table.behavioralScores.usageDurationScore,
      openFrequencyScore: table.behavioralScores.openFrequencyScore,
      midnightUsageScore: table.behavioralScores.midnightUsageScore,
      continuousUsageScore: table.behavioralScores.continuousUsageScore,
      productiveHourScore: table.behavioralScores.productiveHourScore,
      totalScore: table.behavioralScores.totalScore,
    })
    .from(table.behavioralScores)
    .where(
      and(
        eq(table.behavioralScores.userId, userId),
        eq(table.behavioralScores.scoreDate, targetDate),
      ),
    );

  if (!row) {
    return { success: false, error: "No data found for the given date" };
  }

  const parsed = DashboardModel.getDailyStatusResponse.safeParse({
    ...row,
    scoreDate: new Date(row.scoreDate),
  });

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

/**
 * Ambil data chart agregasi harian untuk N hari terakhir.
 * Semua apps yang dipantau user digabungkan per hari.
 * Default: 7 hari terakhir.
 */
export async function getChartService(
  days = 7,
): Promise<ServiceResult<DashboardModel.getChartResponse[]>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = today.toISOString().slice(0, 10);

  // Aggregate semua apps per hari
  const rows = await db
    .select({
      statDate: table.dailyStats.statDate,
      totalDurationSeconds: sql<number>`cast(sum(${table.dailyStats.totalDurationSeconds}) as integer)`,
      openFrequency: sql<number>`cast(sum(${table.dailyStats.openFrequency}) as integer)`,
      midnightDurationSeconds: sql<number>`cast(sum(${table.dailyStats.midnightDurationSeconds}) as integer)`,
      productiveHourDurationSeconds: sql<number>`cast(sum(${table.dailyStats.productiveHourDurationSeconds}) as integer)`,
      maxContinuousSeconds: sql<number>`cast(max(${table.dailyStats.maxContinuousSeconds}) as integer)`,
      peakActiveHour: sql<number>`cast(
        (array_agg(${table.dailyStats.peakActiveHour} order by ${table.dailyStats.totalDurationSeconds} desc))[1]
        as integer)`,
    })
    .from(table.dailyStats)
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        gte(table.dailyStats.statDate, startDateStr),
        lte(table.dailyStats.statDate, endDateStr),
      ),
    )
    .groupBy(table.dailyStats.statDate)
    .orderBy(table.dailyStats.statDate);

  const parsed = DashboardModel.getChartResponse.array().safeParse(
    rows.map((r) => ({
      ...r,
      statDate: new Date(r.statDate),
    })),
  );

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

/**
 * Ambil flag deteksi perilaku buruk untuk tanggal tertentu.
 * Default: hari ini (UTC).
 */
export async function getBehaviorFlagService(
  date?: string,
): Promise<ServiceResult<DashboardModel.getBehaviorFlagResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const [row] = await db
    .select({
      flagExcessiveUsage: table.behavioralScores.flagExcessiveUsage,
      flagCompulsiveChecking: table.behavioralScores.flagCompulsiveChecking,
      flagMidnightUsage: table.behavioralScores.flagMidnightUsage,
      flagContinuousUsage: table.behavioralScores.flagContinuousUsage,
      flagProductiveHourDistraction:
        table.behavioralScores.flagProductiveHourDistraction,
    })
    .from(table.behavioralScores)
    .where(
      and(
        eq(table.behavioralScores.userId, userId),
        eq(table.behavioralScores.scoreDate, targetDate),
      ),
    );

  if (!row) {
    return { success: false, error: "No data found for the given date" };
  }

  const parsed = DashboardModel.getBehaviorFlagResponse.safeParse(row);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}
