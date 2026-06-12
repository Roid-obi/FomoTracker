import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { DashboardModel } from "@/lib/models/dashboard.model";
import {
  recalculateScoreAndNotifications,
  updateDailyStatsFromLogs,
} from "@/lib/services/tracking.service";

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

function getWIBDateString(date: Date = new Date()): string {
  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wibTime.toISOString().slice(0, 10);
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

  const targetDate = date ?? getWIBDateString();

  const todayWIBStr = getWIBDateString();
  if (targetDate === todayWIBStr) {
    try {
      await updateDailyStatsFromLogs(userId, todayWIBStr);
      await recalculateScoreAndNotifications(userId, todayWIBStr);
    } catch (err) {
      console.error("Failed to auto-update daily stats from logs:", err);
    }
  }

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
    const fallback = {
      scoreDate: new Date(targetDate),
      dailyStatus: "Hari yang Sempurna",
      usageDurationScore: 0,
      openFrequencyScore: 0,
      midnightUsageScore: 0,
      continuousUsageScore: 0,
      productiveHourScore: 0,
      totalScore: 0,
    };
    return { success: true, data: fallback };
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

  const todayWIBStr = getWIBDateString();
  try {
    await updateDailyStatsFromLogs(userId, todayWIBStr);
    await recalculateScoreAndNotifications(userId, todayWIBStr);
  } catch (err) {
    console.error(
      "Failed to auto-update chart today daily stats from logs:",
      err,
    );
  }

  const todayDate = new Date(todayWIBStr);
  const startDate = new Date(todayDate);
  startDate.setDate(todayDate.getDate() - (days - 1));

  const startDateStr = getWIBDateString(startDate);
  const endDateStr = todayWIBStr;

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

  const targetDate = date ?? getWIBDateString();
  const todayStr = getWIBDateString();

  if (targetDate === todayStr) {
    try {
      await updateDailyStatsFromLogs(userId, todayStr);
      await recalculateScoreAndNotifications(userId, todayStr);
    } catch (err) {
      console.error("Failed to auto-update behavioral flags from logs:", err);
    }
  }

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

  let openFrequencyLastHour = 0;

  if (targetDate === todayStr) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [cntRow] = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(table.activityLogs)
      .where(
        and(
          eq(table.activityLogs.userId, userId),
          gte(table.activityLogs.startedAt, oneHourAgo),
        ),
      );
    openFrequencyLastHour = cntRow?.count ?? 0;
  } else {
    const startTs = new Date(`${targetDate}T00:00:00+07:00`);
    const endTs = new Date(`${targetDate}T23:59:59.999+07:00`);
    const hourlyCounts = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(table.activityLogs)
      .where(
        and(
          eq(table.activityLogs.userId, userId),
          gte(table.activityLogs.startedAt, startTs),
          lte(table.activityLogs.startedAt, endTs),
        ),
      )
      .groupBy(
        sql`extract(hour from ${table.activityLogs.startedAt} at time zone 'Asia/Jakarta')`,
      );

    if (hourlyCounts.length > 0) {
      openFrequencyLastHour = Math.max(...hourlyCounts.map((c) => c.count));
    }
  }

  const resultData = {
    flagExcessiveUsage: row?.flagExcessiveUsage ?? false,
    flagCompulsiveChecking: row?.flagCompulsiveChecking ?? false,
    flagMidnightUsage: row?.flagMidnightUsage ?? false,
    flagContinuousUsage: row?.flagContinuousUsage ?? false,
    flagProductiveHourDistraction: row?.flagProductiveHourDistraction ?? false,
    openFrequencyLastHour,
  };

  const parsed = DashboardModel.getBehaviorFlagResponse.safeParse(resultData);

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

  const targetDate = date ?? getWIBDateString();
  const startTs = new Date(`${targetDate}T00:00:00+07:00`);
  const endTs = new Date(`${targetDate}T23:59:59.999+07:00`);

  // 1. Ambil activity logs hari ini beserta startedAt dan endedAt
  const logs = await db
    .select({
      appName: table.apps.name,
      startedAt: table.activityLogs.startedAt,
      endedAt: table.activityLogs.endedAt,
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

  // 3. Inisialisasi 24 jam data chart (hourlyDurations menyimpan nilai float menit)
  const hourlyDurations: Record<string, number>[] = Array.from(
    { length: 24 },
    () => {
      const obj: Record<string, number> = {};
      for (const app of top4Apps) {
        obj[app] = 0;
      }
      obj.Lainnya = 0;
      return obj;
    },
  );

  // 4. Isi data chart dari log dengan membagi durasi sesi ke jam-jam yang sesuai
  for (const log of logs) {
    const sessionStart = new Date(log.startedAt).getTime();
    const sessionEnd = new Date(log.endedAt).getTime();

    for (let h = 0; h < 24; h++) {
      const hourStart = startTs.getTime() + h * 3600 * 1000;
      const hourEnd = startTs.getTime() + (h + 1) * 3600 * 1000;

      // Hitung overlap antara sesi dengan jam h ini (dalam milidetik)
      const overlapMs = Math.max(
        0,
        Math.min(sessionEnd, hourEnd) - Math.max(sessionStart, hourStart),
      );
      if (overlapMs > 0) {
        const overlapMinutes = overlapMs / 60000;
        if (top4Apps.includes(log.appName)) {
          hourlyDurations[h][log.appName] =
            (hourlyDurations[h][log.appName] || 0) + overlapMinutes;
        } else {
          hourlyDurations[h].Lainnya =
            (hourlyDurations[h].Lainnya || 0) + overlapMinutes;
        }
      }
    }
  }

  // 5. Batasi total menit per jam maksimal 60, dan limpahkan kelebihannya ke jam berikutnya
  for (let h = 0; h < 24; h++) {
    const appsKeys = Object.keys(hourlyDurations[h]);
    const totalMinutes = appsKeys.reduce(
      (sum, key) => sum + hourlyDurations[h][key],
      0,
    );

    if (totalMinutes > 60) {
      const ratio = 60 / totalMinutes;

      // Limpahkan overflow ke jam berikutnya (h + 1) jika h < 23
      if (h < 23) {
        for (const key of appsKeys) {
          const val = hourlyDurations[h][key];
          const currentScaled = val * ratio;
          const carryOver = val - currentScaled;

          hourlyDurations[h][key] = currentScaled;
          hourlyDurations[h + 1][key] += carryOver;
        }
      } else {
        // Untuk jam 23, batasi saja pada rasio 60 menit
        for (const key of appsKeys) {
          hourlyDurations[h][key] *= ratio;
        }
      }
    }
  }

  // 6. Konversi ke integer bulat dan format hasil akhir chartData
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = `${String(i).padStart(2, "0")}.00`;
    const dataObj: Record<string, string | number> = { jam: hourLabel };
    for (const key of Object.keys(hourlyDurations[i])) {
      dataObj[key] = Math.round(hourlyDurations[i][key]);
    }
    return dataObj;
  });

  const parsed = DashboardModel.getHourlyBreakdownResponse.safeParse({
    chartData,
    top4Apps,
  });

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}
