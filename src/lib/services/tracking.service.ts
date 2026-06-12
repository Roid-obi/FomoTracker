import { and, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { TrackingModel } from "@/lib/models/tracking.model";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

function validationError(error: z.ZodError) {
  return z.treeifyError(error);
}

/** Tentukan status harian dari total skor */
function calcDailyStatus(score: number): "good" | "attention" | "heavy" {
  if (score <= 30) return "good";
  if (score <= 60) return "attention";
  return "heavy";
}

/**
 * Lookup appId dari master `apps` berdasarkan packageName atau webDomain.
 * Mengembalikan Map: (packageName | webDomain) → appId.
 * Query dikombinasi dengan OR agar satu round-trip ke DB.
 */
async function resolveAppIds(
  items: { packageName?: string; webDomain?: string }[],
): Promise<Map<string, string>> {
  const packageNames = items
    .map((i) => i.packageName)
    .filter((v): v is string => Boolean(v));
  const webDomains = items
    .map((i) => i.webDomain)
    .filter((v): v is string => Boolean(v));

  if (packageNames.length === 0 && webDomains.length === 0) {
    return new Map();
  }

  const conditions = [];
  if (packageNames.length > 0)
    conditions.push(inArray(table.apps.packageName, packageNames));
  if (webDomains.length > 0)
    conditions.push(inArray(table.apps.webDomain, webDomains));

  const rows = await db
    .select({
      id: table.apps.id,
      packageName: table.apps.packageName,
      webDomain: table.apps.webDomain,
    })
    .from(table.apps)
    .where(or(...conditions));

  const result = new Map<string, string>();
  for (const row of rows) {
    if (row.packageName) result.set(row.packageName, row.id);
    if (row.webDomain) result.set(row.webDomain, row.id);
  }
  return result;
}

/** Verifikasi bahwa device ada dan milik userId yang dikirim. */
async function verifyDevice(
  deviceId: string,
  userId: string,
): Promise<boolean> {
  const [device] = await db
    .select({ id: table.userDevices.id })
    .from(table.userDevices)
    .where(
      and(
        eq(table.userDevices.id, deviceId),
        eq(table.userDevices.userId, userId),
      ),
    );
  return Boolean(device);
}

export async function syncActivityService(
  body: unknown,
): Promise<ServiceResult<TrackingModel.syncActivityResponse>> {
  const parsed = TrackingModel.syncActivityRequest.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const { userId, deviceId, logs } = parsed.data;

  const deviceValid = await verifyDevice(deviceId, userId);
  if (!deviceValid) {
    return {
      success: false,
      error: "Device tidak ditemukan atau bukan milik user ini",
    };
  }

  if (logs.length === 0) {
    return {
      success: true,
      data: {
        inserted: 0,
        skipped: 0,
        deviceLastSyncedAt: new Date(),
      },
    };
  }

  // Resolve semua appId sekaligus dalam satu query
  const appIdMap = await resolveAppIds(logs);

  // Cari logs yang sudah ada untuk menghindari duplikasi
  const startedAts = logs.map((l) => new Date(l.startedAt));
  const minStart = new Date(Math.min(...startedAts.map((d) => d.getTime())));
  const maxStart = new Date(Math.max(...startedAts.map((d) => d.getTime())));

  const existingLogs = await db
    .select({
      appId: table.activityLogs.appId,
      startedAt: table.activityLogs.startedAt,
    })
    .from(table.activityLogs)
    .where(
      and(
        eq(table.activityLogs.userId, userId),
        gte(table.activityLogs.startedAt, minStart),
        lte(table.activityLogs.startedAt, maxStart),
      ),
    );

  const existingSet = new Set(
    existingLogs.map((el) => `${el.appId}_${new Date(el.startedAt).getTime()}`),
  );

  const toInsert: (typeof table.activityLogs.$inferInsert)[] = [];
  let skipped = 0;

  for (const log of logs) {
    const key = log.packageName ?? log.webDomain ?? "";
    const appId = appIdMap.get(key);
    if (!appId) {
      skipped++;
      continue;
    }

    const startedAtTime = new Date(log.startedAt).getTime();
    const keyCombo = `${appId}_${startedAtTime}`;
    if (existingSet.has(keyCombo)) {
      skipped++;
      continue;
    }

    toInsert.push({
      userId,
      appId,
      deviceId,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      durationSeconds: log.durationSeconds,
      isMidnight: log.isMidnight,
      isProductiveHour: log.isProductiveHour,
      isContinuous: log.isContinuous,
      source: log.source,
    });
  }

  if (toInsert.length > 0) {
    await db.insert(table.activityLogs).values(toInsert);
  }

  const now = new Date();
  await db
    .update(table.userDevices)
    .set({ lastSyncedAt: now })
    .where(eq(table.userDevices.id, deviceId));

  return {
    success: true,
    data: {
      inserted: toInsert.length,
      skipped,
      deviceLastSyncedAt: now,
    },
  };
}

export async function recalculateScoreAndNotifications(
  userId: string,
  statDate: string,
) {
  // ── 1. Ambil user settings (threshold + toggle notifikasi) ─────────────────
  const [settings] = await db
    .select({
      screenTimeLimitSeconds: table.userSettings.screenTimeLimitSeconds,
      continuousLimitSeconds: table.userSettings.continuousLimitSeconds,
      notifScreenTimeEnabled: table.userSettings.notifScreenTimeEnabled,
      notifProductiveHourEnabled: table.userSettings.notifProductiveHourEnabled,
      notifMidnightEnabled: table.userSettings.notifMidnightEnabled,
      notifContinuousEnabled: table.userSettings.notifContinuousEnabled,
    })
    .from(table.userSettings)
    .where(eq(table.userSettings.userId, userId));

  const screenTimeLimit = settings?.screenTimeLimitSeconds ?? 14400; // default 4 jam
  const continuousLimit = settings?.continuousLimitSeconds ?? 3600; // default 60 menit
  const notifScreenTime = settings?.notifScreenTimeEnabled ?? true;
  const notifMidnight = settings?.notifMidnightEnabled ?? true;
  const notifContinuous = settings?.notifContinuousEnabled ?? true;
  const notifProductiveHour = settings?.notifProductiveHourEnabled ?? true;

  // ── 2. Agregasi seluruh daily_stats user untuk statDate ────────────────────
  // Skor dihitung dari TOTAL semua app agar hasil lintas-app representatif.
  const [agg] = await db
    .select({
      totalScreenTime: sql<number>`COALESCE(SUM(${table.dailyStats.totalDurationSeconds}), 0)`,
      totalOpenFrequency: sql<number>`COALESCE(SUM(${table.dailyStats.openFrequency}), 0)`,
      totalMidnight: sql<number>`COALESCE(SUM(${table.dailyStats.midnightDurationSeconds}), 0)`,
      totalProductiveHour: sql<number>`COALESCE(SUM(${table.dailyStats.productiveHourDurationSeconds}), 0)`,
      maxContinuous: sql<number>`COALESCE(MAX(${table.dailyStats.maxContinuousSeconds}), 0)`,
    })
    .from(table.dailyStats)
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        eq(table.dailyStats.statDate, statDate),
      ),
    );

  const totalScreenTime = Number(agg?.totalScreenTime ?? 0);
  const totalMidnight = Number(agg?.totalMidnight ?? 0);
  const totalProductiveHour = Number(agg?.totalProductiveHour ?? 0);
  const maxContinuous = Number(agg?.maxContinuous ?? 0);

  // ── 3. Deteksi flag perilaku ────────────────────────────────────────────────
  // Usage Duration: > 4 jam/hari (atau sesuai batas pengguna)
  const flagExcessiveUsage = totalScreenTime > screenTimeLimit;

  // Open Frequency: 40 kali buka per jam (check peak openings in any hour of the day)
  const startTs = new Date(`${statDate}T00:00:00+07:00`);
  const endTs = new Date(`${statDate}T23:59:59.999+07:00`);
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

  const peakHourlyOpens =
    hourlyCounts.length > 0 ? Math.max(...hourlyCounts.map((c) => c.count)) : 0;
  const flagCompulsiveChecking = peakHourlyOpens >= 40;

  // Continuous Usage: > 60 menit nonstop (atau sesuai batas pengguna)
  const flagContinuousUsage = maxContinuous > continuousLimit;

  // Midnight Usage: > 15 menit selama jam tidur
  const flagMidnightUsage = totalMidnight > 900;

  // Productivity Usage: > 30 menit selama jam produktif
  const flagProductiveHourDistraction = totalProductiveHour > 1800;

  // ── 4. Hitung skor per dimensi (Sistem Poin Baru) ───────────────────────────
  const usageDurationScore = flagExcessiveUsage ? 30 : 0;
  const openFrequencyScore = flagCompulsiveChecking ? 20 : 0;
  const continuousUsageScore = flagContinuousUsage ? 20 : 0;
  const midnightUsageScore = flagMidnightUsage ? 15 : 0;
  const productiveHourScore = flagProductiveHourDistraction ? 15 : 0;

  const totalScore =
    usageDurationScore +
    openFrequencyScore +
    continuousUsageScore +
    midnightUsageScore +
    productiveHourScore;

  const dailyStatus = calcDailyStatus(totalScore);

  // ── 5. Ambil status score sebelumnya untuk cegah spam notifikasi ────────────
  const [existingScore] = await db
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
        eq(table.behavioralScores.scoreDate, statDate),
      ),
    );

  const prevExcessive = existingScore?.flagExcessiveUsage ?? false;
  const prevCompulsive = existingScore?.flagCompulsiveChecking ?? false;
  const prevMidnight = existingScore?.flagMidnightUsage ?? false;
  const prevContinuous = existingScore?.flagContinuousUsage ?? false;
  const prevProductive = existingScore?.flagProductiveHourDistraction ?? false;

  // ── 6. UPSERT behavioral_scores ────────────────────────────────────────────
  await db
    .insert(table.behavioralScores)
    .values({
      userId,
      scoreDate: statDate,
      usageDurationScore,
      openFrequencyScore,
      midnightUsageScore,
      continuousUsageScore,
      productiveHourScore,
      totalScore,
      dailyStatus,
      flagExcessiveUsage,
      flagCompulsiveChecking,
      flagMidnightUsage,
      flagContinuousUsage,
      flagProductiveHourDistraction,
    })
    .onConflictDoUpdate({
      target: [table.behavioralScores.userId, table.behavioralScores.scoreDate],
      set: {
        usageDurationScore,
        openFrequencyScore,
        midnightUsageScore,
        continuousUsageScore,
        productiveHourScore,
        totalScore,
        dailyStatus,
        flagExcessiveUsage,
        flagCompulsiveChecking,
        flagMidnightUsage,
        flagContinuousUsage,
        flagProductiveHourDistraction,
        updatedAt: new Date(),
      },
    });

  // ── 7. Buat notifikasi hanya saat indikator berubah menjadi "Terdeteksi" ────
  const notificationsToCreate: (typeof table.notifications.$inferInsert)[] = [];

  if (notifScreenTime && flagExcessiveUsage && !prevExcessive) {
    notificationsToCreate.push({
      userId,
      type: "screen_time",
      message: "Anda telah menggunakan media sosial lebih dari 4 jam hari ini.",
    });
  }

  if (flagCompulsiveChecking && !prevCompulsive) {
    notificationsToCreate.push({
      userId,
      type: "open_frequency",
      message:
        "Anda membuka media sosial sangat sering dalam satu jam terakhir.",
    });
  }

  if (notifContinuous && flagContinuousUsage && !prevContinuous) {
    notificationsToCreate.push({
      userId,
      type: "continuous",
      message:
        "Anda telah menggunakan media sosial selama lebih dari 60 menit tanpa jeda.",
    });
  }

  if (notifMidnight && flagMidnightUsage && !prevMidnight) {
    notificationsToCreate.push({
      userId,
      type: "midnight",
      message:
        "Aktivitas media sosial terdeteksi pada jam tidur yang telah Anda tetapkan.",
    });
  }

  if (notifProductiveHour && flagProductiveHourDistraction && !prevProductive) {
    notificationsToCreate.push({
      userId,
      type: "productive_hour",
      message: "Penggunaan media sosial terdeteksi selama jam produktif Anda.",
    });
  }

  if (notificationsToCreate.length > 0) {
    await db.insert(table.notifications).values(notificationsToCreate);
  }

  return {
    totalScore,
    dailyStatus,
    flagExcessiveUsage,
    flagCompulsiveChecking,
    flagMidnightUsage,
    flagContinuousUsage,
    flagProductiveHourDistraction,
    notificationsCreatedCount: notificationsToCreate.length,
  };
}

export async function updateDailyStatsFromLogs(
  userId: string,
  statDate: string,
): Promise<void> {
  const startTs = new Date(`${statDate}T00:00:00+07:00`);
  const endTs = new Date(`${statDate}T23:59:59.999+07:00`);

  // Query activity logs for the user and date
  const logs = await db
    .select({
      appId: table.activityLogs.appId,
      durationSeconds: table.activityLogs.durationSeconds,
      isMidnight: table.activityLogs.isMidnight,
      isProductiveHour: table.activityLogs.isProductiveHour,
      startedAt: table.activityLogs.startedAt,
    })
    .from(table.activityLogs)
    .where(
      and(
        eq(table.activityLogs.userId, userId),
        gte(table.activityLogs.startedAt, startTs),
        lte(table.activityLogs.startedAt, endTs),
      ),
    );

  if (logs.length === 0) {
    return;
  }

  // Group by appId
  const appGroups = new Map<string, typeof logs>();
  for (const log of logs) {
    const list = appGroups.get(log.appId) ?? [];
    list.push(log);
    appGroups.set(log.appId, list);
  }

  for (const [appId, appLogs] of appGroups.entries()) {
    const totalDurationSeconds = appLogs.reduce(
      (sum, l) => sum + l.durationSeconds,
      0,
    );
    const openFrequency = appLogs.length;
    const midnightDurationSeconds = appLogs.reduce(
      (sum, l) => sum + (l.isMidnight ? l.durationSeconds : 0),
      0,
    );
    const productiveHourDurationSeconds = appLogs.reduce(
      (sum, l) => sum + (l.isProductiveHour ? l.durationSeconds : 0),
      0,
    );
    const maxContinuousSeconds = Math.max(
      ...appLogs.map((l) => l.durationSeconds),
    );

    // Calculate peakActiveHour
    const hourDurations = new Array(24).fill(0);
    for (const log of appLogs) {
      const dateInWIB = new Date(log.startedAt.getTime() + 7 * 60 * 60 * 1000);
      const hour = dateInWIB.getUTCHours();
      hourDurations[hour] += log.durationSeconds;
    }
    let peakActiveHour = 0;
    let maxHourDuration = -1;
    for (let h = 0; h < 24; h++) {
      if (hourDurations[h] > maxHourDuration) {
        maxHourDuration = hourDurations[h];
        peakActiveHour = h;
      }
    }

    // UPSERT daily stats
    await db
      .insert(table.dailyStats)
      .values({
        userId,
        appId,
        statDate,
        totalDurationSeconds,
        openFrequency,
        midnightDurationSeconds,
        productiveHourDurationSeconds,
        maxContinuousSeconds,
        peakActiveHour,
      })
      .onConflictDoUpdate({
        target: [
          table.dailyStats.userId,
          table.dailyStats.appId,
          table.dailyStats.statDate,
        ],
        set: {
          totalDurationSeconds,
          openFrequency,
          midnightDurationSeconds,
          productiveHourDurationSeconds,
          maxContinuousSeconds,
          peakActiveHour,
          updatedAt: new Date(),
        },
      });
  }
}

export async function syncDailyStatsService(
  body: unknown,
): Promise<ServiceResult<TrackingModel.syncStatsResponse>> {
  const parsed = TrackingModel.syncStatsRequest.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const { userId, deviceId, statDate, stats } = parsed.data;

  const deviceValid = await verifyDevice(deviceId, userId);
  if (!deviceValid) {
    return {
      success: false,
      error: "Device tidak ditemukan atau bukan milik user ini",
    };
  }

  // ── 1. Resolve appId ────────────────────────────────────────────────────────
  const appIdMap = await resolveAppIds(stats);

  // ── 2. UPSERT daily_stats ──────────────────────────────────────────────────
  let statsUpserted = 0;

  for (const stat of stats) {
    const key = stat.packageName ?? stat.webDomain ?? "";
    const appId = appIdMap.get(key);
    if (!appId) continue;

    await db
      .insert(table.dailyStats)
      .values({
        userId,
        appId,
        statDate,
        totalDurationSeconds: stat.totalDurationSeconds,
        openFrequency: stat.openFrequency,
        midnightDurationSeconds: stat.midnightDurationSeconds,
        productiveHourDurationSeconds: stat.productiveHourDurationSeconds,
        maxContinuousSeconds: stat.maxContinuousSeconds,
        peakActiveHour: stat.peakActiveHour,
      })
      .onConflictDoUpdate({
        target: [
          table.dailyStats.userId,
          table.dailyStats.appId,
          table.dailyStats.statDate,
        ],
        set: {
          totalDurationSeconds: stat.totalDurationSeconds,
          openFrequency: stat.openFrequency,
          midnightDurationSeconds: stat.midnightDurationSeconds,
          productiveHourDurationSeconds: stat.productiveHourDurationSeconds,
          maxContinuousSeconds: stat.maxContinuousSeconds,
          peakActiveHour: stat.peakActiveHour ?? null,
          updatedAt: new Date(),
        },
      });

    statsUpserted++;
  }

  // ── 3. Recalculate score and notifications ─────────────────────────────────
  const scoreResult = await recalculateScoreAndNotifications(userId, statDate);

  return {
    success: true,
    data: {
      statsUpserted,
      behavioralScore: {
        totalScore: scoreResult.totalScore,
        dailyStatus: scoreResult.dailyStatus,
        flagExcessiveUsage: scoreResult.flagExcessiveUsage,
        flagCompulsiveChecking: scoreResult.flagCompulsiveChecking,
        flagMidnightUsage: scoreResult.flagMidnightUsage,
        flagContinuousUsage: scoreResult.flagContinuousUsage,
        flagProductiveHourDistraction:
          scoreResult.flagProductiveHourDistraction,
      },
      notificationsCreated: scoreResult.notificationsCreatedCount,
    },
  };
}
