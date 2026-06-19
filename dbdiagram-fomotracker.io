// FomoTracker Database Schema
// Platform Digital Wellbeing Berbasis AI
// Last updated: Juni 2026

// ============================================================
// AUTH & USER MANAGEMENT
// ============================================================

Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(100) [not null]
  email varchar(255) [not null, unique]
  hashed_password varchar(255) [null, note: 'null jika login via Google OAuth']
  avatar_url varchar(500) [null]
  google_id varchar(255) [null, unique, note: 'dari Google OAuth']
  onboarding_completed bool [default: false, note: 'false = arahkan ke /onboarding']
  data_start_date date [null, note: 'hari pertama activity_log masuk, untuk hitung insight pertama']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    email
    google_id
  }
}

Table sessions {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  token varchar(512) [not null, unique]
  device_info varchar(255) [null, note: 'browser/device yang dipakai login']
  expired_at timestamptz [not null]
  created_at timestamptz [default: `now()`]

  indexes {
    token
    user_id
  }
}

// ============================================================
// USER SETTINGS
// ============================================================

Table user_settings {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, unique]

  // Jam belajar/kerja
  productive_start time [not null, default: '08:00', note: 'jam mulai belajar/kerja']
  productive_end time [not null, default: '17:00', note: 'jam selesai belajar/kerja']

  // Jam tidur
  sleep_start time [not null, default: '22:00', note: 'jam mulai tidur']
  sleep_end time [not null, default: '06:00', note: 'jam bangun tidur']

  // Threshold notifikasi
  screen_time_limit_seconds int [not null, default: 10800, note: 'default 3 jam = 10800 detik']
  continuous_limit_seconds int [not null, default: 2700, note: 'default 45 menit = 2700 detik']

  // Toggle notifikasi
  notif_screen_time_enabled bool [default: true]
  notif_productive_hour_enabled bool [default: true]
  notif_midnight_enabled bool [default: true]
  notif_continuous_enabled bool [default: true]

  updated_at timestamptz [default: `now()`]
}

// ============================================================
// APPS MASTER DATA
// ============================================================

Table apps {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(100) [not null, note: 'nama tampilan, contoh: Instagram']
  package_name varchar(255) [null, note: 'Android package, contoh: com.instagram.android']
  web_domain varchar(255) [null, note: 'domain browser, contoh: instagram.com']
  category varchar(50) [not null, default: 'social_media']
  icon_url varchar(500) [null]
  platform varchar(20) [not null, note: 'android | browser | both']
  is_active bool [default: true, note: 'tampil di daftar pilihan onboarding']
  created_at timestamptz [default: `now()`]

  indexes {
    package_name
    web_domain
    platform
  }
}

// Aplikasi yang dipilih user untuk dipantau
Table user_tracked_apps {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  app_id uuid [not null]
  is_active bool [default: true]
  added_at timestamptz [default: `now()`]

  indexes {
    (user_id, app_id) [unique]
    user_id
  }
}

// ============================================================
// DEVICE / PLATFORM CONNECTION
// ============================================================

Table user_devices {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  platform varchar(20) [not null, note: 'android_app | browser_extension']
  device_name varchar(255) [null, note: 'nama perangkat, contoh: Samsung Galaxy S23']
  browser_name varchar(100) [null, note: 'nama browser jika extension, contoh: Chrome']
  is_connected bool [default: false]
  last_synced_at timestamptz [null, note: 'terakhir kali data masuk dari perangkat ini']
  connected_at timestamptz [null]
  created_at timestamptz [default: `now()`]

  indexes {
    user_id
    (user_id, platform)
  }
}

// ============================================================
// ACTIVITY TRACKING
// ============================================================

Table activity_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  app_id uuid [not null]
  device_id uuid [not null, note: 'dari tabel user_devices, untuk tahu sumber data']

  started_at timestamptz [not null]
  ended_at timestamptz [not null]
  duration_seconds int [not null, note: 'ended_at - started_at dalam detik']

  // Flag konteks waktu
  is_midnight bool [not null, default: false, note: 'apakah dalam jam tidur user']
  is_productive_hour bool [not null, default: false, note: 'apakah dalam jam belajar/kerja user']
  is_continuous bool [not null, default: false, note: 'apakah sesi ini lanjutan nonstop dari sesi sebelumnya']

  source varchar(20) [not null, note: 'android_app | browser_extension']
  created_at timestamptz [default: `now()`]

  indexes {
    (user_id, started_at)
    (user_id, app_id, started_at)
    user_id
  }
}

// ============================================================
// DAILY AGGREGATION
// ============================================================

Table daily_stats {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  app_id uuid [not null]
  stat_date date [not null]

  total_duration_seconds int [not null, default: 0, note: 'total durasi penggunaan app hari ini']
  open_frequency int [not null, default: 0, note: 'berapa kali app dibuka hari ini']
  midnight_duration_seconds int [not null, default: 0, note: 'durasi di jam tidur']
  productive_hour_duration_seconds int [not null, default: 0, note: 'durasi di jam belajar/kerja']
  max_continuous_seconds int [not null, default: 0, note: 'sesi nonstop terpanjang hari ini']
  peak_active_hour smallint [null, note: 'jam paling aktif (0-23)']

  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    (user_id, stat_date)
    (user_id, app_id, stat_date) [unique]
  }
}

// ============================================================
// BEHAVIORAL SCORING
// ============================================================

Table behavioral_scores {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  score_date date [not null, note: 'tanggal skor ini dihitung']

  // Skor per indikator (0-100 masing-masing)
  usage_duration_score float [not null, default: 0, note: 'bobot 30% — total durasi harian']
  open_frequency_score float [not null, default: 0, note: 'bobot 20% — frekuensi buka app']
  midnight_usage_score float [not null, default: 0, note: 'bobot 15% — aktivitas di jam tidur']
  continuous_usage_score float [not null, default: 0, note: 'bobot 20% — nonstop tanpa jeda']
  productive_hour_score float [not null, default: 0, note: 'bobot 15% — distraksi jam kerja/belajar']

  // Total skor akhir (0-100, semakin rendah semakin baik)
  total_score float [not null, default: 0]

  // Status hari ini (derived dari total_score)
  // good = 0-39 | attention = 40-69 | heavy = 70-100
  daily_status varchar(20) [not null, default: 'good', note: 'good | attention | heavy']

  // Flag deteksi perilaku (true = terdeteksi hari ini)
  flag_excessive_usage bool [default: false, note: 'terlalu lama main HP']
  flag_compulsive_checking bool [default: false, note: 'sering buka-tutup app']
  flag_midnight_usage bool [default: false, note: 'main HP waktu jam tidur']
  flag_continuous_usage bool [default: false, note: 'nonstop tanpa istirahat']
  flag_productive_hour_distraction bool [default: false, note: 'main HP saat jam belajar/kerja']

  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    (user_id, score_date) [unique]
    user_id
  }
}

// ============================================================
// WEEKLY INSIGHTS (AI Generated)
// ============================================================

Table weekly_insights {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]

  // Periode insight
  week_start date [not null, note: 'Senin minggu yang dianalisis']
  week_end date [not null, note: 'Minggu minggu yang dianalisis']
  generated_at timestamptz [not null, note: 'waktu insight selesai di-generate (Senin 00:00)']

  // Ringkasan data minggu ini (angka, bukan narasi)
  total_screen_time_seconds int [not null, default: 0]
  avg_behavioral_score float [not null, default: 0]
  weekly_status varchar(20) [not null, note: 'good | attention | heavy']
  best_day date [null, note: 'hari dengan skor terendah']
  worst_day date [null, note: 'hari dengan skor tertinggi']
  top_app_id uuid [null, note: 'app paling banyak dipakai minggu ini']
  prev_week_screen_time_seconds int [null, note: 'untuk perbandingan']

  // Konten AI (narasi dalam bahasa Indonesia)
  ai_weekly_status_label varchar(100) [null, note: 'contoh: Minggu yang Baik!']
  ai_positive_notes text [null, note: 'Yang sudah kamu lakukan dengan baik']
  ai_concern_notes text [null, note: 'Yang perlu kamu perhatikan']
  ai_analysis text [null, note: 'Analisis AI minggu ini']
  ai_tips text [null, note: 'Tips untuk minggu depan, format JSON array of string']

  // Status generate
  // pending = belum di-generate
  // generated = selesai
  // failed = gagal, perlu retry
  generation_status varchar(20) [default: 'pending', note: 'pending | generated | failed']

  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    (user_id, week_start) [unique]
    user_id
    generation_status
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

Table notifications {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]

  type varchar(50) [not null, note: 'screen_time | productive_hour | midnight | continuous']
  message text [not null, note: 'pesan dalam bahasa natural Indonesia']
  is_read bool [default: false]

  created_at timestamptz [default: `now()`]

  indexes {
    user_id
    (user_id, is_read)
    (user_id, created_at)
  }
}

// ============================================================
// RELATIONS
// ============================================================

// Auth
Ref: sessions.user_id > users.id [delete: cascade]

// Settings
Ref: user_settings.user_id - users.id [delete: cascade]

// Apps
Ref: user_tracked_apps.user_id > users.id [delete: cascade]
Ref: user_tracked_apps.app_id > apps.id

// Devices
Ref: user_devices.user_id > users.id [delete: cascade]

// Activity
Ref: activity_logs.user_id > users.id [delete: cascade]
Ref: activity_logs.app_id > apps.id
Ref: activity_logs.device_id > user_devices.id

// Daily Stats
Ref: daily_stats.user_id > users.id [delete: cascade]
Ref: daily_stats.app_id > apps.id

// Behavioral Scores
Ref: behavioral_scores.user_id > users.id [delete: cascade]

// Weekly Insights
Ref: weekly_insights.user_id > users.id [delete: cascade]
Ref: weekly_insights.top_app_id > apps.id

// Notifications
Ref: notifications.user_id > users.id [delete: cascade]