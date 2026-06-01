import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/lib/databases/supabase";
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

interface CapacitorUsageStatsManagerPluginType {
  isUsageStatsPermissionGranted(): Promise<{ granted: boolean }>;
  openUsageStatsSettings(): Promise<void>;
  queryAndAggregateUsageStats(options: {
    beginTime: number;
    endTime: number;
  }): Promise<Record<string, UsageStatRecord>>;
  getInstalledApps(): Promise<{ apps: InstalledApp[] }>;
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
    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    const camelCasedSettings = settings
      ? {
          id: settings.id,
          userId: settings.user_id,
          productivityStart: settings.productivity_start,
          productivityEnd: settings.productivity_end,
          midnightStart: settings.midnight_start,
          midnightEnd: settings.midnight_end,
          screenTimeThresholdSec: settings.screen_time_threshold_sec,
          continuousThresholdSec: settings.continuous_threshold_sec,
          notificationEnabled: settings.notification_enabled,
          updatedAt: settings.updated_at,
        }
      : null;

    return { success: true, settings: camelCasedSettings };
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return { success: false, error: error.message };
  }
}

export async function syncUsageStatsClient(userId: string, stats: any[]) {
  if (!stats || stats.length === 0) return { success: true, count: 0 };

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let insertedCount = 0;

    for (const stat of stats) {
      if (!stat.packageName) continue;

      const durationSeconds = Math.floor(stat.totalTimeInForeground / 1000);
      if (durationSeconds <= 0) continue;

      // 1. Find or create the app in `apps` table
      let { data: appRecord } = await supabase
        .from("apps")
        .select("*")
        .eq("package_name", stat.packageName)
        .maybeSingle();

      if (!appRecord) {
        const { data: newApp, error: insertErr } = await supabase
          .from("apps")
          .insert({
            package_name: stat.packageName,
            app_name: stat.packageName.split(".").pop() || stat.packageName,
            platfrom: "Android", // note the platfrom typo in database schema
            is_active: true,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) {
          console.error("Failed to insert app:", insertErr);
          continue;
        }
        appRecord = newApp;
      }

      // 2. Check if there's already a dailyStats record for today
      const { data: existingDailyStat } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("app_id", appRecord.id)
        .eq("stat_date", today)
        .maybeSingle();

      if (existingDailyStat) {
        const { error: updateErr } = await supabase
          .from("daily_stats")
          .update({
            total_duration_seconds: durationSeconds,
            open_frequency: stat.openFrequency || existingDailyStat.open_frequency,
            midnight_duration_seconds:
              stat.midnightDurationSeconds ||
              existingDailyStat.midnight_duration_seconds,
            productive_hour_duration_seconds:
              stat.productiveHourDurationSeconds ||
              existingDailyStat.productive_hour_duration_seconds,
            max_continuous_seconds:
              stat.maxContinuousSeconds ||
              existingDailyStat.max_continuous_seconds,
          })
          .eq("id", existingDailyStat.id);

        if (updateErr) {
          console.error("Failed to update daily stats:", updateErr);
          continue;
        }
      } else {
        const { error: insertErr } = await supabase
          .from("daily_stats")
          .insert({
            user_id: userId,
            app_id: appRecord.id,
            stat_date: today,
            total_duration_seconds: durationSeconds,
            open_frequency: stat.openFrequency || 1,
            midnight_duration_seconds: stat.midnightDurationSeconds || 0,
            productive_hour_duration_seconds:
              stat.productiveHourDurationSeconds || 0,
            max_continuous_seconds: stat.maxContinuousSeconds || 0,
            peak_active_hour: 0,
          });

        if (insertErr) {
          console.error("Failed to insert daily stats:", insertErr);
          continue;
        }
      }

      // 3. Log to activityLog
      await supabase.from("activity_log").insert({
        user_id: userId,
        app_id: appRecord.id,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        is_midnight: false,
        is_productive_hour: false,
        is_continuous: false,
        created_at: new Date().toISOString(),
      });

      insertedCount++;
    }

    return { success: true, count: insertedCount };
  } catch (error: any) {
    console.error("Error syncing usage stats:", error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error("Failed to fetch and sync usage data:", error);
    return { success: false, error: error.message };
  }
}
