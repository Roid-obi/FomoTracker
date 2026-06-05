import {
  initialActivityLogs,
  initialApps,
  initialBehavioralScores,
  initialDailyStats,
  initialNotifications,
  initialUserDevices,
  initialUserSettings,
  initialUsers,
  initialUserTrackedApps,
  initialWeeklyInsights,
} from "../data/databaseInitialData";
import { db } from "../databases";
import {
  type NewActivityLog,
  type NewApp,
  type NewBehavioralScore,
  type NewDailyStat,
  type NewNotification,
  type NewUser,
  type NewUserDevice,
  type NewUserSettings,
  type NewUserTrackedApp,
  type NewWeeklyInsight,
  table,
} from "../databases/schema";

async function main() {
  const mode = getMode();

  if (mode === "fresh") {
    await resetDatabase();
  } else if (mode === "reset") {
    await resetDatabase();
    console.log("Reset complete!");
    process.exit(0);
  }

  await seedInitialData();

  console.log("Seeding complete!");
  process.exit(0);
}

async function seedInitialData() {
  await db
    .insert(table.users)
    .values(initialUsers.map(mapUser))
    .onConflictDoNothing();

  await db
    .insert(table.userSettings)
    .values(initialUserSettings.map(mapUserSettings))
    .onConflictDoNothing();

  await db
    .insert(table.apps)
    .values(initialApps.map(mapApp))
    .onConflictDoNothing();

  await db
    .insert(table.userTrackedApps)
    .values(initialUserTrackedApps.map(mapUserTrackedApp))
    .onConflictDoNothing();

  await db
    .insert(table.userDevices)
    .values(initialUserDevices.map(mapUserDevice))
    .onConflictDoNothing();

  await db
    .insert(table.activityLogs)
    .values(initialActivityLogs.map(mapActivityLog))
    .onConflictDoNothing();

  await db
    .insert(table.dailyStats)
    .values(initialDailyStats.map(mapDailyStat))
    .onConflictDoNothing();

  await db
    .insert(table.behavioralScores)
    .values(initialBehavioralScores.map(mapBehavioralScore))
    .onConflictDoNothing();

  await db
    .insert(table.weeklyInsights)
    .values(initialWeeklyInsights.map(mapWeeklyInsight))
    .onConflictDoNothing();

  await db
    .insert(table.notifications)
    .values(initialNotifications.map(mapNotification))
    .onConflictDoNothing();
}

async function resetDatabase() {
  await db.delete(table.notifications);
  await db.delete(table.weeklyInsights);
  await db.delete(table.behavioralScores);
  await db.delete(table.dailyStats);
  await db.delete(table.activityLogs);
  await db.delete(table.userDevices);
  await db.delete(table.userTrackedApps);
  await db.delete(table.userSettings);
  await db.delete(table.apps);
  await db.delete(table.users);
}

function mapUser(user: (typeof initialUsers)[number]): NewUser {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
    onboardingCompleted: user.onboarding_completed,
    dataStartDate: user.data_start_date,
    createdAt: toDate(user.created_at),
    updatedAt: toDate(user.updated_at),
  };
}

function mapUserSettings(
  settings: (typeof initialUserSettings)[number],
): NewUserSettings {
  return {
    id: settings.id,
    userId: settings.user_id,
    productiveStart: settings.productive_start,
    productiveEnd: settings.productive_end,
    sleepStart: settings.sleep_start,
    sleepEnd: settings.sleep_end,
    screenTimeLimitSeconds: settings.screen_time_limit_seconds,
    continuousLimitSeconds: settings.continuous_limit_seconds,
    notifScreenTimeEnabled: settings.notif_screen_time_enabled,
    notifProductiveHourEnabled: settings.notif_productive_hour_enabled,
    notifMidnightEnabled: settings.notif_midnight_enabled,
    notifContinuousEnabled: settings.notif_continuous_enabled,
    updatedAt: toDate(settings.updated_at),
  };
}

function mapApp(app: (typeof initialApps)[number]): NewApp {
  return {
    id: app.id,
    name: app.name,
    packageName: app.package_name,
    webDomain: app.web_domain,
    category: app.category,
    iconUrl: app.icon_url,
    platform: app.platform,
    isActive: app.is_active,
    createdAt: toDate(app.created_at),
  };
}

function mapUserTrackedApp(
  trackedApp: (typeof initialUserTrackedApps)[number],
): NewUserTrackedApp {
  return {
    id: trackedApp.id,
    userId: trackedApp.user_id,
    appId: trackedApp.app_id,
    isActive: trackedApp.is_active,
    addedAt: toDate(trackedApp.added_at),
  };
}

function mapUserDevice(
  device: (typeof initialUserDevices)[number],
): NewUserDevice {
  return {
    id: device.id,
    userId: device.user_id,
    platform: device.platform,
    deviceName: device.device_name,
    browserName: device.browser_name,
    isConnected: device.is_connected,
    lastSyncedAt: toNullableDate(device.last_synced_at),
    connectedAt: toNullableDate(device.connected_at),
    createdAt: toDate(device.created_at),
  };
}

function mapActivityLog(
  activityLog: (typeof initialActivityLogs)[number],
): NewActivityLog {
  return {
    id: activityLog.id,
    userId: activityLog.user_id,
    appId: activityLog.app_id,
    deviceId: activityLog.device_id,
    startedAt: toDate(activityLog.started_at),
    endedAt: toDate(activityLog.ended_at),
    durationSeconds: activityLog.duration_seconds,
    isMidnight: activityLog.is_midnight,
    isProductiveHour: activityLog.is_productive_hour,
    isContinuous: activityLog.is_continuous,
    source: activityLog.source,
    createdAt: toDate(activityLog.created_at),
  };
}

function mapDailyStat(
  dailyStat: (typeof initialDailyStats)[number],
): NewDailyStat {
  return {
    id: dailyStat.id,
    userId: dailyStat.user_id,
    appId: dailyStat.app_id,
    statDate: dailyStat.stat_date,
    totalDurationSeconds: dailyStat.total_duration_seconds,
    openFrequency: dailyStat.open_frequency,
    midnightDurationSeconds: dailyStat.midnight_duration_seconds,
    productiveHourDurationSeconds: dailyStat.productive_hour_duration_seconds,
    maxContinuousSeconds: dailyStat.max_continuous_seconds,
    peakActiveHour: dailyStat.peak_active_hour,
    createdAt: toDate(dailyStat.created_at),
    updatedAt: toDate(dailyStat.updated_at),
  };
}

function mapBehavioralScore(
  score: (typeof initialBehavioralScores)[number],
): NewBehavioralScore {
  return {
    id: score.id,
    userId: score.user_id,
    scoreDate: score.score_date,
    usageDurationScore: score.usage_duration_score,
    openFrequencyScore: score.open_frequency_score,
    midnightUsageScore: score.midnight_usage_score,
    continuousUsageScore: score.continuous_usage_score,
    productiveHourScore: score.productive_hour_score,
    totalScore: score.total_score,
    dailyStatus: score.daily_status,
    flagExcessiveUsage: score.flag_excessive_usage,
    flagCompulsiveChecking: score.flag_compulsive_checking,
    flagMidnightUsage: score.flag_midnight_usage,
    flagContinuousUsage: score.flag_continuous_usage,
    flagProductiveHourDistraction: score.flag_productive_hour_distraction,
    createdAt: toDate(score.created_at),
    updatedAt: toDate(score.updated_at),
  };
}

function mapWeeklyInsight(
  insight: (typeof initialWeeklyInsights)[number],
): NewWeeklyInsight {
  return {
    id: insight.id,
    userId: insight.user_id,
    weekStart: insight.week_start,
    weekEnd: insight.week_end,
    generatedAt: toDate(insight.generated_at),
    totalScreenTimeSeconds: insight.total_screen_time_seconds,
    avgBehavioralScore: insight.avg_behavioral_score,
    weeklyStatus: insight.weekly_status,
    bestDay: insight.best_day,
    worstDay: insight.worst_day,
    topAppId: insight.top_app_id,
    prevWeekScreenTimeSeconds: insight.prev_week_screen_time_seconds,
    aiWeeklyStatusLabel: insight.ai_weekly_status_label,
    aiPositiveNotes: insight.ai_positive_notes,
    aiConcernNotes: insight.ai_concern_notes,
    aiAnalysis: insight.ai_analysis,
    aiTips: insight.ai_tips,
    generationStatus: insight.generation_status,
    createdAt: toDate(insight.created_at),
    updatedAt: toDate(insight.updated_at),
  };
}

function mapNotification(
  notification: (typeof initialNotifications)[number],
): NewNotification {
  return {
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    message: notification.message,
    isRead: notification.is_read,
    createdAt: toDate(notification.created_at),
  };
}

function toDate(value: string) {
  return new Date(value);
}

function toNullableDate(value: string | null) {
  return value ? new Date(value) : null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

type Mode = "fresh" | "reset" | null;

function getMode(): Mode {
  const args = process.argv.slice(2);

  const fresh = args.includes("--fresh");
  const reset = args.includes("--reset");

  if (fresh && reset) {
    console.error("Error: gunakan salah satu saja (--fresh atau --reset)");
    process.exit(1);
  }

  if (fresh) return "fresh";
  if (reset) return "reset";

  return null;
}
