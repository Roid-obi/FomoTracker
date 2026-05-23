import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username"),
  email: varchar("email"),
  hashedPassword: varchar("hashed_password"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  session: one(sessions, {
    fields: [users.id],
    references: [sessions.userId],
  }),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  userSetting: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  notifications: many(notifications),
  behaviourScores: many(behaviourScores),
  weeklyReports: many(weeklyReports),
  aiInsights: many(aiInsights),
  dailyStats: many(dailyStats),
  activityLogs: many(activityLog),
}));

// ─────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expiredAt: timestamp("expired_at"),
  createdAt: timestamp("created_at"),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Profiles
// ─────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  url: varchar("url"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  message: varchar("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at"),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Behaviour Scores
// ─────────────────────────────────────────────
export const behaviourScores = pgTable("behaviour_scores", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  scoreDate: timestamp("score_date"),
  usageDurationScore: real("usage_duration_score"),
  openFrequencyScore: real("open_frequency_score"),
  midnightUsageScore: real("midnight_usage_score"),
  continuousUsageScore: real("continuous_usage_score"),
  productivityHourScore: real("productivity_hour_score"),
  totalScore: real("total_score"),
  riskLevel: varchar("risk_level"),
  excessiveUsageFlag: boolean("excessive_usage_flag"),
  compulsiveCheckingFlag: boolean("compulsive_checking_flag"),
  midnightTendencyFlag: boolean("midnight_tendency_flag"),
  continuousUsageFlag: boolean("continuous_usage_flag"),
  distractionTendencyFlag: boolean("distraction_tendency_flag"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const behaviourScoresRelations = relations(
  behaviourScores,
  ({ one, many }) => ({
    user: one(users, {
      fields: [behaviourScores.userId],
      references: [users.id],
    }),
    aiInsights: many(aiInsights),
  }),
);

// ─────────────────────────────────────────────
// Weekly Reports
// ─────────────────────────────────────────────
export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  weekStart: date("week_start"),
  weekEnd: date("week_end"),
  totalScreenTimeSeconds: integer("total_screen_time_seconds"),
  avgBehavioralScore: real("avg_behavioral_score"),
  avgRiskLevel: varchar("avg_risk_level"),
  prevWeekScreenTimeSec: integer("prev_week_screen_time_sec"),
  screenTimeChangePct: real("screen_time_change_pct"),
  riskTrend: varchar("risk_trend"),
  usageSummary: jsonb("usage_summary"),
  aiReflection: text("ai_reflection"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const weeklyReportsRelations = relations(
  weeklyReports,
  ({ one, many }) => ({
    user: one(users, {
      fields: [weeklyReports.userId],
      references: [users.id],
    }),
    aiInsights: many(aiInsights),
  }),
);

// ─────────────────────────────────────────────
// AI Insights
// ─────────────────────────────────────────────
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  behavioralId: integer("behavioral_id")
    .notNull()
    .references(() => behaviourScores.id),
  weeklyReportId: integer("weekly_report_id")
    .notNull()
    .references(() => weeklyReports.id),
  insightType: varchar("insight_type"),
  content: text("content"),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at"),
});

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  user: one(users, {
    fields: [aiInsights.userId],
    references: [users.id],
  }),
  behaviourScore: one(behaviourScores, {
    fields: [aiInsights.behavioralId],
    references: [behaviourScores.id],
  }),
  weeklyReport: one(weeklyReports, {
    fields: [aiInsights.weeklyReportId],
    references: [weeklyReports.id],
  }),
}));

// ─────────────────────────────────────────────
// Apps
// ─────────────────────────────────────────────
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  packageName: varchar("package_name"),
  appName: varchar("app_name"),
  category: varchar("category"),
  platform: varchar("platfrom"), // kept as-is from original schema
  isActive: boolean("is_active"),
  createdAt: timestamp("created_at"),
});

export const appsRelations = relations(apps, ({ many }) => ({
  dailyStats: many(dailyStats),
  activityLogs: many(activityLog),
}));

// ─────────────────────────────────────────────
// Daily Stats
// ─────────────────────────────────────────────
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  appId: integer("app_id")
    .notNull()
    .references(() => apps.id),
  statDate: date("stat_date"),
  totalDurationSeconds: integer("total_duration_seconds"),
  openFrequency: integer("open_frequency"),
  midnightDurationSeconds: integer("midnight_duration_seconds"),
  productiveHourDurationSeconds: integer("productive_hour_duration_seconds"),
  maxContinuousSeconds: integer("max_continuous_seconds"),
  peakActiveHour: integer("peak_active_hour"),
});

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  user: one(users, {
    fields: [dailyStats.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [dailyStats.appId],
    references: [apps.id],
  }),
}));

// ─────────────────────────────────────────────
// Activity Log
// ─────────────────────────────────────────────
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  appId: integer("app_id")
    .notNull()
    .references(() => apps.id),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  isMidnight: boolean("is_midnight"),
  isProductiveHour: boolean("is_productive_hour"),
  isContinuous: boolean("is_continuous"),
  createdAt: timestamp("created_at"),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [activityLog.appId],
    references: [apps.id],
  }),
}));

// ─────────────────────────────────────────────
// User Settings
// ─────────────────────────────────────────────
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  productivityStart: time("productivity_start"),
  productivityEnd: time("productivity_end"),
  midnightStart: time("midnight_start"),
  midnightEnd: time("midnight_end"),
  screenTimeThresholdSec: integer("screen_time_threshold_sec"),
  continuousThresholdSec: integer("continuous_threshold_sec"),
  notificationEnabled: boolean("notification_enabled"),
  updatedAt: timestamp("updated_at"),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const table = {
  users,
  sessions,
  profiles,
  notifications,
  behaviourScores,
  weeklyReports,
  aiInsights,
  apps,
  dailyStats,
  activityLog,
  userSettings,
} as const;

export type Table = typeof table;
