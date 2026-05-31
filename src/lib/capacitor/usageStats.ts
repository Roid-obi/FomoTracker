import { Capacitor, registerPlugin } from "@capacitor/core";
import { getUserSettings } from "@/app/actions/settings";
import { syncUsageStats } from "@/app/actions/usage";
import { analyzeUsageEvents, fetchUsageEvents } from "./usageEvents";

interface UsageStatRecord {
  packageName: string;
  totalTimeInForeground: number;
}

interface CapacitorUsageStatsManagerPluginType {
  isUsageStatsPermissionGranted(): Promise<{ granted: boolean }>;
  openUsageStatsSettings(): Promise<void>;
  queryAndAggregateUsageStats(options: {
    beginTime: number;
    endTime: number;
  }): Promise<Record<string, UsageStatRecord>>;
}

const CapacitorUsageStatsManager =
  registerPlugin<CapacitorUsageStatsManagerPluginType>(
    "CapacitorUsageStatsManager",
  );

export async function checkAndRequestUsagePermission(): Promise<boolean> {
  if (Capacitor.getPlatform() !== "android") return true;

  try {
    const { granted } =
      await CapacitorUsageStatsManager.isUsageStatsPermissionGranted();
    if (!granted) {
      await CapacitorUsageStatsManager.openUsageStatsSettings();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking usage permission:", error);
    return false;
  }
}

export async function fetchAndSyncUsageData(userId: string) {
  if (Capacitor.getPlatform() !== "android") {
    console.warn("Usage tracking is only supported on Android.");
    return { success: false, message: "Not Android" };
  }

  const hasPermission = await checkAndRequestUsagePermission();
  if (!hasPermission) {
    return {
      success: false,
      message: "Permission not granted or user needs to enable it in Settings.",
    };
  }

  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // Ambil setting user untuk jam produktif dan malam hari
    const settingsResponse = await getUserSettings(userId);
    const settings = settingsResponse.success
      ? settingsResponse.settings
      : null;

    const midnightStartStr = settings?.midnightStart || "00:00:00";
    const midnightEndStr = settings?.midnightEnd || "05:00:00";
    const productiveStartStr = settings?.productivityStart || "09:00:00";
    const productiveEndStr = settings?.productivityEnd || "17:00:00";

    const statsRecord =
      await CapacitorUsageStatsManager.queryAndAggregateUsageStats({
        beginTime: startOfDay.getTime(),
        endTime: now.getTime(),
      });

    const rawEvents = await fetchUsageEvents(
      startOfDay.getTime(),
      now.getTime(),
    );
    const detailedSessions = analyzeUsageEvents(
      rawEvents,
      midnightStartStr,
      midnightEndStr,
      productiveStartStr,
      productiveEndStr,
    );

    const statsToSync = Object.values(statsRecord).map((stat) => {
      const details = detailedSessions[stat.packageName];
      return {
        packageName: stat.packageName,
        totalTimeInForeground: stat.totalTimeInForeground,
        openFrequency: details ? details.frequency : 1,
        midnightDurationSeconds: details ? details.midnightDurationSeconds : 0,
        productiveHourDurationSeconds: details
          ? details.productiveHourDurationSeconds
          : 0,
      };
    });

    if (statsToSync.length > 0) {
      const syncResult = await syncUsageStats(userId, statsToSync);
      return syncResult;
    }

    return { success: true, count: 0 };
  } catch (error: any) {
    console.error("Failed to fetch and sync usage data:", error);
    return { success: false, error: error.message };
  }
}
