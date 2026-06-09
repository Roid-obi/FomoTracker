import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { StatisticModel } from "@/lib/models/statistic.model";

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

const DAY_LABELS: StatisticModel.getWeeklyHabitItem["dayLabel"][] = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
];

// ----------------------------------------------------------------
// GET /screen-time
// Tren screen time harian dalam rentang tanggal dari daily_stats
// ----------------------------------------------------------------

export async function getScreenTimeService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<StatisticModel.getScreenTimeResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const rows = await db
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
        gte(table.dailyStats.statDate, startDate),
        lte(table.dailyStats.statDate, endDate),
      ),
    )
    .groupBy(table.dailyStats.statDate)
    .orderBy(table.dailyStats.statDate);

  const items = rows.map((r) => ({
    statDate: r.statDate,
    totalDurationSeconds: r.totalDurationSeconds ?? 0,
    openFrequency: r.openFrequency ?? 0,
    midnightDurationSeconds: r.midnightDurationSeconds ?? 0,
    productiveHourDurationSeconds: r.productiveHourDurationSeconds ?? 0,
    maxContinuousSeconds: r.maxContinuousSeconds ?? 0,
  }));

  const totalSeconds = items.reduce((s, r) => s + r.totalDurationSeconds, 0);
  const avgDailySeconds = items.length > 0 ? totalSeconds / items.length : 0;

  const peakItem = items.reduce<(typeof items)[number] | null>((best, r) => {
    if (!best || r.totalDurationSeconds > best.totalDurationSeconds) return r;
    return best;
  }, null);

  const parsed = StatisticModel.getScreenTimeResponse.safeParse({
    items,
    avgDailySeconds,
    totalSeconds,
    peakDate: peakItem?.statDate ?? null,
    peakSeconds: peakItem?.totalDurationSeconds ?? 0,
  });

  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

// ----------------------------------------------------------------
// GET /breakdown
// Perincian per app dalam rentang tanggal dari daily_stats + apps
// ----------------------------------------------------------------

export async function getBreakdownService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<StatisticModel.getBreakdownResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const rows = await db
    .select({
      appId: table.dailyStats.appId,
      appName: table.apps.name,
      category: table.apps.category,
      platform: table.apps.platform,
      iconUrl: table.apps.iconUrl,
      totalDurationSeconds: sql<number>`cast(sum(${table.dailyStats.totalDurationSeconds}) as integer)`,
      totalOpenFrequency: sql<number>`cast(sum(${table.dailyStats.openFrequency}) as integer)`,
      totalMidnightSeconds: sql<number>`cast(sum(${table.dailyStats.midnightDurationSeconds}) as integer)`,
      totalProductiveHourSeconds: sql<number>`cast(sum(${table.dailyStats.productiveHourDurationSeconds}) as integer)`,
    })
    .from(table.dailyStats)
    .innerJoin(table.apps, eq(table.dailyStats.appId, table.apps.id))
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        gte(table.dailyStats.statDate, startDate),
        lte(table.dailyStats.statDate, endDate),
      ),
    )
    .groupBy(
      table.dailyStats.appId,
      table.apps.name,
      table.apps.category,
      table.apps.platform,
      table.apps.iconUrl,
    )
    .orderBy(sql`sum(${table.dailyStats.totalDurationSeconds}) desc`);

  const grandTotalSeconds = rows.reduce(
    (s, r) => s + (r.totalDurationSeconds ?? 0),
    0,
  );

  const items = rows.map((r) => ({
    appId: r.appId,
    appName: r.appName,
    category: r.category,
    platform: r.platform,
    iconUrl: r.iconUrl ?? null,
    totalDurationSeconds: r.totalDurationSeconds ?? 0,
    totalOpenFrequency: r.totalOpenFrequency ?? 0,
    totalMidnightSeconds: r.totalMidnightSeconds ?? 0,
    totalProductiveHourSeconds: r.totalProductiveHourSeconds ?? 0,
    sharePercent:
      grandTotalSeconds > 0
        ? ((r.totalDurationSeconds ?? 0) / grandTotalSeconds) * 100
        : 0,
  }));

  const parsed = StatisticModel.getBreakdownResponse.safeParse({
    items,
    grandTotalSeconds,
  });

  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

// ----------------------------------------------------------------
// GET /active-hours
// Heatmap jam aktif dari activity_logs GROUP BY EXTRACT(HOUR ...)
// ----------------------------------------------------------------

export async function getActiveHoursService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<StatisticModel.getActiveHoursResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const startTs = new Date(`${startDate}T00:00:00Z`);
  const endTs = new Date(`${endDate}T23:59:59Z`);

  const rows = await db
    .select({
      hour: sql<number>`cast(extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC') as integer)`,
      totalDurationSeconds: sql<number>`cast(sum(${table.activityLogs.durationSeconds}) as integer)`,
      sessionCount: sql<number>`cast(count(*) as integer)`,
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
      sql`extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC')`,
    )
    .orderBy(
      sql`extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC')`,
    );

  // Isi penuh 24 slot (jam tanpa data = 0)
  const hourMap = new Map(rows.map((r) => [r.hour, r]));
  const hours: StatisticModel.getActiveHoursItem[] = Array.from(
    { length: 24 },
    (_, h) => ({
      hour: h,
      totalDurationSeconds: hourMap.get(h)?.totalDurationSeconds ?? 0,
      sessionCount: hourMap.get(h)?.sessionCount ?? 0,
    }),
  );

  const peakItem = hours.reduce<StatisticModel.getActiveHoursItem | null>(
    (best, h) => {
      if (h.totalDurationSeconds === 0) return best;
      if (!best || h.totalDurationSeconds > best.totalDurationSeconds) return h;
      return best;
    },
    null,
  );

  const parsed = StatisticModel.getActiveHoursResponse.safeParse({
    hours,
    peakHour: peakItem?.hour ?? null,
    peakDurationSeconds: peakItem?.totalDurationSeconds ?? 0,
  });

  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) };
  return { success: true, data: parsed.data };
}

// ----------------------------------------------------------------
// GET /weekly-habit
// Pola rata-rata per hari-dalam-seminggu dari daily_stats
// Menggunakan 2-level aggregasi: per-date dulu, lalu GROUP BY DOW
// agar multi-app tidak menjadi double count
// ----------------------------------------------------------------

export async function getWeeklyHabitService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<StatisticModel.getWeeklyHabitResponse>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  // Level 1: agregasi total per hari (semua app digabung)
  const perDayRows = await db
    .select({
      statDate: table.dailyStats.statDate,
      totalDuration: sql<number>`sum(${table.dailyStats.totalDurationSeconds})`,
      totalFreq: sql<number>`sum(${table.dailyStats.openFrequency})`,
      totalMidnight: sql<number>`sum(${table.dailyStats.midnightDurationSeconds})`,
      totalProd: sql<number>`sum(${table.dailyStats.productiveHourDurationSeconds})`,
    })
    .from(table.dailyStats)
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        gte(table.dailyStats.statDate, startDate),
        lte(table.dailyStats.statDate, endDate),
      ),
    )
    .groupBy(table.dailyStats.statDate);

  // Level 2: hitung rata-rata per DOW di JavaScript
  // (lebih mudah dan efisien untuk dataset kecil seperti ini)
  type DowAccum = {
    sumDuration: number;
    sumFreq: number;
    sumMidnight: number;
    sumProd: number;
    count: number;
  };
  const dowAccum = new Map<number, DowAccum>();

  for (const row of perDayRows) {
    // statDate dari Drizzle postgres-js bisa berupa string "YYYY-MM-DD"
    const d = new Date(`${row.statDate}T00:00:00Z`);
    const dow = d.getUTCDay(); // 0 = Minggu

    const prev = dowAccum.get(dow) ?? {
      sumDuration: 0,
      sumFreq: 0,
      sumMidnight: 0,
      sumProd: 0,
      count: 0,
    };
    dowAccum.set(dow, {
      sumDuration: prev.sumDuration + (row.totalDuration ?? 0),
      sumFreq: prev.sumFreq + (row.totalFreq ?? 0),
      sumMidnight: prev.sumMidnight + (row.totalMidnight ?? 0),
      sumProd: prev.sumProd + (row.totalProd ?? 0),
      count: prev.count + 1,
    });
  }

  const days: StatisticModel.getWeeklyHabitItem[] = Array.from(
    { length: 7 },
    (_, dow) => {
      const acc = dowAccum.get(dow);
      if (!acc) {
        return {
          dayOfWeek: dow,
          dayLabel: DAY_LABELS[dow],
          avgDurationSeconds: 0,
          avgOpenFrequency: 0,
          avgMidnightSeconds: 0,
          avgProductiveHourSeconds: 0,
          dataPoints: 0,
        };
      }
      return {
        dayOfWeek: dow,
        dayLabel: DAY_LABELS[dow],
        avgDurationSeconds: acc.sumDuration / acc.count,
        avgOpenFrequency: acc.sumFreq / acc.count,
        avgMidnightSeconds: acc.sumMidnight / acc.count,
        avgProductiveHourSeconds: acc.sumProd / acc.count,
        dataPoints: acc.count,
      };
    },
  );

  const daysWithData = days.filter((d) => d.dataPoints > 0);
  const busiestDay =
    daysWithData.length > 0
      ? daysWithData.reduce((a, b) =>
          a.avgDurationSeconds >= b.avgDurationSeconds ? a : b,
        ).dayOfWeek
      : null;
  const lightestDay =
    daysWithData.length > 0
      ? daysWithData.reduce((a, b) =>
          a.avgDurationSeconds <= b.avgDurationSeconds ? a : b,
        ).dayOfWeek
      : null;

  const parsed = StatisticModel.getWeeklyHabitResponse.safeParse({
    days,
    busiestDay,
    lightestDay,
  });

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

export async function getDailyBreakdownService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<any[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const rows = await db
    .select({
      statDate: table.dailyStats.statDate,
      appName: table.apps.name,
      totalDurationSeconds: table.dailyStats.totalDurationSeconds,
    })
    .from(table.dailyStats)
    .innerJoin(table.apps, eq(table.dailyStats.appId, table.apps.id))
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        gte(table.dailyStats.statDate, startDate),
        lte(table.dailyStats.statDate, endDate),
      ),
    );

  const grouped: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const dateStr = row.statDate;
    if (!grouped[dateStr]) {
      grouped[dateStr] = {};
    }
    const mins = Math.round((row.totalDurationSeconds ?? 0) / 60);
    grouped[dateStr][row.appName] = (grouped[dateStr][row.appName] || 0) + mins;
  }

  const data = Object.entries(grouped).map(([date, apps]) => ({
    date,
    ...apps,
  }));

  return { success: true, data };
}

export async function getHeatmapService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<any[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const startTs = new Date(`${startDate}T00:00:00Z`);
  const endTs = new Date(`${endDate}T23:59:59Z`);

  const rows = await db
    .select({
      statDate: sql<string>`to_char(${table.activityLogs.startedAt} at time zone 'UTC', 'YYYY-MM-DD')`,
      hour: sql<number>`cast(extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC') as integer)`,
      totalDurationSeconds: sql<number>`cast(sum(${table.activityLogs.durationSeconds}) as integer)`,
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
      sql`to_char(${table.activityLogs.startedAt} at time zone 'UTC', 'YYYY-MM-DD')`,
      sql`extract(hour from ${table.activityLogs.startedAt} at time zone 'UTC')`,
    );

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const orderedDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const cellMap: Record<string, Record<number, number>> = {};
  for (const d of orderedDays) {
    cellMap[d] = {};
    for (let h = 0; h < 24; h++) {
      cellMap[d][h] = 0;
    }
  }

  for (const row of rows) {
    const d = new Date(`${row.statDate}T00:00:00Z`);
    const dayLabel = dayNames[d.getUTCDay()];
    if (cellMap[dayLabel] !== undefined) {
      const mins = Math.round((row.totalDurationSeconds ?? 0) / 60);
      let val = 0;
      if (mins > 30) val = 3;
      else if (mins > 15) val = 2;
      else if (mins > 0) val = 1;
      cellMap[dayLabel][row.hour] = val;
    }
  }

  const data = orderedDays.map((day) => {
    return Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      val: cellMap[day][hour],
    }));
  });

  return { success: true, data };
}

export async function getFlagsService(
  startDate: string,
  endDate: string,
): Promise<ServiceResult<any[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const rows = await db
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
        gte(table.behavioralScores.scoreDate, startDate),
        lte(table.behavioralScores.scoreDate, endDate),
      ),
    );

  const total = rows.length;

  const counts = {
    excessive: 0,
    compulsive: 0,
    midnight: 0,
    continuous: 0,
    distraction: 0,
  };

  for (const row of rows) {
    if (row.flagExcessiveUsage) counts.excessive++;
    if (row.flagCompulsiveChecking) counts.compulsive++;
    if (row.flagMidnightUsage) counts.midnight++;
    if (row.flagContinuousUsage) counts.continuous++;
    if (row.flagProductiveHourDistraction) counts.distraction++;
  }

  const data = [
    {
      name: "Terlalu lama main HP",
      count: counts.excessive,
      total,
      label: `Muncul ${counts.excessive} dari ${total} hari`,
    },
    {
      name: "Sering buka-tutup aplikasi",
      count: counts.compulsive,
      total,
      label: `Muncul ${counts.compulsive} dari ${total} hari`,
    },
    {
      name: "Main HP waktu tidur",
      count: counts.midnight,
      total,
      label: `Muncul ${counts.midnight} dari ${total} hari`,
    },
    {
      name: "Nonstop tanpa jeda",
      count: counts.continuous,
      total,
      label: `Muncul ${counts.continuous} dari ${total} hari`,
    },
    {
      name: "Distraksi jam produktif",
      count: counts.distraction,
      total,
      label: `Muncul ${counts.distraction} dari ${total} hari`,
    },
  ];

  return { success: true, data };
}
