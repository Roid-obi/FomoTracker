import { Capacitor, registerPlugin } from "@capacitor/core";
import { api } from "@/lib/utils/api";
import { analyzeUsageEvents, fetchUsageEvents } from "./usageEvents";

export interface InstalledApp {
  packageName: string;
  appName: string;
  isSystem: boolean;
}

interface UsageStatRecord {
  packageName: string;
  totalTimeInForeground: number;
}

type SyncUsageStatInput = UsageStatRecord & {
  openFrequency?: number;
  midnightDurationSeconds?: number;
  productiveHourDurationSeconds?: number;
  maxContinuousSeconds?: number;
};

interface CapacitorUsageStatsManagerPluginType {
  isUsageStatsPermissionGranted(): Promise<{ granted: boolean }>;
  openUsageStatsSettings(): Promise<void>;
  queryAndAggregateUsageStats(options: {
    beginTime: number;
    endTime: number;
  }): Promise<Record<string, UsageStatRecord>>;
  getInstalledApps(): Promise<{ apps: InstalledApp[] }>;
  setupBackgroundSync(options: {
    userId: string;
    deviceId: string;
    monitoredApps: string[];
  }): Promise<{ success: boolean }>;
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

export async function fetchInstalledApps(): Promise<InstalledApp[]> {
  if (Capacitor.getPlatform() !== "android") {
    // Return mock applications for browser testing
    return [
      {
        packageName: "com.instagram.android",
        appName: "Instagram",
        isSystem: false,
      },
      {
        packageName: "com.zhiliaoapp.musically",
        appName: "TikTok",
        isSystem: false,
      },
      { packageName: "com.whatsapp", appName: "WhatsApp", isSystem: false },
      {
        packageName: "com.google.android.youtube",
        appName: "YouTube",
        isSystem: true,
      },
      {
        packageName: "com.facebook.katana",
        appName: "Facebook",
        isSystem: false,
      },
      {
        packageName: "com.twitter.android",
        appName: "X (Twitter)",
        isSystem: false,
      },
    ];
  }

  try {
    const { apps } = await CapacitorUsageStatsManager.getInstalledApps();
    return apps;
  } catch (error) {
    console.error("Error fetching installed apps:", error);
    return [];
  }
}

export async function getUserSettingsClient(userId: string) {
  try {
    const res = await api.get<{ success: boolean; data: any }>("/api/setting/user");
    if (!res.data.success) {
      throw new Error("Gagal mengambil pengaturan");
    }
    const settings = res.data.data;

    const camelCasedSettings = settings
      ? {
          id: "",
          userId: userId,
          productiveStart: settings.productiveStart,
          productiveEnd: settings.productiveEnd,
          sleepStart: settings.sleepStart,
          sleepEnd: settings.sleepEnd,
          screenTimeLimitSeconds: settings.screenTimeLimitSeconds,
          continuousLimitSeconds: settings.continuousLimitSeconds,
          notifScreenTimeEnabled: settings.notifScreenTimeEnabled,
          notifProductiveHourEnabled: settings.notifProductiveHourEnabled,
          notifMidnightEnabled: settings.notifMidnightEnabled,
          notifContinuousEnabled: settings.notifContinuousEnabled,
          updatedAt: null,
        }
      : null;

    return { success: true, settings: camelCasedSettings };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function syncUsageStatsClient(
  userId: string,
  stats: SyncUsageStatInput[],
) {
  if (!stats || stats.length === 0) return { success: true, count: 0 };

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const source = "android_app";

    // 1. Get or register the user device in backend database
    const deviceRes = await api.put<{ success: boolean; data: { id: string } }>(
      "/api/setting/device",
      {
        platform: source,
        deviceName: "Android Device",
        isConnected: true,
      },
    );

    if (!deviceRes.data.success) {
      throw new Error("Gagal menyinkronkan data perangkat");
    }
    const deviceId = deviceRes.data.data.id;

    // 2. Prepare payload for stats sync
    const statsPayload = stats.map((stat) => ({
      packageName: stat.packageName,
      totalDurationSeconds: Math.floor(stat.totalTimeInForeground / 1000),
      openFrequency: stat.openFrequency || 1,
      midnightDurationSeconds: stat.midnightDurationSeconds || 0,
      productiveHourDurationSeconds: stat.productiveHourDurationSeconds || 0,
      maxContinuousSeconds: stat.maxContinuousSeconds || 0,
    }));

    // Post to `/api/tracking/sync/stats`
    const statsRes = await api.post("/api/tracking/sync/stats", {
      userId,
      deviceId,
      statDate: today,
      stats: statsPayload,
    });

    if (!statsRes.data.success) {
      throw new Error(
        statsRes.data.error || "Gagal menyinkronkan stats harian",
      );
    }

    // 3. Prepare payload for activity logs sync
    const logsPayload = stats.map((stat) => {
      const durationSeconds = Math.floor(stat.totalTimeInForeground / 1000);
      const endedAt = new Date().toISOString();
      const startedAt = new Date(
        Date.now() - durationSeconds * 1000,
      ).toISOString();
      return {
        packageName: stat.packageName,
        startedAt,
        endedAt,
        durationSeconds,
        isMidnight: (stat.midnightDurationSeconds || 0) > 0,
        isProductiveHour: (stat.productiveHourDurationSeconds || 0) > 0,
        isContinuous: (stat.maxContinuousSeconds || 0) > 0,
        source: "android_app" as const,
      };
    });

    // Post to `/api/tracking/sync/activity`
    const logsRes = await api.post("/api/tracking/sync/activity", {
      userId,
      deviceId,
      logs: logsPayload,
    });

    if (!logsRes.data.success) {
      throw new Error(
        logsRes.data.error || "Gagal menyinkronkan log aktivitas",
      );
    }

    return { success: true, count: stats.length };
  } catch (error) {
    console.error("Error syncing usage stats:", error);
    return { success: false, error: getErrorMessage(error) };
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
    const settingsResponse = await getUserSettingsClient(userId);
    const settings = settingsResponse.success
      ? settingsResponse.settings
      : null;

    const sleepStartStr = settings?.sleepStart || "22:00:00";
    const sleepEndStr = settings?.sleepEnd || "06:00:00";
    const productiveStartStr = settings?.productiveStart || "09:00:00";
    const productiveEndStr = settings?.productiveEnd || "17:00:00";

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
      sleepStartStr,
      sleepEndStr,
      productiveStartStr,
      productiveEndStr,
    );

    // Read user's monitored apps selection from localStorage
    let monitoredApps: string[] = [];
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("fomotracker_monitored_apps");
      if (stored) {
        try {
          monitoredApps = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse monitored apps from localStorage:", e);
        }
      }
    }

    // Filter to only sync monitored applications
    const filteredStats = Object.values(statsRecord).filter((stat) =>
      monitoredApps.includes(stat.packageName),
    );

    const statsToSync = filteredStats.map((stat) => {
      const details = detailedSessions[stat.packageName];
      return {
        packageName: stat.packageName,
        totalTimeInForeground: stat.totalTimeInForeground,
        openFrequency: details ? details.frequency : 1,
        midnightDurationSeconds: details ? details.midnightDurationSeconds : 0,
        productiveHourDurationSeconds: details
          ? details.productiveHourDurationSeconds
          : 0,
        maxContinuousSeconds: details ? details.maxContinuousSeconds : 0,
      };
    });

    if (statsToSync.length > 0) {
      const syncResult = await syncUsageStatsClient(userId, statsToSync);
      return syncResult;
    }

    return { success: true, count: 0 };
  } catch (error) {
    console.error("Failed to fetch and sync usage data:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
