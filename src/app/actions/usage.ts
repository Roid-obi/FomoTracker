"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/databases";
import {
  activityLogs,
  apps,
  dailyStats,
  userDevices,
} from "@/lib/databases/schema";

export type UsageStatInput = {
  packageName: string;
  totalTimeInForeground: number; // in milliseconds
  openFrequency?: number;
  midnightDurationSeconds?: number;
  productiveHourDurationSeconds?: number;
  maxContinuousSeconds?: number;
};

export async function syncUsageStats(userId: string, stats: UsageStatInput[]) {
  if (!stats || stats.length === 0) return { success: true, count: 0 };

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let insertedCount = 0;

    for (const stat of stats) {
      if (!stat.packageName) continue;

      const durationSeconds = Math.floor(stat.totalTimeInForeground / 1000);
      if (durationSeconds <= 0) continue;
      const source = "android_app";

      // 1. Find or create the app in `apps` table
      let [appRecord] = await db
        .select()
        .from(apps)
        .where(eq(apps.packageName, stat.packageName));

      if (!appRecord) {
        const [newApp] = await db
          .insert(apps)
          .values({
            packageName: stat.packageName,
            name: stat.packageName.split(".").pop() || stat.packageName,
            platform: "android",
            isActive: true,
            createdAt: new Date(),
          })
          .returning();
        appRecord = newApp;
      }

      let [deviceRecord] = await db
        .select()
        .from(userDevices)
        .where(
          and(eq(userDevices.userId, userId), eq(userDevices.platform, source)),
        );

      if (!deviceRecord) {
        const now = new Date();
        const [newDevice] = await db
          .insert(userDevices)
          .values({
            userId,
            platform: source,
            deviceName: "Android Device",
            isConnected: true,
            lastSyncedAt: now,
            connectedAt: now,
            createdAt: now,
          })
          .returning();
        deviceRecord = newDevice;
      }

      // 2. Check if there's already a dailyStats record for today
      const [existingDailyStat] = await db
        .select()
        .from(dailyStats)
        .where(
          and(
            eq(dailyStats.userId, userId),
            eq(dailyStats.appId, appRecord.id),
            eq(dailyStats.statDate, today),
          ),
        );

      if (existingDailyStat) {
        // Update the duration
        // Note: Capgo gives us the *total* time in foreground for the interval.
        // If we query it daily, it's the total time for today.
        await db
          .update(dailyStats)
          .set({
            totalDurationSeconds: durationSeconds,
            openFrequency:
              stat.openFrequency ?? existingDailyStat.openFrequency,
            midnightDurationSeconds:
              stat.midnightDurationSeconds ??
              existingDailyStat.midnightDurationSeconds,
            productiveHourDurationSeconds:
              stat.productiveHourDurationSeconds ??
              existingDailyStat.productiveHourDurationSeconds,
            maxContinuousSeconds:
              stat.maxContinuousSeconds ??
              existingDailyStat.maxContinuousSeconds,
          })
          .where(eq(dailyStats.id, existingDailyStat.id));
      } else {
        // Insert new daily stats
        await db.insert(dailyStats).values({
          userId,
          appId: appRecord.id,
          statDate: today,
          totalDurationSeconds: durationSeconds,
          openFrequency: stat.openFrequency || 1,
          midnightDurationSeconds: stat.midnightDurationSeconds || 0,
          productiveHourDurationSeconds:
            stat.productiveHourDurationSeconds || 0,
          maxContinuousSeconds: stat.maxContinuousSeconds || 0,
          peakActiveHour: 0,
        });
      }

      // 3. (Optional) log to activityLog if we want detailed history
      // Usually activityLog is for specific sessions, but we can insert a bulk update entry
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);
      await db.insert(activityLogs).values({
        userId,
        appId: appRecord.id,
        deviceId: deviceRecord.id,
        startedAt,
        endedAt,
        durationSeconds,
        isMidnight: false,
        isProductiveHour: false,
        isContinuous: false,
        source,
        createdAt: new Date(),
      });

      insertedCount++;
    }

    return { success: true, count: insertedCount };
  } catch (error) {
    console.error("Error syncing usage stats:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
