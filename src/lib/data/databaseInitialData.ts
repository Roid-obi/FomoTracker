// ============================================================
// INITIAL DATA FOR FomoTracker DATABASE SCHEMA
// Generated for development & testing purposes
// ============================================================

// Helper functions for date formatting
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const weekStart = new Date(today);
weekStart.setDate(
  today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1),
);

const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format ISO datetime
const formatISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
};

// ============================================================
// AUTH & USER MANAGEMENT
// ============================================================

export const initialUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Roid Obi",
    email: "roid@fomotracker.com",
    hashed_password: "hashed_password_placeholder",
    avatar_url: null,
    google_id: null,
    onboarding_completed: true,
    data_start_date: "2026-05-22",
    created_at: "2026-05-22T10:00:00Z",
    updated_at: "2026-06-01T03:00:00Z",
  },
];

export const initialSessions = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    token: "session_token_placeholder_xyz123",
    device_info: "Chrome on Windows 11",
    expired_at: "2026-07-02T10:00:00Z",
    created_at: "2026-06-02T10:00:00Z",
  },
];

// ============================================================
// USER SETTINGS
// ============================================================

export const initialUserSettings = [
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    productive_start: "08:00",
    productive_end: "17:00",
    sleep_start: "22:00",
    sleep_end: "06:00",
    screen_time_limit_seconds: 14400, // 4 hours
    continuous_limit_seconds: 3600, // 60 minutes
    notif_screen_time_enabled: true,
    notif_productive_hour_enabled: true,
    notif_midnight_enabled: true,
    notif_continuous_enabled: true,
    updated_at: "2026-05-22T10:00:00Z",
  },
];

// ============================================================
// APPS MASTER DATA
// ============================================================

export const initialApps = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Instagram",
    package_name: "com.instagram.android",
    web_domain: "instagram.com",
    category: "social_media",
    icon_url: "https://example.com/icons/instagram.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "TikTok",
    package_name: "com.zhiliaoapp.musically",
    web_domain: "tiktok.com",
    category: "social_media",
    icon_url: "https://example.com/icons/tiktok.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "YouTube",
    package_name: "com.google.android.youtube",
    web_domain: "youtube.com",
    category: "entertainment",
    icon_url: "https://example.com/icons/youtube.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    name: "WhatsApp",
    package_name: "com.whatsapp",
    web_domain: "web.whatsapp.com",
    category: "messaging",
    icon_url: "https://example.com/icons/whatsapp.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    name: "X (Twitter)",
    package_name: "com.twitter.android",
    web_domain: "twitter.com",
    category: "social_media",
    icon_url: "https://example.com/icons/x.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    name: "Facebook",
    package_name: "com.facebook.katana",
    web_domain: "facebook.com",
    category: "social_media",
    icon_url: "https://example.com/icons/facebook.png",
    platform: "both",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    name: "Reddit",
    package_name: "com.reddit.frontpage",
    web_domain: "reddit.com",
    category: "discussion",
    icon_url: "https://example.com/icons/reddit.png",
    platform: "browser",
    is_active: true,
    created_at: "2026-05-22T10:00:00Z",
  },
];

// ============================================================
// USER TRACKED APPS
// ============================================================

export const initialUserTrackedApps = [
  {
    id: "550e8400-e29b-41d4-a716-446655440020",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440010", // Instagram
    is_active: true,
    added_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440021",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440011", // TikTok
    is_active: true,
    added_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440022",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440012", // YouTube
    is_active: true,
    added_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440023",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440013", // WhatsApp
    is_active: true,
    added_at: "2026-05-22T10:00:00Z",
  },
];

// ============================================================
// USER DEVICES
// ============================================================

export const initialUserDevices = [
  {
    id: "550e8400-e29b-41d4-a716-446655440030",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    platform: "android_app",
    device_name: "Samsung Galaxy S23",
    browser_name: null,
    is_connected: true,
    last_synced_at: "2026-06-03T08:45:00Z",
    connected_at: "2026-05-22T10:00:00Z",
    created_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440031",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    platform: "browser_extension",
    device_name: null,
    browser_name: "Chrome",
    is_connected: true,
    last_synced_at: "2026-06-03T09:15:00Z",
    connected_at: "2026-05-25T14:30:00Z",
    created_at: "2026-05-25T14:30:00Z",
  },
];

// ============================================================
// ACTIVITY LOGS (Hari ini)
// ============================================================

export const initialActivityLogs = [
  // Today's activity logs
  {
    id: "550e8400-e29b-41d4-a716-446655440040",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440010", // Instagram
    device_id: "550e8400-e29b-41d4-a716-446655440030",
    started_at: formatISODate(new Date(today.getTime() + 8 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 8.25 * 60 * 60 * 1000)),
    duration_seconds: 900, // 15 minutes
    is_midnight: false,
    is_productive_hour: true,
    is_continuous: false,
    source: "android_app",
    created_at: "2026-06-03T08:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440041",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440011", // TikTok
    device_id: "550e8400-e29b-41d4-a716-446655440030",
    started_at: formatISODate(new Date(today.getTime() + 10 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 11 * 60 * 60 * 1000)),
    duration_seconds: 3600, // 1 hour
    is_midnight: false,
    is_productive_hour: true,
    is_continuous: false,
    source: "android_app",
    created_at: "2026-06-03T10:05:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440042",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440012", // YouTube
    device_id: "550e8400-e29b-41d4-a716-446655440031",
    started_at: formatISODate(new Date(today.getTime() + 12 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 13 * 60 * 60 * 1000)),
    duration_seconds: 1800, // 30 minutes
    is_midnight: false,
    is_productive_hour: false,
    is_continuous: false,
    source: "browser_extension",
    created_at: "2026-06-03T12:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440043",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440010", // Instagram
    device_id: "550e8400-e29b-41d4-a716-446655440030",
    started_at: formatISODate(new Date(today.getTime() + 16 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 17 * 60 * 60 * 1000)),
    duration_seconds: 2700, // 45 minutes
    is_midnight: false,
    is_productive_hour: false,
    is_continuous: false,
    source: "android_app",
    created_at: "2026-06-03T16:10:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440044",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440011", // TikTok
    device_id: "550e8400-e29b-41d4-a716-446655440030",
    started_at: formatISODate(new Date(today.getTime() + 18 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 20 * 60 * 60 * 1000)),
    duration_seconds: 3300, // 55 minutes
    is_midnight: false,
    is_productive_hour: false,
    is_continuous: true,
    source: "android_app",
    created_at: "2026-06-03T18:05:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440045",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440010", // Instagram
    device_id: "550e8400-e29b-41d4-a716-446655440031",
    started_at: formatISODate(new Date(today.getTime() + 22 * 60 * 60 * 1000)),
    ended_at: formatISODate(new Date(today.getTime() + 22.5 * 60 * 60 * 1000)),
    duration_seconds: 1200, // 20 minutes
    is_midnight: true,
    is_productive_hour: false,
    is_continuous: false,
    source: "browser_extension",
    created_at: "2026-06-03T22:05:00Z",
  },
];

// ============================================================
// DAILY STATS
// ============================================================

export const initialDailyStats = [
  {
    id: "550e8400-e29b-41d4-a716-446655440050",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440010", // Instagram
    stat_date: formatDate(today),
    total_duration_seconds: 3900, // 65 minutes
    open_frequency: 8,
    midnight_duration_seconds: 1200,
    productive_hour_duration_seconds: 900,
    max_continuous_seconds: 2700,
    peak_active_hour: 16,
    created_at: "2026-06-03T23:00:00Z",
    updated_at: "2026-06-03T23:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440051",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440011", // TikTok
    stat_date: formatDate(today),
    total_duration_seconds: 4900, // 82 minutes
    open_frequency: 12,
    midnight_duration_seconds: 0,
    productive_hour_duration_seconds: 3600,
    max_continuous_seconds: 3300,
    peak_active_hour: 10,
    created_at: "2026-06-03T23:00:00Z",
    updated_at: "2026-06-03T23:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440052",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    app_id: "550e8400-e29b-41d4-a716-446655440012", // YouTube
    stat_date: formatDate(today),
    total_duration_seconds: 1800, // 30 minutes
    open_frequency: 3,
    midnight_duration_seconds: 0,
    productive_hour_duration_seconds: 0,
    max_continuous_seconds: 1800,
    peak_active_hour: 12,
    created_at: "2026-06-03T23:00:00Z",
    updated_at: "2026-06-03T23:00:00Z",
  },
];

// ============================================================
// BEHAVIORAL SCORES
// ============================================================

export const initialBehavioralScores = [
  {
    id: "550e8400-e29b-41d4-a716-446655440060",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    score_date: formatDate(today),
    usage_duration_score: 30, // Bobot 30%
    open_frequency_score: 20, // Bobot 20%
    midnight_usage_score: 15, // Bobot 15%
    continuous_usage_score: 20, // Bobot 20%
    productive_hour_score: 15, // Bobot 15%
    total_score: 100,
    daily_status: "heavy", // good (0-39) | attention (40-69) | heavy (70-100)
    flag_excessive_usage: true,
    flag_compulsive_checking: true,
    flag_midnight_usage: true,
    flag_continuous_usage: true,
    flag_productive_hour_distraction: true,
    created_at: "2026-06-03T23:30:00Z",
    updated_at: "2026-06-03T23:30:00Z",
  },
];

// ============================================================
// WEEKLY INSIGHTS (AI Generated)
// ============================================================

export const initialWeeklyInsights = [
  {
    id: "550e8400-e29b-41d4-a716-446655440070",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    week_start: formatDate(weekStart),
    week_end: formatDate(weekEnd),
    generated_at: "2026-06-02T00:00:00Z",
    total_screen_time_seconds: 165600, // ~46 hours
    avg_behavioral_score: 65,
    weekly_status: "attention",
    best_day: "2026-05-28",
    worst_day: "2026-05-31",
    top_app_id: "550e8400-e29b-41d4-a716-446655440011", // TikTok
    prev_week_screen_time_seconds: 172800, // ~48 hours
    ai_weekly_status_label: "Minggu yang Cukup Padat Secara Digital",
    ai_positive_notes:
      "Kamu berhasil mengurangi penggunaan Instagram di jam belajar dibanding minggu lalu. Pertahankan usaha ini!",
    ai_concern_notes:
      "Kamu cukup sering buka HP setelah jam 22:00. Ini bisa memengaruhi kualitas tidur Anda.",
    ai_analysis:
      "Minggu ini menunjukkan pola yang hampir sama dengan minggu sebelumnya, namun dengan kontrol yang sedikit lebih baik di jam siang. TikTok tetap menjadi aplikasi dengan durasi tertinggi dengan rata-rata 1,5 jam per hari.",
    ai_tips: JSON.stringify([
      "Coba taruh HP di luar kamar saat tidur untuk mengurangi midnight usage",
      "Batasi buka TikTok maksimal 2x sehari dengan durasi maksimal 30 menit",
      "Aktifkan mode fokus saat jam belajar/kerja untuk mengurangi distraksi",
    ]),
    generation_status: "generated",
    created_at: "2026-06-02T00:15:00Z",
    updated_at: "2026-06-02T00:15:00Z",
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================

export const initialNotifications = [
  {
    id: "550e8400-e29b-41d4-a716-446655440080",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "midnight",
    message:
      "Midnight Usage Terdeteksi: Anda membuka Instagram pada jam 23:45 tadi malam. Hindari screen time sebelum tidur untuk kualitas istirahat yang lebih baik.",
    is_read: false,
    created_at: "2026-06-03T23:50:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440081",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "screen_time",
    message:
      "Batas Harian Tercapai: Total screen time hari ini telah mencapai 3 jam 15 menit. Pertimbangkan untuk istirahat sebentar.",
    is_read: true,
    created_at: "2026-06-03T20:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440082",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "productive_hour",
    message:
      "Peringatan Fokus: Terdeteksi membuka TikTok selama jam produktif (10:00 - 11:00). Tetap fokus pada tugas penting Anda!",
    is_read: true,
    created_at: "2026-06-03T11:05:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440083",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "continuous",
    message:
      "Sesi Tanpa Jeda: Anda menggunakan TikTok selama 55 menit tanpa henti. Ambil istirahat sebentar untuk kesehatan mata Anda!",
    is_read: true,
    created_at: "2026-06-03T20:10:00Z",
  },
];

// ============================================================
// EXPORT COMBINED DATA
// ============================================================

export const initialDatabaseData = {
  users: initialUsers,
  sessions: initialSessions,
  user_settings: initialUserSettings,
  apps: initialApps,
  user_tracked_apps: initialUserTrackedApps,
  user_devices: initialUserDevices,
  activity_logs: initialActivityLogs,
  daily_stats: initialDailyStats,
  behavioral_scores: initialBehavioralScores,
  weekly_insights: initialWeeklyInsights,
  notifications: initialNotifications,
};

// ============================================================
// LEGACY: Export old dummy format for backward compatibility
// ============================================================

export const dashboardDummy = {
  userName: "Roid",
  today: formatDate(today), // Legacy format
  hourlyData: [
    { jam: "08:00", Instagram: 10, TikTok: 5, YouTube: 0, WhatsApp: 15 },
    { jam: "10:00", Instagram: 5, TikTok: 60, YouTube: 10, WhatsApp: 20 },
    { jam: "12:00", Instagram: 25, TikTok: 20, YouTube: 15, WhatsApp: 10 },
    { jam: "14:00", Instagram: 15, TikTok: 10, YouTube: 0, WhatsApp: 25 },
    { jam: "16:00", Instagram: 45, TikTok: 35, YouTube: 20, WhatsApp: 15 },
    { jam: "18:00", Instagram: 20, TikTok: 15, YouTube: 30, WhatsApp: 10 },
    { jam: "20:00", Instagram: 40, TikTok: 55, YouTube: 30, WhatsApp: 20 },
    { jam: "22:00", Instagram: 20, TikTok: 0, YouTube: 0, WhatsApp: 5 },
  ],
  behavioralFlags: [
    {
      name: "Excessive Usage",
      desc: "Melebihi 4 jam penggunaan hari ini",
      active: true,
    },
    {
      name: "Midnight Usage",
      desc: "Aktif menggunakan HP di jam tidur malam",
      active: true,
    },
    {
      name: "Continuous Usage",
      desc: "Membuka ponsel > 30 mnt nonstop",
      active: true,
    },
    {
      name: "Compulsive Checking",
      desc: "Membuka layar > 50 kali hari ini",
      active: true,
    },
    {
      name: "Distraction Tendency",
      desc: "Membuka medsos saat jam produktif",
      active: true,
    },
  ],
};

export const analyticsDummy = {
  overviewPeriodData: {
    hari: {
      total: "5j 15m",
      avg: "N/A",
      trend: [
        { label: "08:00", menit: 15 },
        { label: "10:00", menit: 65 },
        { label: "12:00", menit: 50 },
        { label: "14:00", menit: 25 },
        { label: "16:00", menit: 75 },
        { label: "18:00", menit: 35 },
        { label: "20:00", menit: 105 },
        { label: "22:00", menit: 20 },
      ],
      breakdown: [
        { name: "TikTok", menit: 105 },
        { name: "Instagram", menit: 85 },
        { name: "YouTube", menit: 55 },
        { name: "WhatsApp", menit: 45 },
        { name: "Lainnya", menit: 25 },
      ],
      totalMin: 315,
      topApps: [
        {
          rank: 1,
          name: "TikTok",
          time: "1j 45m",
          pct: 33,
          color: "bg-primary",
        },
        {
          rank: 2,
          name: "Instagram",
          time: "1j 25m",
          pct: 27,
          color: "bg-secondary",
        },
        { rank: 3, name: "YouTube", time: "55m", pct: 18, color: "bg-muted" },
        {
          rank: 4,
          name: "WhatsApp",
          time: "45m",
          pct: 14,
          color: "bg-emerald-600",
        },
      ],
    },
    "7hari": {
      total: "34j 18m",
      avg: "4j 54m / Hari",
      trend: [
        { label: "Sen", menit: 290 },
        { label: "Sel", menit: 220 },
        { label: "Rab", menit: 310 },
        { label: "Kam", menit: 420 },
        { label: "Jum", menit: 280 },
        { label: "Sab", menit: 258 },
        { label: "Min", menit: 280 },
      ],
      breakdown: [
        { name: "Instagram", menit: 926 },
        { name: "TikTok", menit: 617 },
        { name: "YouTube", menit: 515 },
        { name: "WhatsApp", menit: 315 },
        { name: "Lainnya", menit: 165 },
      ],
      totalMin: 2538,
      topApps: [
        {
          rank: 1,
          name: "Instagram",
          time: "15j 26m",
          pct: 45,
          color: "bg-primary",
        },
        {
          rank: 2,
          name: "TikTok",
          time: "10j 17m",
          pct: 30,
          color: "bg-secondary",
        },
        {
          rank: 3,
          name: "YouTube",
          time: "8j 35m",
          pct: 25,
          color: "bg-muted",
        },
        {
          rank: 4,
          name: "WhatsApp",
          time: "5j 15m",
          pct: 15,
          color: "bg-emerald-600",
        },
      ],
    },
  },
  behaviorPeriodDates: {
    hari: formatDate(today),
    "7hari": `${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
  },
  behaviorPeriodData: {
    hari: {
      score: 68,
      risk: "ATTENTION (Perhatian)",
      riskColor: "text-amber-800 bg-amber-50 border-amber-100",
      desc: "Aktivitas Anda hari ini memerlukan perhatian. Durasi screen time cukup tinggi dan terdeteksi midnight usage yang mengganggu pola tidur.",
      breakdown: [
        {
          name: "Usage Duration",
          label: "Screen Time Hari Ini",
          valueText: "5,25 jam",
          pct: 85,
          desc: "Durasi total hari ini cukup tinggi",
        },
        {
          name: "Open Frequency",
          label: "Membuka aplikasi hari ini",
          valueText: "23 kali",
          pct: 65,
          desc: "Cukup sering memeriksa gawai",
        },
        {
          name: "Midnight Usage",
          label: "Midnight Usage",
          valueText: "Terdeteksi aktif",
          pct: 60,
          desc: "Aktivitas di jam tidur (22:00 - 06:00)",
        },
        {
          name: "Continuous Usage",
          label: "Penggunaan nonstop >45 menit",
          valueText: "1 sesi",
          pct: 55,
          desc: "Sesi tanpa jeda",
        },
        {
          name: "Productive Hour Usage",
          label: "Penggunaan di jam produktif",
          valueText: "32%",
          pct: 32,
          desc: "Distraksi cukup tinggi saat jam kerja",
        },
      ],
      indicators: [
        {
          name: "Midnight Usage",
          value: "Terdeteksi",
          desc: "Aktif di jam tidur utama (22:00 - 06:00)",
        },
        {
          name: "Excessive Usage",
          value: "Terdeteksi",
          desc: "Durasi total screen time hari ini telah melebihi 3 jam",
        },
        {
          name: "Continuous Usage",
          value: "1 sesi",
          desc: "Sesi penggunaan layar nonstop tanpa jeda > 45 menit",
        },
        {
          name: "Compulsive Checking",
          value: "23 kali",
          desc: "Frekuensi membuka gawai hari ini",
        },
        {
          name: "Distraction Tendency",
          value: "32%",
          desc: "Porsi screen time yang terjadi pada jam belajar/kerja",
        },
      ],
    },
  },
};

export const insightDummy = {
  pastInsights: [
    {
      id: "w1",
      period: "26 Mei – 1 Juni 2026",
      score: 75,
      risk: "Low",
      riskColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      summary:
        "Awal pelacakan yang sehat. Kontrol diri prima dengan tingkat istirahat malam yang sangat teratur.",
      details:
        "Minggu pertama perekaman menunjukkan performa ideal. Screen time harian rata-rata berada pada 2.5 jam. Tidak terdeteksi adanya pelanggaran jam malam atau distraksi jam produktif yang berat. Pertahankan kestabilan ini.",
      recommendations: [
        "Pertahankan Rutinitas: Jaga konsistensi jadwal tidur pukul 22:00.",
        "Review Harian: Buka dashboard setiap malam untuk memantau performa.",
      ],
    },
  ],
  analysisPeriod: formatDate(weekStart) + " – " + formatDate(weekEnd),
  recommendationList: [
    {
      title: "Aktifkan Screen Time Limit TikTok",
      desc: "Batasi penggunaan harian TikTok maksimal 30 menit. Batas ini akan memicu peringatan keras saat Anda melewatinya.",
    },
    {
      title: "Jauhkan Ponsel 30 Menit Sebelum Tidur",
      desc: "Hindari membuka media sosial setelah jam 22:00. Letakkan ponsel di meja kerja atau di luar jangkauan tempat tidur Anda.",
    },
    {
      title: "Gunakan Mode Fokus Selama Jam Kerja",
      desc: "Aktifkan Focus Reminder untuk Instagram dan TikTok pada jam 08:00 – 17:00 untuk mengurangi distraksi impulsif.",
    },
  ],
};

export const notificationPageDummy = {
  initialNotifications: [
    {
      id: "1",
      type: "Midnight Alert",
      message:
        "Midnight Usage Terdeteksi: Anda membuka Instagram pada jam 23:45 tadi malam.",
      timestamp: "10 jam yang lalu",
      read: false,
      iconKey: "shield",
      iconColor: "text-red-600 bg-red-50 border-red-100",
    },
    {
      id: "2",
      type: "Usage Warning",
      message:
        "Batas Harian Tercapai: Total screen time telah mencapai 3 jam 15 menit.",
      timestamp: "12 jam yang lalu",
      read: false,
      iconKey: "ban",
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ],
};

export const monitoringSettingsDummy = {
  initialApps: [
    {
      id: "instagram",
      name: "Instagram",
      platform: "both",
      enabled: true,
      category: "Sosial Media",
      color: "bg-pink-600",
    },
    {
      id: "tiktok",
      name: "TikTok",
      platform: "both",
      enabled: true,
      category: "Sosial Media",
      color: "bg-black",
    },
    {
      id: "youtube",
      name: "YouTube",
      platform: "both",
      enabled: true,
      category: "Hiburan",
      color: "bg-red-600",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      platform: "both",
      enabled: true,
      category: "Messaging",
      color: "bg-green-600",
    },
  ],
  availableAddApps: [
    {
      id: "x",
      name: "X (Twitter)",
      category: "Sosial Media",
      color: "bg-zinc-800",
    },
    {
      id: "facebook",
      name: "Facebook",
      category: "Sosial Media",
      color: "bg-blue-600",
    },
    {
      id: "reddit",
      name: "Reddit",
      category: "Diskusi",
      color: "bg-orange-500",
    },
  ],
  hours: {
    productiveStart: "08:00",
    productiveEnd: "17:00",
    bedtimeStart: "22:00",
    bedtimeEnd: "06:00",
  },
};

export const settingsDummy = {
  profile: {
    name: "Roid Obi",
    email: "roid@fomotracker.com",
  },
  notificationSettings: {
    toggles: {
      usageWarning: true,
      focusReminder: true,
      midnightAlert: true,
      continuousUsage: true,
    },
    thresholdDaily: 180,
    thresholdContinuous: 45,
  },
  privacyExportData: {
    username: "Roid Obi",
    email: "roid@fomotracker.com",
    created_at: "2026-05-22T10:00:00Z",
    timezone: "GMT+7",
    monitored_apps: [
      { name: "Instagram", platform: "both", enabled: true },
      { name: "TikTok", platform: "both", enabled: true },
      { name: "YouTube", platform: "both", enabled: true },
      { name: "WhatsApp", platform: "both", enabled: true },
    ],
    hours_configuration: {
      productive: { start: "08:00", end: "17:00" },
      bedtime: { start: "22:00", end: "06:00" },
    },
    recent_daily_screentime: [
      { date: "2026-06-03", minutes: 315, behavioral_score: 68 },
      { date: "2026-06-02", minutes: 280, behavioral_score: 65 },
      { date: "2026-06-01", minutes: 310, behavioral_score: 60 },
    ],
  },
};

export const onboardingDummy = {
  availableApps: [
    {
      id: "instagram",
      name: "Instagram",
      category: "Sosial Media",
      color: "from-pink-500 to-purple-600",
    },
    {
      id: "tiktok",
      name: "TikTok",
      category: "Sosial Media",
      color: "from-gray-900 to-black",
    },
    {
      id: "youtube",
      name: "YouTube",
      category: "Hiburan",
      color: "from-red-600 to-red-700",
    },
    {
      id: "x",
      name: "X (Twitter)",
      category: "Sosial Media",
      color: "from-zinc-800 to-zinc-900",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      category: "Messaging",
      color: "from-green-500 to-green-600",
    },
    {
      id: "facebook",
      name: "Facebook",
      category: "Sosial Media",
      color: "from-blue-600 to-blue-700",
    },
  ],
  selectedApps: ["instagram", "tiktok"],
  productiveStart: "08:00",
  productiveEnd: "17:00",
  bedtimeStart: "22:00",
  bedtimeEnd: "06:00",
  notifications: {
    usageWarning: true,
    focusReminder: true,
    midnightAlert: true,
    continuousUsage: true,
  },
};
