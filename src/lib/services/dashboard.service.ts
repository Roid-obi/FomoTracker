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

/**
 * Ambil breakdown aktivitas per jam untuk tanggal tertentu (grouped per jam dan per aplikasi).
 * Menghasilkan data siap saji untuk Recharts stacked bar chart di dashboard.
 */
export async function getHourlyBreakdownService(
  date?: string,
): Promise<ServiceResult<DashboardModel.getHourlyBreakdownResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10);
  const startTs = new Date(`${targetDate}T00:00:00Z`);
  const endTs = new Date(`${targetDate}T23:59:59Z`);

  // 1. Ambil activity logs hari ini
  const logs = await db
    .select({
      hour: sql<number>`cast(extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC') as integer)`,
      appName: table.apps.name,
      durationSeconds: table.activityLogs.durationSeconds,
    })
    .from(table.activityLogs)
    .innerJoin(table.apps, eq(table.activityLogs.appId, table.apps.id))
    .where(
      and(
        eq(table.activityLogs.userId, userId),
        gte(table.activityLogs.startedAt, startTs),
        lte(table.activityLogs.startedAt, endTs),
      ),
    );

  // 2. Hitung total durasi per aplikasi untuk menentukan top 4
  const appDurations: Record<string, number> = {};
  for (const log of logs) {
    appDurations[log.appName] =
      (appDurations[log.appName] || 0) + log.durationSeconds;
  }

  const sortedApps = Object.entries(appDurations)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const top4Apps = sortedApps.slice(0, 4);

  // 3. Inisialisasi 24 jam data chart
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = `${String(i).padStart(2, "0")}.00`;
    const dataObj: Record<string, string | number> = { jam: hourLabel };
    for (const app of top4Apps) {
      dataObj[app] = 0;
    }
    dataObj.Lainnya = 0;
    return dataObj;
  });

  // 4. Isi data chart dari log
  for (const log of logs) {
    const hour = log.hour;
    if (hour >= 0 && hour < 24) {
      const durationMinutes = Math.round(log.durationSeconds / 60);
      if (top4Apps.includes(log.appName)) {
        chartData[hour][log.appName] =
          ((chartData[hour][log.appName] as number) || 0) + durationMinutes;
      } else {
        chartData[hour].Lainnya =
          ((chartData[hour].Lainnya as number) || 0) + durationMinutes;
      }
    }
  }

  const parsed = DashboardModel.getHourlyBreakdownResponse.safeParse({
    chartData,
    top4Apps,
  });

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}
