import { Capacitor, registerPlugin } from "@capacitor/core";
import { api } from "@/lib/utils/api";
import {
  analyzeUsageEvents,
  type DetailedSession,
  fetchUsageEvents,
  getDetailedSessions,
} from "./usageEvents";

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
    sleepStart?: string;
    sleepEnd?: string;
    productiveStart?: string;
    productiveEnd?: string;
    continuousLimitSeconds?: number;
    screenTimeLimitSeconds?: number;
    notifScreenTimeEnabled?: boolean;
    notifProductiveHourEnabled?: boolean;
    notifMidnightEnabled?: boolean;
    notifContinuousEnabled?: boolean;
  }): Promise<{ success: boolean }>;
  checkNotificationPermission(): Promise<{ granted: boolean }>;
  requestNotificationPermission(): Promise<{ success: boolean }>;
  getDeviceInfo(): Promise<{
    manufacturer: string;
    model: string;
    deviceName: string;
  }>;
  triggerLocalNotification(options: {
    type: string;
    message: string;
  }): Promise<void>;
}

const CapacitorUsageStatsManager =
  registerPlugin<CapacitorUsageStatsManagerPluginType>(
    "CapacitorUsageStatsManager",
  );

export async function isUsageStatsPermissionGranted(): Promise<boolean> {
  if (Capacitor.getPlatform() !== "android") return true;
  try {
    const { granted } =
      await CapacitorUsageStatsManager.isUsageStatsPermissionGranted();
    return granted;
  } catch (error) {
    console.error("Error checking permission granted:", error);
    return false;
  }
}

export async function openUsageStatsSettings(): Promise<void> {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await CapacitorUsageStatsManager.openUsageStatsSettings();
  } catch (error) {
    console.error("Error opening usage stats settings:", error);
  }
}

export async function checkAndRequestUsagePermission(): Promise<boolean> {
  if (Capacitor.getPlatform() !== "android") return true;

  try {
    const granted = await isUsageStatsPermissionGranted();
    if (!granted) {
      await openUsageStatsSettings();
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
    const res = await api.get<{ success: boolean; data: any }>(
      "/api/setting/user",
    );
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

interface QueueItem {
  id: string;
  userId: string;
  statDate: string;
  stats: {
    packageName: string;
    totalDurationSeconds: number;
    openFrequency: number;
    midnightDurationSeconds: number;
    productiveHourDurationSeconds: number;
    maxContinuousSeconds: number;
  }[];
  logs: {
    packageName: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    isMidnight: boolean;
    isProductiveHour: boolean;
    isContinuous: boolean;
    source: "android_app";
  }[];
}

export async function processSyncQueue() {
  if (typeof window === "undefined") return;

  const rawQueue = window.localStorage.getItem("fomotracker_sync_queue");
  if (!rawQueue) return;

  let queue: QueueItem[] = [];
  try {
    queue = JSON.parse(rawQueue);
  } catch (err) {
    console.error("Failed to parse sync queue:", err);
    return;
  }
  if (queue.length === 0) return;

  console.log(`Processing sync queue with ${queue.length} items...`);

  const remainingQueue: QueueItem[] = [];
  let connectionFailed = false;

  for (const item of queue) {
    if (connectionFailed) {
      remainingQueue.push(item);
      continue;
    }

    try {
      // 1. Get or register the user device in backend database
      let deviceName = "Android Device";
      try {
        if (CapacitorUsageStatsManager?.getDeviceInfo) {
          const info = await CapacitorUsageStatsManager.getDeviceInfo();
          if (info?.deviceName) {
            deviceName = info.deviceName;
          }
        }
      } catch (e) {
        console.error("Failed to get native device info during queue sync:", e);
      }

      const deviceRes = await api.put<{
        success: boolean;
        data: { id: string };
      }>("/api/setting/device", {
        platform: "android_app",
        deviceName,
        isConnected: true,
      });

      if (!deviceRes.data.success) {
        throw new Error("Gagal menyinkronkan data perangkat");
      }
      const deviceId = deviceRes.data.data.id;

      // 2. Send stats
      const statsRes = await api.post("/api/tracking/sync/stats", {
        userId: item.userId,
        deviceId,
        statDate: item.statDate,
        stats: item.stats,
      });

      if (!statsRes.data.success) {
        throw new Error(
          statsRes.data.error || "Gagal menyinkronkan stats harian",
        );
      }

      // Trigger local notifications on Android for any new behavioral alerts created
      if (statsRes.data.data?.newNotifications) {
        const newNotifs = statsRes.data.data.newNotifications;
        if (Array.isArray(newNotifs) && newNotifs.length > 0) {
          if (CapacitorUsageStatsManager?.triggerLocalNotification) {
            for (const notif of newNotifs) {
              try {
                await CapacitorUsageStatsManager.triggerLocalNotification({
                  type: notif.type,
                  message: notif.message,
                });
              } catch (err) {
                console.error("Failed to trigger local notification:", err);
              }
            }
          }
        }
      }

      // 3. Send logs if any
      if (item.logs.length > 0) {
        const logsRes = await api.post("/api/tracking/sync/activity", {
          userId: item.userId,
          deviceId,
          logs: item.logs,
        });

        if (!logsRes.data.success) {
          throw new Error(
            logsRes.data.error || "Gagal menyinkronkan log aktivitas",
          );
        }
      }

      console.log(`Successfully synced batch ${item.id}`);
    } catch (error) {
      console.error(`Failed to sync batch ${item.id}:`, error);
      connectionFailed = true;
      remainingQueue.push(item);
    }
  }

  window.localStorage.setItem(
    "fomotracker_sync_queue",
    JSON.stringify(remainingQueue),
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Device is online, processing sync queue...");
    processSyncQueue().catch((err) => {
      console.error("Failed to process sync queue on online event:", err);
    });
  });
}

export async function syncUsageStatsClient(
  userId: string,
  stats: SyncUsageStatInput[],
  detailedSessions: DetailedSession[] = [],
) {
  if (!stats || stats.length === 0) return { success: true, count: 0 };

  try {
    const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // 1. Prepare stats payload
    const statsPayload = stats.map((stat) => ({
      packageName: stat.packageName,
      totalDurationSeconds: Math.floor(stat.totalTimeInForeground / 1000),
      openFrequency: stat.openFrequency || 1,
      midnightDurationSeconds: stat.midnightDurationSeconds || 0,
      productiveHourDurationSeconds: stat.productiveHourDurationSeconds || 0,
      maxContinuousSeconds: stat.maxContinuousSeconds || 0,
    }));

    // 2. Prepare logs payload
    let logsPayload = [];
    if (detailedSessions && detailedSessions.length > 0) {
      logsPayload = detailedSessions.map((session) => ({
        packageName: session.packageName,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        isMidnight: session.isMidnight,
        isProductiveHour: session.isProductiveHour,
        isContinuous: session.isContinuous,
        source: "android_app" as const,
      }));
    } else {
      logsPayload = stats.map((stat) => {
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
    }

    // 3. Save to local queue
    if (typeof window !== "undefined") {
      const queueItem: QueueItem = {
        id: Math.random().toString(36).substring(7),
        userId,
        statDate: today,
        stats: statsPayload,
        logs: logsPayload,
      };

      const rawQueue = window.localStorage.getItem("fomotracker_sync_queue");
      const queue: QueueItem[] = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push(queueItem);
      window.localStorage.setItem(
        "fomotracker_sync_queue",
        JSON.stringify(queue),
      );

      // Attempt immediate processing in the background (does not block this method)
      processSyncQueue().catch((err) => {
        console.error("Failed to process sync queue:", err);
      });
    }

    return { success: true, count: stats.length };
  } catch (error) {
    console.error("Error syncing usage stats:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function fetchTrackedAppsClient(): Promise<string[]> {
  try {
    const res = await api.get<{
      success: boolean;
      data: any[];
    }>("/api/setting/tracked-app");
    if (!res.data.success) {
      throw new Error("Gagal mengambil daftar aplikasi yang dipantau");
    }
    return res.data.data
      .filter((app) => app.isActive)
      .map((app) => app.packageName)
      .filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching tracked apps:", error);
    return [];
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
    const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const startOfDay = new Date(`${today}T00:00:00+07:00`);

    // Ambil setting user untuk jam produktif dan malam hari
    const settingsResponse = await getUserSettingsClient(userId);
    const settings = settingsResponse.success
      ? settingsResponse.settings
      : null;

    const sleepStartStr = settings?.sleepStart || "22:00:00";
    const sleepEndStr = settings?.sleepEnd || "06:00:00";
    const productiveStartStr = settings?.productiveStart || "09:00:00";
    const productiveEndStr = settings?.productiveEnd || "17:00:00";

    const endOfDay = new Date(`${today}T23:59:59.999+07:00`);

    const statsRecord =
      await CapacitorUsageStatsManager.queryAndAggregateUsageStats({
        beginTime: startOfDay.getTime(),
        endTime: endOfDay.getTime(),
      });

    const rawEvents = await fetchUsageEvents(
      startOfDay.getTime(),
      endOfDay.getTime(),
    );
    const detailedSessions = analyzeUsageEvents(
      rawEvents,
      sleepStartStr,
      sleepEndStr,
      productiveStartStr,
      productiveEndStr,
    );

    const monitoredApps = await fetchTrackedAppsClient();

    const continuousLimitSeconds = settings?.continuousLimitSeconds ?? 3600;
    const sessionsList = getDetailedSessions(
      rawEvents,
      monitoredApps,
      sleepStartStr,
      sleepEndStr,
      productiveStartStr,
      productiveEndStr,
      continuousLimitSeconds,
    );

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
      const syncResult = await syncUsageStatsClient(
        userId,
        statsToSync,
        sessionsList,
      );
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
