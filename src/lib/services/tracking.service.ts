import { and, eq, inArray, or, sql } from "drizzle-orm";
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

/** Clamp nilai ke rentang [lo, hi] */
function clamp(value: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, value));
}

/** Tentukan status harian dari total skor */
function calcDailyStatus(score: number): "good" | "attention" | "heavy" {
  if (score < 40) return "good";
  if (score < 70) return "attention";
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

  // Resolve semua appId sekaligus dalam satu query
  const appIdMap = await resolveAppIds(logs);

  const toInsert: (typeof table.activityLogs.$inferInsert)[] = [];
  let skipped = 0;

  for (const log of logs) {
    const key = log.packageName ?? log.webDomain ?? "";
    const appId = appIdMap.get(key);
    if (!appId) {
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

  const screenTimeLimit = settings?.screenTimeLimitSeconds ?? 10800; // default 3 jam
  const continuousLimit = settings?.continuousLimitSeconds ?? 2700; // default 45 menit
  const notifScreenTime = settings?.notifScreenTimeEnabled ?? true;
  const notifMidnight = settings?.notifMidnightEnabled ?? true;
  const notifContinuous = settings?.notifContinuousEnabled ?? true;
  const notifProductiveHour = settings?.notifProductiveHourEnabled ?? true;

  // ── 2. Resolve appId ────────────────────────────────────────────────────────
  const appIdMap = await resolveAppIds(stats);

  // ── 3. UPSERT daily_stats ──────────────────────────────────────────────────
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

  // ── 4. Agregasi seluruh daily_stats user untuk statDate ────────────────────
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
  const totalOpenFrequency = Number(agg?.totalOpenFrequency ?? 0);
  const totalMidnight = Number(agg?.totalMidnight ?? 0);
  const totalProductiveHour = Number(agg?.totalProductiveHour ?? 0);
  const maxContinuous = Number(agg?.maxContinuous ?? 0);

  // ── 5. Hitung skor per dimensi (0–100, makin tinggi = makin buruk) ─────────
  //   Normalisasi referensi:
  //   • usageDuration   → threshold user (screenTimeLimitSeconds)
  //   • openFrequency   → 50 buka/hari lintas semua app = skor penuh
  //   • midnightUsage   → 1 jam (3600 s) di jam tidur = skor penuh
  //   • continuousUsage → threshold user (continuousLimitSeconds)
  //   • productiveHour  → 50% dari screenTimeLimitSeconds = skor penuh
  const usageDurationScore = clamp((totalScreenTime / screenTimeLimit) * 100);
  const openFrequencyScore = clamp((totalOpenFrequency / 50) * 100);
  const midnightUsageScore = clamp((totalMidnight / 3600) * 100);
  const continuousUsageScore = clamp((maxContinuous / continuousLimit) * 100);
  const productiveHourScore = clamp(
    (totalProductiveHour / (screenTimeLimit * 0.5)) * 100,
  );

  const totalScore =
    0.3 * usageDurationScore +
    0.2 * openFrequencyScore +
    0.2 * midnightUsageScore +
    0.15 * continuousUsageScore +
    0.15 * productiveHourScore;

  const dailyStatus = calcDailyStatus(totalScore);

  // ── 6. Deteksi flag perilaku ────────────────────────────────────────────────
  const flagExcessiveUsage = totalScreenTime > screenTimeLimit;
  const flagCompulsiveChecking = totalOpenFrequency > 30; // > 30 buka/hari
  const flagMidnightUsage = totalMidnight > 0;
  const flagContinuousUsage = maxContinuous > continuousLimit;
  const flagProductiveHourDistraction = totalProductiveHour > 0;

  // ── 7. UPSERT behavioral_scores ────────────────────────────────────────────
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
      target: [
        table.behavioralScores.userId,
        table.behavioralScores.scoreDate,
      ],
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

  // ── 8. Buat notifikasi untuk setiap pelanggaran threshold ──────────────────
  const notificationsToCreate: (typeof table.notifications.$inferInsert)[] = [];

  if (notifScreenTime && flagExcessiveUsage) {
    const hours = (totalScreenTime / 3600).toFixed(1);
    const limitHours = (screenTimeLimit / 3600).toFixed(1);
    notificationsToCreate.push({
      userId,
      type: "screen_time",
      message: `Waktu layar kamu hari ini sudah ${hours} jam, melebihi batas ${limitHours} jam. Yuk istirahat sejenak! 📵`,
    });
  }

  if (notifMidnight && flagMidnightUsage) {
    const minutes = Math.round(totalMidnight / 60);
    notificationsToCreate.push({
      userId,
      type: "midnight",
      message: `Kamu menggunakan HP selama ${minutes} menit di jam tidur. Kurangi layar di malam hari agar tidurmu lebih berkualitas. 🌙`,
    });
  }

  if (notifContinuous && flagContinuousUsage) {
    const minutes = Math.round(maxContinuous / 60);
    notificationsToCreate.push({
      userId,
      type: "continuous",
      message: `Kamu menatap layar nonstop selama ${minutes} menit. Istirahatkan mata dan gerakkan badanmu sejenak! 👀`,
    });
  }

  if (notifProductiveHour && flagProductiveHourDistraction) {
    const minutes = Math.round(totalProductiveHour / 60);
    notificationsToCreate.push({
      userId,
      type: "productive_hour",
      message: `Kamu menggunakan HP ${minutes} menit saat jam belajar/kerja. Fokus dulu, HP-nya belakangan! 💪`,
    });
  }

  if (notificationsToCreate.length > 0) {
    await db.insert(table.notifications).values(notificationsToCreate);
  }

  return {
    success: true,
    data: {
      statsUpserted,
      behavioralScore: {
        totalScore,
        dailyStatus,
        flagExcessiveUsage,
        flagCompulsiveChecking,
        flagMidnightUsage,
        flagContinuousUsage,
        flagProductiveHourDistraction,
      },
      notificationsCreated: notificationsToCreate.length,
    },
  };
}