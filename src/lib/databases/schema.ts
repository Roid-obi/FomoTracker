// FomoTracker Database Schema
// Platform Digital Wellbeing Berbasis AI
//
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================
// AUTH & USER MANAGEMENT
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  // false = arahkan ke /onboarding
  onboardingCompleted: boolean("onboarding_completed").default(false),
  // hari pertama activity_log masuk, untuk hitung insight pertama
  dataStartDate: date("data_start_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// USER SETTINGS
// ============================================================

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Jam belajar/kerja
  productiveStart: time("productive_start").notNull().default("08:00"),
  productiveEnd: time("productive_end").notNull().default("17:00"),

  // Jam tidur
  sleepStart: time("sleep_start").notNull().default("22:00"),
  sleepEnd: time("sleep_end").notNull().default("06:00"),

  // Threshold notifikasi
  // default 4 jam = 14400 detik
  screenTimeLimitSeconds: integer("screen_time_limit_seconds")
    .notNull()
    .default(14400),
  // default 60 menit = 3600 detik
  continuousLimitSeconds: integer("continuous_limit_seconds")
    .notNull()
    .default(3600),

  // Toggle notifikasi
  notifScreenTimeEnabled: boolean("notif_screen_time_enabled").default(true),
  notifProductiveHourEnabled: boolean("notif_productive_hour_enabled").default(
    true,
  ),
  notifMidnightEnabled: boolean("notif_midnight_enabled").default(true),
  notifContinuousEnabled: boolean("notif_continuous_enabled").default(true),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// APPS MASTER DATA
// ============================================================

export const apps = pgTable(
  "apps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // nama tampilan, contoh: Instagram
    name: varchar("name", { length: 100 }).notNull(),
    // Android package, contoh: com.instagram.android
    packageName: varchar("package_name", { length: 255 }),
    // domain browser, contoh: instagram.com
    webDomain: varchar("web_domain", { length: 255 }),
    category: varchar("category", { length: 50 })
      .notNull()
      .default("social_media"),
    iconUrl: varchar("icon_url", { length: 500 }),
    // android | browser | both
    platform: varchar("platform", { length: 20 }).notNull(),
    // tampil di daftar pilihan onboarding
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("apps_package_name_idx").on(t.packageName),
    index("apps_web_domain_idx").on(t.webDomain),
    index("apps_platform_idx").on(t.platform),
  ],
);

// Aplikasi yang dipilih user untuk dipantau
export const userTrackedApps = pgTable(
  "user_tracked_apps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id),
    isActive: boolean("is_active").default(true),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique("user_tracked_apps_user_app_unique").on(t.userId, t.appId),
    index("user_tracked_apps_user_id_idx").on(t.userId),
  ],
);

// ============================================================
// DEVICE / PLATFORM CONNECTION
// ============================================================

export const userDevices = pgTable(
  "user_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // android_app | browser_extension
    platform: varchar("platform", { length: 20 }).notNull(),
    // nama perangkat, contoh: Samsung Galaxy S23
    deviceName: varchar("device_name", { length: 255 }),
    // nama browser jika extension, contoh: Chrome
    browserName: varchar("browser_name", { length: 100 }),
    isConnected: boolean("is_connected").default(false),
    // terakhir kali data masuk dari perangkat ini
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    connectedAt: timestamp("connected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("user_devices_user_id_idx").on(t.userId),
    index("user_devices_user_platform_idx").on(t.userId, t.platform),
  ],
);

// ============================================================
// ACTIVITY TRACKING
// ============================================================

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id),
    // dari tabel user_devices, untuk tahu sumber data
    deviceId: uuid("device_id")
      .notNull()
      .references(() => userDevices.id),

    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    // ended_at - started_at dalam detik
    durationSeconds: integer("duration_seconds").notNull(),

    // Flag konteks waktu
    // apakah dalam jam tidur user
    isMidnight: boolean("is_midnight").notNull().default(false),
    // apakah dalam jam belajar/kerja user
    isProductiveHour: boolean("is_productive_hour").notNull().default(false),
    // apakah sesi ini lanjutan nonstop dari sesi sebelumnya
    isContinuous: boolean("is_continuous").notNull().default(false),

    // android_app | browser_extension
    source: varchar("source", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("activity_logs_user_started_idx").on(t.userId, t.startedAt),
    index("activity_logs_user_app_started_idx").on(
      t.userId,
      t.appId,
      t.startedAt,
    ),
    index("activity_logs_user_id_idx").on(t.userId),
  ],
);

// ============================================================
// DAILY AGGREGATION
// ============================================================

export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id),
    statDate: date("stat_date").notNull(),

    // total durasi penggunaan app hari ini
    totalDurationSeconds: integer("total_duration_seconds")
      .notNull()
      .default(0),
    // berapa kali app dibuka hari ini
    openFrequency: integer("open_frequency").notNull().default(0),
    // durasi di jam tidur
    midnightDurationSeconds: integer("midnight_duration_seconds")
      .notNull()
      .default(0),
    // durasi di jam belajar/kerja
    productiveHourDurationSeconds: integer("productive_hour_duration_seconds")
      .notNull()
      .default(0),
    // sesi nonstop terpanjang hari ini
    maxContinuousSeconds: integer("max_continuous_seconds")
      .notNull()
      .default(0),
    // jam paling aktif (0-23)
    peakActiveHour: smallint("peak_active_hour"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("daily_stats_user_date_idx").on(t.userId, t.statDate),
    unique("daily_stats_user_app_date_unique").on(
      t.userId,
      t.appId,
      t.statDate,
    ),
  ],
);

// ============================================================
// BEHAVIORAL SCORING
// ============================================================

export const behavioralScores = pgTable(
  "behavioral_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // tanggal skor ini dihitung
    scoreDate: date("score_date").notNull(),

    // Skor per indikator (0-100 masing-masing)
    // bobot 30% — total durasi harian
    usageDurationScore: doublePrecision("usage_duration_score")
      .notNull()
      .default(0),
    // bobot 20% — frekuensi buka app
    openFrequencyScore: doublePrecision("open_frequency_score")
      .notNull()
      .default(0),
    // bobot 20% — aktivitas di jam tidur
    midnightUsageScore: doublePrecision("midnight_usage_score")
      .notNull()
      .default(0),
    // bobot 15% — nonstop tanpa jeda
    continuousUsageScore: doublePrecision("continuous_usage_score")
      .notNull()
      .default(0),
    // bobot 15% — distraksi jam kerja/belajar
    productiveHourScore: doublePrecision("productive_hour_score")
      .notNull()
      .default(0),

    // Total skor akhir (0-100, semakin rendah semakin baik)
    totalScore: doublePrecision("total_score").notNull().default(0),

    // Status hari ini (derived dari total_score)
    // good = 0-39 | attention = 40-69 | heavy = 70-100
    dailyStatus: varchar("daily_status", { length: 20 })
      .notNull()
      .default("good"),

    // Flag deteksi perilaku (true = terdeteksi hari ini)
    // terlalu lama main HP
    flagExcessiveUsage: boolean("flag_excessive_usage").default(false),
    // sering buka-tutup app
    flagCompulsiveChecking: boolean("flag_compulsive_checking").default(false),
    // main HP waktu jam tidur
    flagMidnightUsage: boolean("flag_midnight_usage").default(false),
    // nonstop tanpa istirahat
    flagContinuousUsage: boolean("flag_continuous_usage").default(false),
    // main HP saat jam belajar/kerja
    flagProductiveHourDistraction: boolean(
      "flag_productive_hour_distraction",
    ).default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique("behavioral_scores_user_date_unique").on(t.userId, t.scoreDate),
    index("behavioral_scores_user_id_idx").on(t.userId),
  ],
);

// ============================================================
// WEEKLY INSIGHTS (AI Generated)
// ============================================================

export const weeklyInsights = pgTable(
  "weekly_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Periode insight
    // Senin minggu yang dianalisis
    weekStart: date("week_start").notNull(),
    // Minggu minggu yang dianalisis
    weekEnd: date("week_end").notNull(),
    // waktu insight selesai di-generate (Senin 00:00)
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),

    // Ringkasan data minggu ini (angka, bukan narasi)
    totalScreenTimeSeconds: integer("total_screen_time_seconds")
      .notNull()
      .default(0),
    avgBehavioralScore: doublePrecision("avg_behavioral_score")
      .notNull()
      .default(0),
    // good | attention | heavy
    weeklyStatus: varchar("weekly_status", { length: 20 }).notNull(),
    // hari dengan skor terendah
    bestDay: date("best_day"),
    // hari dengan skor tertinggi
    worstDay: date("worst_day"),
    // app paling banyak dipakai minggu ini
    topAppId: uuid("top_app_id").references(() => apps.id),
    // untuk perbandingan
    prevWeekScreenTimeSeconds: integer("prev_week_screen_time_seconds"),

    // Konten AI (narasi dalam bahasa Indonesia)
    // contoh: Minggu yang Baik!
    aiWeeklyStatusLabel: varchar("ai_weekly_status_label", { length: 100 }),
    // Yang sudah kamu lakukan dengan baik
    aiPositiveNotes: text("ai_positive_notes"),
    // Yang perlu kamu perhatikan
    aiConcernNotes: text("ai_concern_notes"),
    // Analisis AI minggu ini
    aiAnalysis: text("ai_analysis"),
    // Tips untuk minggu depan, format JSON array of string
    aiTips: text("ai_tips"),

    // pending = belum di-generate | generated = selesai | failed = gagal, perlu retry
    generationStatus: varchar("generation_status", { length: 20 }).default(
      "pending",
    ),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique("weekly_insights_user_week_unique").on(t.userId, t.weekStart),
    index("weekly_insights_user_id_idx").on(t.userId),
    index("weekly_insights_generation_status_idx").on(t.generationStatus),
  ],
);

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // screen_time | productive_hour | midnight | continuous
    type: varchar("type", { length: 50 }).notNull(),
    // pesan dalam bahasa natural Indonesia
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("notifications_user_is_read_idx").on(t.userId, t.isRead),
    index("notifications_user_created_at_idx").on(t.userId, t.createdAt),
  ],
);

// ============================================================
// AI CONVERSATIONS
// ============================================================

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    session: integer("session").notNull(),
    role: varchar("role", { length: 10 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("ai_conversations_user_session_time_idx").on(
      t.userId,
      t.session,
      t.createdAt,
    ),
    index("ai_conversations_user_id_idx").on(t.userId),
  ],
);

// ============================================================
// TYPE EXPORTS (inference helpers)
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;

export type UserTrackedApp = typeof userTrackedApps.$inferSelect;
export type NewUserTrackedApp = typeof userTrackedApps.$inferInsert;

export type UserDevice = typeof userDevices.$inferSelect;
export type NewUserDevice = typeof userDevices.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type DailyStat = typeof dailyStats.$inferSelect;
export type NewDailyStat = typeof dailyStats.$inferInsert;

export type BehavioralScore = typeof behavioralScores.$inferSelect;
export type NewBehavioralScore = typeof behavioralScores.$inferInsert;

export type WeeklyInsight = typeof weeklyInsights.$inferSelect;
export type NewWeeklyInsight = typeof weeklyInsights.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;

export const table = {
  users,
  userSettings,
  apps,
  userTrackedApps,
  userDevices,
  activityLogs,
  dailyStats,
  behavioralScores,
  weeklyInsights,
  notifications,
  aiConversations,
} as const;

export type Table = typeof table;
