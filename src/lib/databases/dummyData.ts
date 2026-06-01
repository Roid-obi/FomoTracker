export type TableUser = {
  id: string;
  username: string;
  profileUrl: string | null;
  timezone: string;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TableSession = {
  id: number;
  userId: string;
  expiredAt: string;
  createdAt: string;
};

export type TableApp = {
  id: number;
  packageName: string;
  appName: string;
  category: string;
  platform: "Android" | "Browser" | "Both";
  isActive: boolean;
  createdAt: string;
};

export type TableUserMonitoredApp = {
  id: number;
  userId: string;
  appId: number;
  platform: "Android" | "Browser" | "Both";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TableUserSetting = {
  id: number;
  userId: string;
  productivityStart: string;
  productivityEnd: string;
  midnightStart: string;
  midnightEnd: string;
  screenTimeThresholdSec: number;
  continuousThresholdSec: number;
  notificationEnabled: boolean;
  usageWarningEnabled: boolean;
  focusReminderEnabled: boolean;
  midnightAlertEnabled: boolean;
  continuousUsageEnabled: boolean;
  updatedAt: string;
};

export const dummyTables = {
  users: [
    {
      id: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      username: "Roid Obi",
      profileUrl: null,
      timezone: "GMT+7",
      onboardingCompletedAt: "2026-05-22T10:30:00Z",
      createdAt: "2026-05-22T10:00:00Z",
      updatedAt: "2026-06-01T03:00:00Z",
    },
  ] as TableUser[],

  sessions: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      expiredAt: "2026-06-02T10:00:00Z",
      createdAt: "2026-06-01T10:00:00Z",
    },
  ] as TableSession[],

  apps: [
    {
      id: 1,
      packageName: "com.instagram.android",
      appName: "Instagram",
      category: "Sosial Media",
      platform: "Android",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 2,
      packageName: "com.zhiliaoapp.musically",
      appName: "TikTok",
      category: "Sosial Media",
      platform: "Both",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 3,
      packageName: "com.google.android.youtube",
      appName: "YouTube",
      category: "Hiburan",
      platform: "Browser",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 4,
      packageName: "com.whatsapp",
      appName: "WhatsApp",
      category: "Chatting",
      platform: "Android",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 5,
      packageName: "com.twitter.android",
      appName: "X (Twitter)",
      category: "Sosial Media",
      platform: "Both",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 6,
      packageName: "com.facebook.katana",
      appName: "Facebook",
      category: "Sosial Media",
      platform: "Both",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      id: 7,
      packageName: "com.reddit.frontpage",
      appName: "Reddit",
      category: "Diskusi",
      platform: "Both",
      isActive: true,
      createdAt: "2026-05-22T10:00:00Z",
    },
  ] as TableApp[],

  userMonitoredApps: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 1,
      platform: "Android",
      enabled: true,
      createdAt: "2026-05-22T10:10:00Z",
      updatedAt: "2026-06-01T03:00:00Z",
    },
    {
      id: 2,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 2,
      platform: "Both",
      enabled: true,
      createdAt: "2026-05-22T10:10:00Z",
      updatedAt: "2026-06-01T03:00:00Z",
    },
    {
      id: 3,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 3,
      platform: "Browser",
      enabled: true,
      createdAt: "2026-05-22T10:10:00Z",
      updatedAt: "2026-06-01T03:00:00Z",
    },
    {
      id: 4,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 4,
      platform: "Android",
      enabled: false,
      createdAt: "2026-05-22T10:10:00Z",
      updatedAt: "2026-06-01T03:00:00Z",
    },
  ] as TableUserMonitoredApp[],

  userSettings: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      productivityStart: "08:00",
      productivityEnd: "17:00",
      midnightStart: "22:00",
      midnightEnd: "06:00",
      screenTimeThresholdSec: 5400,
      continuousThresholdSec: 1800,
      notificationEnabled: true,
      usageWarningEnabled: true,
      focusReminderEnabled: true,
      midnightAlertEnabled: true,
      continuousUsageEnabled: false,
      updatedAt: "2026-06-01T03:00:00Z",
    },
  ] as TableUserSetting[],

  dailyStats: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 1,
      statDate: "2026-06-01",
      totalDurationSeconds: 5100,
      openFrequency: 34,
      midnightDurationSeconds: 360,
      productiveHourDurationSeconds: 1740,
      maxContinuousSeconds: 1260,
      peakActiveHour: 20,
    },
    {
      id: 2,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 2,
      statDate: "2026-06-01",
      totalDurationSeconds: 6300,
      openFrequency: 41,
      midnightDurationSeconds: 840,
      productiveHourDurationSeconds: 1560,
      maxContinuousSeconds: 1980,
      peakActiveHour: 21,
    },
    {
      id: 3,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 3,
      statDate: "2026-06-01",
      totalDurationSeconds: 3300,
      openFrequency: 12,
      midnightDurationSeconds: 120,
      productiveHourDurationSeconds: 1200,
      maxContinuousSeconds: 960,
      peakActiveHour: 18,
    },
    {
      id: 4,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      appId: 4,
      statDate: "2026-06-01",
      totalDurationSeconds: 2700,
      openFrequency: 26,
      midnightDurationSeconds: 60,
      productiveHourDurationSeconds: 900,
      maxContinuousSeconds: 780,
      peakActiveHour: 10,
    },
  ],

  behaviourScores: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      scoreDate: "2026-06-01T23:00:00Z",
      usageDurationScore: 82,
      openFrequencyScore: 78,
      midnightUsageScore: 90,
      continuousUsageScore: 70,
      productivityHourScore: 55,
      totalScore: 78,
      riskLevel: "HIGH",
      excessiveUsageFlag: true,
      compulsiveCheckingFlag: true,
      midnightTendencyFlag: true,
      continuousUsageFlag: false,
      distractionTendencyFlag: true,
      createdAt: "2026-06-01T23:00:00Z",
      updatedAt: "2026-06-01T23:00:00Z",
    },
  ],

  weeklyReports: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      weekStart: "2026-05-25",
      weekEnd: "2026-05-31",
      totalScreenTimeSeconds: 123480,
      avgBehavioralScore: 63,
      avgRiskLevel: "MODERATE",
      prevWeekScreenTimeSec: 135120,
      screenTimeChangePct: -8.6,
      riskTrend: "improving",
      usageSummary: {
        topApps: ["Instagram", "TikTok", "YouTube"],
        peakHours: ["20:00", "21:00", "22:00"],
      },
      aiReflection: "Kontrol siang hari membaik, namun penggunaan malam masih tinggi dan berpotensi mengganggu kualitas tidur.",
      createdAt: "2026-06-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    },
  ],

  aiInsights: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      behavioralId: 1,
      weeklyReportId: 1,
      insightType: "weekly_summary",
      content: "Penggunaan TikTok meningkat 35% setelah jam 20:00. Risiko utama berasal dari midnight usage dan compulsive checking.",
      recommendation: "Batasi screen time malam dan aktifkan focus reminder pada jam produktif.",
      createdAt: "2026-06-01T00:00:00Z",
    },
  ],

  notifications: [
    {
      id: 1,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      notificationType: "Midnight Alert",
      title: "Midnight Usage Terdeteksi",
      message: "Anda membuka Instagram pada jam 23:45 tadi malam.",
      isRead: false,
      severity: "high",
      sourceAppId: 1,
      payload: null,
      createdAt: "2026-06-01T00:45:00Z",
    },
    {
      id: 2,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      notificationType: "Usage Warning",
      title: "Batas Harian Tercapai",
      message: "TikTok hari ini telah digunakan selama 1 jam 45 menit (Batas wajar: 1.5 jam).",
      isRead: false,
      severity: "medium",
      sourceAppId: 2,
      payload: null,
      createdAt: "2026-05-31T22:30:00Z",
    },
    {
      id: 3,
      userId: "2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803",
      notificationType: "Focus Reminder",
      title: "Peringatan Fokus",
      message: "Terdeteksi membuka YouTube selama jam produktif (13:10 – 13:40).",
      isRead: true,
      severity: "low",
      sourceAppId: 3,
      payload: null,
      createdAt: "2026-05-31T13:40:00Z",
    },
  ],
} as const;

const primaryUser = dummyTables.users[0];
const userSetting = dummyTables.userSettings[0];

export const dashboardDummy = {
  userName: primaryUser.username.split(" ")[0],
  today: "Minggu, 1 Juni 2026",
  hourlyData: [
    { jam: "08:00", Instagram: 10, TikTok: 5, YouTube: 0, WhatsApp: 15 },
    { jam: "10:00", Instagram: 5, TikTok: 15, YouTube: 10, WhatsApp: 20 },
    { jam: "12:00", Instagram: 25, TikTok: 20, YouTube: 15, WhatsApp: 10 },
    { jam: "14:00", Instagram: 15, TikTok: 10, YouTube: 0, WhatsApp: 25 },
    { jam: "16:00", Instagram: 30, TikTok: 35, YouTube: 20, WhatsApp: 15 },
    { jam: "18:00", Instagram: 20, TikTok: 15, YouTube: 45, WhatsApp: 10 },
    { jam: "20:00", Instagram: 40, TikTok: 50, YouTube: 30, WhatsApp: 20 },
    { jam: "22:00", Instagram: 15, TikTok: 25, YouTube: 10, WhatsApp: 5 },
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
      active: false,
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
        { label: "10:00", menit: 30 },
        { label: "12:00", menit: 50 },
        { label: "14:00", menit: 25 },
        { label: "16:00", menit: 75 },
        { label: "18:00", menit: 35 },
        { label: "20:00", menit: 65 },
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
        { rank: 1, name: "TikTok", time: "1j 45m", pct: 33, color: "bg-primary" },
        { rank: 2, name: "Instagram", time: "1j 25m", pct: 27, color: "bg-secondary" },
        { rank: 3, name: "YouTube", time: "55m", pct: 18, color: "bg-muted" },
        { rank: 4, name: "WhatsApp", time: "45m", pct: 14, color: "bg-emerald-600" },
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
        { rank: 1, name: "Instagram", time: "15j 26m", pct: 45, color: "bg-primary" },
        { rank: 2, name: "TikTok", time: "10j 17m", pct: 30, color: "bg-secondary" },
        { rank: 3, name: "YouTube", time: "8j 35m", pct: 25, color: "bg-muted" },
        { rank: 4, name: "WhatsApp", time: "5j 15m", pct: 15, color: "bg-emerald-600" },
      ],
    },
    "30hari": {
      total: "147j",
      avg: "4j 54m / Hari",
      trend: [
        { label: "Mgg 1", menit: 2050 },
        { label: "Mgg 2", menit: 2180 },
        { label: "Mgg 3", menit: 2020 },
        { label: "Mgg 4", menit: 2570 },
      ],
      breakdown: [
        { name: "YouTube", menit: 3969 },
        { name: "Instagram", menit: 2646 },
        { name: "TikTok", menit: 1764 },
        { name: "WhatsApp", menit: 1323 },
        { name: "Lainnya", menit: 882 },
      ],
      totalMin: 8820,
      topApps: [
        { rank: 1, name: "YouTube", time: "66j 9m", pct: 45, color: "bg-primary" },
        { rank: 2, name: "Instagram", time: "44j 6m", pct: 30, color: "bg-secondary" },
        { rank: 3, name: "TikTok", time: "29j 24m", pct: 20, color: "bg-muted" },
        { rank: 4, name: "WhatsApp", time: "22j 3m", pct: 15, color: "bg-emerald-600" },
      ],
    },
    custom: {
      total: "152j",
      avg: "4j 54m / Hari",
      trend: [
        { label: "Mgg 1", menit: 2100 },
        { label: "Mgg 2", menit: 2250 },
        { label: "Mgg 3", menit: 2120 },
        { label: "Mgg 4", menit: 2650 },
      ],
      breakdown: [
        { name: "Instagram", menit: 3648 },
        { name: "TikTok", menit: 2736 },
        { name: "YouTube", menit: 2280 },
        { name: "WhatsApp", menit: 1368 },
        { name: "Lainnya", menit: 912 },
      ],
      totalMin: 9120,
      topApps: [
        { rank: 1, name: "Instagram", time: "60j 48m", pct: 40, color: "bg-primary" },
        { rank: 2, name: "TikTok", time: "45j 36m", pct: 30, color: "bg-secondary" },
        { rank: 3, name: "YouTube", time: "38j", pct: 25, color: "bg-muted" },
        { rank: 4, name: "WhatsApp", time: "22j 48m", pct: 15, color: "bg-emerald-600" },
      ],
    },
  },

  behaviorPeriodDates: {
    hari: "1 Juni 2026",
    "7hari": "25 Mei – 31 Mei 2026",
    "30hari": "2 Mei – 31 Mei 2026",
    custom: "1 Mei – 31 Mei 2026",
  },

  behaviorPeriodData: {
    hari: {
      score: 78,
      risk: "HIGH (Tinggi)",
      riskColor: "text-red-800 bg-red-50 border-red-100",
      desc: "Aktivitas Anda hari ini sangat berisiko. Durasi screen time tinggi dan terdeteksi midnight usage yang mengganggu pola tidur Anda.",
      breakdown: [
        { name: "Usage Duration", label: "Screen Time Hari Ini", valueText: "6,2 jam", pct: 82, desc: "Durasi total hari ini melebihi batas sehat" },
        { name: "Open Frequency", label: "Membuka aplikasi hari ini", valueText: "68 kali", pct: 78, desc: "Sangat sering memeriksa gawai secara impulsif" },
        { name: "Midnight Usage", label: "Midnight Usage", valueText: "Terdeteksi aktif", pct: 90, desc: "Aktivitas di jam tidur utama (23:00 - 04:00)" },
        { name: "Continuous Usage", label: "Penggunaan nonstop >60 menit", valueText: "3 sesi", pct: 70, desc: "Sesi panjang tanpa jeda relaksasi mata" },
        { name: "Productive Hour Usage", label: "Penggunaan di jam produktif", valueText: "55%", pct: 55, desc: "Distraksi cukup tinggi saat jam belajar/kerja" },
      ],
      radar: [
        { subject: "Duration", A: 82, fullMark: 100 },
        { subject: "Frequency", A: 78, fullMark: 100 },
        { subject: "Midnight", A: 90, fullMark: 100 },
        { subject: "Continuous", A: 70, fullMark: 100 },
        { subject: "Productivity", A: 55, fullMark: 100 },
      ],
      indicators: [
        { name: "Midnight Usage", value: "Terdeteksi", desc: "Aktif di jam tidur utama (23:00 - 04:00) dini hari ini" },
        { name: "Excessive Usage", value: "Terdeteksi", desc: "Durasi total screen time hari ini telah melebihi batas sehat 4 jam" },
        { name: "Continuous Usage", value: "3 sesi", desc: "Sesi penggunaan layar nonstop tanpa jeda istirahat > 30 menit" },
        { name: "Compulsive Checking", value: "68 kali", desc: "Frekuensi membuka kunci layar gawai hari ini" },
        { name: "Distraction Tendency", value: "55%", desc: "Porsi screen time yang terjadi pada jam belajar/kerja" },
      ],
    },
    "7hari": {
      score: 63,
      risk: "MODERATE (Sedang)",
      riskColor: "text-amber-800 bg-amber-50 border-amber-100",
      desc: "Tingkat risiko Anda selama 7 hari terakhir tergolong sedang. Anda memiliki kontrol diri yang cukup baik di siang hari, namun rentan terpengaruh distraksi impulsif di jam malam.",
      breakdown: [
        { name: "Usage Duration", label: "Rata-rata Screen Time", valueText: "4,8 jam/hari", pct: 60, desc: "Rata-rata durasi harian dalam 7 hari terakhir" },
        { name: "Open Frequency", label: "Rata-rata membuka aplikasi", valueText: "47 kali/hari", pct: 65, desc: "Frekuensi cek instan harian" },
        { name: "Midnight Usage", label: "Midnight Usage terdeteksi", valueText: "5 dari 7 hari", pct: 71, desc: "Menggunakan gawai menjelang atau saat jam tidur" },
        { name: "Continuous Usage", label: "Penggunaan tanpa jeda >60 menit", valueText: "8 sesi", pct: 50, desc: "Total sesi panjang selama 7 hari analisis" },
        { name: "Productive Hour Usage", label: "Penggunaan pada jam produktif", valueText: "38%", pct: 38, desc: "Porsi screen time yang terjadi di jam produktif" },
      ],
      radar: [
        { subject: "Duration", A: 60, fullMark: 100 },
        { subject: "Frequency", A: 65, fullMark: 100 },
        { subject: "Midnight", A: 71, fullMark: 100 },
        { subject: "Continuous", A: 50, fullMark: 100 },
        { subject: "Productivity", A: 38, fullMark: 100 },
      ],
      indicators: [
        { name: "Midnight Usage", value: "5/7 hari", desc: "Kecenderungan membuka aplikasi medsos sebelum tidur" },
        { name: "Excessive Usage", value: "4/7 hari", desc: "Hari-hari di mana durasi screen time harian Anda melebihi 4 jam" },
        { name: "Continuous Usage", value: "8 sesi", desc: "Total sesi penggunaan nonstop > 60 menit terdeteksi dalam seminggu" },
        { name: "Compulsive Checking", value: "52 kali/hari", desc: "Rata-rata frekuensi membuka gawai harian dalam 7 hari terakhir" },
        { name: "Distraction Tendency", value: "34%", desc: "Porsi penggunaan aplikasi hiburan selama jam produktif" },
      ],
    },
    "30hari": {
      score: 58,
      risk: "MODERATE (Sedang)",
      riskColor: "text-amber-800 bg-amber-50 border-amber-100",
      desc: "Evaluasi 30 hari menunjukkan tren yang stabil dan cenderung membaik. Pengendalian diri Anda secara umum konsisten, dengan beberapa pengecualian di akhir pekan.",
      breakdown: [
        { name: "Usage Duration", label: "Rata-rata Screen Time", valueText: "4,2 jam/hari", pct: 52, desc: "Rata-rata durasi harian dalam 30 hari terakhir" },
        { name: "Open Frequency", label: "Rata-rata membuka aplikasi", valueText: "42 kali/hari", pct: 58, desc: "Frekuensi membuka layar harian" },
        { name: "Midnight Usage", label: "Midnight Usage terdeteksi", valueText: "16 dari 30 hari", pct: 53, desc: "Aktivitas larut malam diakumulasikan sebulan" },
        { name: "Continuous Usage", label: "Penggunaan tanpa jeda >60 menit", valueText: "22 sesi", pct: 45, desc: "Total akumulasi sesi panjang selama sebulan" },
        { name: "Productive Hour Usage", label: "Penggunaan pada jam produktif", valueText: "42%", pct: 42, desc: "Porsi screen time di jam produktif dalam sebulan" },
      ],
      radar: [
        { subject: "Duration", A: 52, fullMark: 100 },
        { subject: "Frequency", A: 58, fullMark: 100 },
        { subject: "Midnight", A: 53, fullMark: 100 },
        { subject: "Continuous", A: 45, fullMark: 100 },
        { subject: "Productivity", A: 42, fullMark: 100 },
      ],
      indicators: [
        { name: "Midnight Usage", value: "16/30 hari", desc: "Akumulasi aktivitas larut malam selama periode sebulan" },
        { name: "Excessive Usage", value: "18/30 hari", desc: "Banyaknya hari di mana Anda menghabiskan > 4 jam screen time" },
        { name: "Continuous Usage", value: "22 sesi", desc: "Total sesi penggunaan nonstop > 60 menit sebulan terakhir" },
        { name: "Compulsive Checking", value: "42 kali/hari", desc: "Rata-rata frekuensi membuka layar gawai harian dalam 30 hari" },
        { name: "Distraction Tendency", value: "42%", desc: "Persentase distraksi di jam produktif dalam sebulan terakhir" },
      ],
    },
    custom: {
      score: 65,
      risk: "MODERATE (Sedang)",
      riskColor: "text-amber-800 bg-amber-50 border-amber-100",
      desc: "Hasil analisis periode kustom (1 Mei - 31 Mei 2026). Perilaku Anda menunjukkan tingkat ketergantungan sedang dengan kecenderungan FOMO di malam hari.",
      breakdown: [
        { name: "Usage Duration", label: "Rata-rata Screen Time", valueText: "4,9 jam/hari", pct: 62, desc: "Rata-rata durasi harian periode kustom" },
        { name: "Open Frequency", label: "Rata-rata membuka aplikasi", valueText: "49 kali/hari", pct: 67, desc: "Frekuensi membuka layar harian" },
        { name: "Midnight Usage", label: "Midnight Usage terdeteksi", valueText: "18 dari 31 hari", pct: 58, desc: "Aktivitas larut malam periode kustom" },
        { name: "Continuous Usage", label: "Penggunaan tanpa jeda >60 menit", valueText: "24 sesi", pct: 52, desc: "Akumulasi sesi panjang selama periode" },
        { name: "Productive Hour Usage", label: "Penggunaan pada jam produktif", valueText: "39%", pct: 39, desc: "Porsi screen time di jam produktif" },
      ],
      radar: [
        { subject: "Duration", A: 62, fullMark: 100 },
        { subject: "Frequency", A: 67, fullMark: 100 },
        { subject: "Midnight", A: 58, fullMark: 100 },
        { subject: "Continuous", A: 52, fullMark: 100 },
        { subject: "Productivity", A: 39, fullMark: 100 },
      ],
      indicators: [
        { name: "Midnight Usage", value: "18/31 hari", desc: "Akumulasi aktivitas larut malam selama periode kustom" },
        { name: "Excessive Usage", value: "20/31 hari", desc: "Banyaknya hari melebihi batas wajar screen time" },
        { name: "Continuous Usage", value: "24 sesi", desc: "Sesi penggunaan layar nonstop tanpa jeda periode kustom" },
        { name: "Compulsive Checking", value: "49 kali/hari", desc: "Rata-rata frekuensi membuka gawai harian periode kustom" },
        { name: "Distraction Tendency", value: "39%", desc: "Persentase distraksi di jam produktif periode kustom" },
      ],
    },
  },

  behaviorTrend: [
    { week: "M1", score: 72 },
    { week: "M2", score: 69 },
    { week: "M3", score: 65 },
    { week: "M4", score: 63 },
  ],
};

export const insightDummy = {
  pastInsights: [
    {
      id: "w3",
      period: "10 Mei – 16 Mei 2026",
      score: 65,
      risk: "High",
      riskColor: "bg-red-100 text-red-800 border-red-200",
      summary: "Terjadi peningkatan durasi screen time di hari libur sebesar 45%. Sesi malam hari sangat mendominasi aktivitas.",
      details:
        "Pada pertengahan Mei, kami mencatat kenaikan signifikan pada penggunaan YouTube di tablet/browser Anda pada hari Sabtu dan Minggu. Total screen time harian menyentuh angka 6.2 jam. Kontributor utama adalah binge-watching video hiburan. Kami merekomendasikan pengetatan kuota harian khusus weekend.",
      recommendations: ["Batas 2 Jam Weekend: Terapkan batas waktu kumulatif maksimal 2 jam untuk hari Sabtu dan Minggu.", "No Screen Zone: Definisikan area meja makan sebagai area bebas gadget."],
    },
    {
      id: "w2",
      period: "3 Mei – 9 Mei 2026",
      score: 72,
      risk: "Moderate",
      riskColor: "bg-amber-100 text-amber-800 border-amber-200",
      summary: "Penggunaan jam kerja produktif membaik secara perlahan. Namun, frekuensi mengecek notifikasi instan masih tinggi.",
      details:
        "Skor perilaku Anda naik menjadi 72 karena Anda sukses menekan pemakaian Instagram di sela-sela jam kantor. Masalah yang tersisa adalah kebiasaan membuka WhatsApp Web secara berulang setiap 5 menit. Disarankan menutup tab WhatsApp Web saat membutuhkan konsentrasi penuh.",
      recommendations: ["Tab Pemblokir Mandiri: Gunakan pemblokir situs web untuk menutup akses chat selama sesi fokus.", "Metode Pomodoro: Terapkan jeda 5 menit setiap 25 menit bekerja."],
    },
    {
      id: "w1",
      period: "26 Apr – 2 Mei 2026",
      score: 75,
      risk: "Low",
      riskColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      summary: "Awal pelacakan yang sehat. Kontrol diri prima dengan tingkat istirahat malam yang sangat teratur.",
      details:
        "Minggu pertama perekaman menunjukkan performa ideal. Screen time harian rata-rata berada pada 2.5 jam. Tidak terdeteksi adanya pelanggaran jam malam atau distraksi jam produktif yang berat. Pertahankan kestabilan ini.",
      recommendations: ["Pertahankan Rutinitas: Jaga konsistensi jadwal tidur pukul 22:00.", "Review Harian: Buka dashboard setiap malam untuk memantau performa."],
    },
  ],
  analysisPeriod: "17 Mei – 23 Mei 2026",
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
    {
      title: "Lakukan Aktivitas Pengganti Malam Hari",
      desc: "Gantikan sesi scroll malam dengan membaca buku fisik atau jurnal harian guna mempermudah pelepasan melatonin alami.",
    },
  ],
};

export const notificationPageDummy = {
  initialNotifications: [
    {
      id: "1",
      type: "Midnight Alert",
      message: "Midnight Usage Terdeteksi: Anda membuka Instagram pada jam 23:45 tadi malam.",
      timestamp: "10 jam yang lalu",
      read: false,
      iconKey: "shield",
      iconColor: "text-red-600 bg-red-50 border-red-100",
    },
    {
      id: "2",
      type: "Usage Warning",
      message: "Batas Harian Tercapai: TikTok hari ini telah digunakan selama 1 jam 45 menit (Batas wajar: 1.5 jam).",
      timestamp: "12 jam yang lalu",
      read: false,
      iconKey: "ban",
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "3",
      type: "Focus Reminder",
      message: "Peringatan Fokus: Terdeteksi membuka YouTube selama jam produktif (13:10 – 13:40). Tetap fokus pada tugas Anda!",
      timestamp: "1 hari yang lalu",
      read: true,
      iconKey: "clock",
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "4",
      type: "Continuous Usage Reminder",
      message: "Sesi Tanpa Jeda: Anda berselancar di TikTok selama 40 menit tanpa henti. Regangkan otot Anda!",
      timestamp: "2 hari yang lalu",
      read: true,
      iconKey: "bell",
      iconColor: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      id: "5",
      type: "Focus Reminder",
      message: "Peringatan Fokus: Terdeteksi membuka X (Twitter) pada jam 09:30. Lindungi jam kerja produktif Anda.",
      timestamp: "3 hari yang lalu",
      read: true,
      iconKey: "clock",
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ],
};

export const monitoringSettingsDummy = {
  initialApps: dummyTables.userMonitoredApps.map((row) => {
    const app = dummyTables.apps.find((item) => item.id === row.appId);
    return {
      id: app?.appName.toLowerCase().replace(/\s+/g, "-") ?? `app-${row.appId}`,
      name: app?.appName ?? "Unknown",
      platform: row.platform,
      enabled: row.enabled,
      category: app?.category ?? "Lainnya",
      color:
        app?.appName === "Instagram"
          ? "bg-pink-600"
          : app?.appName === "TikTok"
            ? "bg-black"
            : app?.appName === "YouTube"
              ? "bg-red-600"
              : app?.appName === "WhatsApp"
                ? "bg-green-600"
                : "bg-zinc-700",
    };
  }),
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
    productiveStart: userSetting.productivityStart,
    productiveEnd: userSetting.productivityEnd,
    bedtimeStart: userSetting.midnightStart,
    bedtimeEnd: userSetting.midnightEnd,
  },
};

export const settingsDummy = {
  profile: {
    name: primaryUser.username,
    email: "roid@fomotracker.com",
  },
  notificationSettings: {
    toggles: {
      usageWarning: userSetting.usageWarningEnabled,
      focusReminder: userSetting.focusReminderEnabled,
      midnightAlert: userSetting.midnightAlertEnabled,
      continuousUsage: userSetting.continuousUsageEnabled,
    },
    thresholdDaily: Math.floor(userSetting.screenTimeThresholdSec / 60),
    thresholdContinuous: Math.floor(userSetting.continuousThresholdSec / 60),
  },
  privacyExportData: {
    username: primaryUser.username,
    email: "roid@fomotracker.com",
    created_at: primaryUser.createdAt,
    timezone: primaryUser.timezone,
    monitored_apps: monitoringSettingsDummy.initialApps.map((app) => ({
      name: app.name,
      platform: app.platform,
      enabled: app.enabled,
    })),
    hours_configuration: {
      productive: {
        start: userSetting.productivityStart,
        end: userSetting.productivityEnd,
      },
      bedtime: {
        start: userSetting.midnightStart,
        end: userSetting.midnightEnd,
      },
    },
    recent_daily_screentime: [
      { date: "2026-05-23", minutes: 255, behavioral_score: 68 },
      { date: "2026-05-22", minutes: 280, behavioral_score: 65 },
      { date: "2026-05-21", minutes: 310, behavioral_score: 60 },
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
      category: "Chatting",
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
  productiveStart: userSetting.productivityStart,
  productiveEnd: userSetting.productivityEnd,
  bedtimeStart: userSetting.midnightStart,
  bedtimeEnd: userSetting.midnightEnd,
  notifications: {
    usageWarning: userSetting.usageWarningEnabled,
    focusReminder: userSetting.focusReminderEnabled,
    midnightAlert: userSetting.midnightAlertEnabled,
    continuousUsage: userSetting.continuousUsageEnabled,
  },
};
