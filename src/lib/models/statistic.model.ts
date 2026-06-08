import { z } from "zod";

// YYYY-MM-DD regex
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Format tanggal harus YYYY-MM-DD",
});

export namespace StatisticModel {
  // ----------------------------------------------------------------
  // Shared request schemas
  // ----------------------------------------------------------------

  /** Query params umum untuk range tanggal */
  export const dateRangeRequest = z.object({
    startDate: dateString,
    endDate: dateString,
  });
  export type dateRangeRequest = z.infer<typeof dateRangeRequest>;

  // ----------------------------------------------------------------
  // GET /screen-time
  // Tren screen time harian dalam rentang waktu (dari daily_stats)
  // ----------------------------------------------------------------

  export const getScreenTimeItem = z.object({
    /** Tanggal statistik */
    statDate: z.string(), // tetap string YYYY-MM-DD agar mudah di-render chart
    /** Total durasi semua app dalam detik */
    totalDurationSeconds: z.number().int().nonnegative(),
    /** Total frekuensi buka app */
    openFrequency: z.number().int().nonnegative(),
    /** Durasi di jam tidur */
    midnightDurationSeconds: z.number().int().nonnegative(),
    /** Durasi di jam produktif */
    productiveHourDurationSeconds: z.number().int().nonnegative(),
    /** Sesi nonstop terpanjang (max across apps) */
    maxContinuousSeconds: z.number().int().nonnegative(),
  });
  export type getScreenTimeItem = z.infer<typeof getScreenTimeItem>;

  export const getScreenTimeResponse = z.object({
    items: z.array(getScreenTimeItem),
    /** Rata-rata harian screen time dalam detik */
    avgDailySeconds: z.number().nonnegative(),
    /** Total screen time seluruh periode dalam detik */
    totalSeconds: z.number().int().nonnegative(),
    /** Hari dengan screen time tertinggi */
    peakDate: z.string().nullable(),
    /** Nilai screen time di hari puncak */
    peakSeconds: z.number().int().nonnegative(),
  });
  export type getScreenTimeResponse = z.infer<typeof getScreenTimeResponse>;

  // ----------------------------------------------------------------
  // GET /breakdown
  // Perincian per app dalam rentang waktu (dari daily_stats + apps)
  // ----------------------------------------------------------------

  export const getBreakdownItem = z.object({
    appId: z.string().uuid(),
    appName: z.string(),
    category: z.string(),
    platform: z.string(),
    iconUrl: z.string().nullable(),
    /** Total durasi selama periode (detik) */
    totalDurationSeconds: z.number().int().nonnegative(),
    /** Total frekuensi buka */
    totalOpenFrequency: z.number().int().nonnegative(),
    /** Durasi malam hari */
    totalMidnightSeconds: z.number().int().nonnegative(),
    /** Durasi jam produktif */
    totalProductiveHourSeconds: z.number().int().nonnegative(),
    /** Persentase dari total semua app (0-100) */
    sharePercent: z.number().nonnegative(),
  });
  export type getBreakdownItem = z.infer<typeof getBreakdownItem>;

  export const getBreakdownResponse = z.object({
    items: z.array(getBreakdownItem),
    /** Total gabungan semua app dalam detik */
    grandTotalSeconds: z.number().int().nonnegative(),
  });
  export type getBreakdownResponse = z.infer<typeof getBreakdownResponse>;

  // ----------------------------------------------------------------
  // GET /active-hours
  // Heatmap jam aktif 0-23 (dari activity_logs GROUP BY hour)
  // ----------------------------------------------------------------

  export const getActiveHoursItem = z.object({
    /** Jam (0-23) */
    hour: z.number().int().min(0).max(23),
    /** Total durasi pada jam ini dalam detik */
    totalDurationSeconds: z.number().int().nonnegative(),
    /** Jumlah sesi pada jam ini */
    sessionCount: z.number().int().nonnegative(),
  });
  export type getActiveHoursItem = z.infer<typeof getActiveHoursItem>;

  export const getActiveHoursResponse = z.object({
    /** 24 slot jam, selalu lengkap 0-23 */
    hours: z.array(getActiveHoursItem).length(24),
    /** Jam dengan aktivitas tertinggi */
    peakHour: z.number().int().min(0).max(23).nullable(),
    /** Durasi terbesar di peakHour */
    peakDurationSeconds: z.number().int().nonnegative(),
  });
  export type getActiveHoursResponse = z.infer<typeof getActiveHoursResponse>;

  // ----------------------------------------------------------------
  // GET /weekly-habit
  // Pola kebiasaan per hari-dalam-seminggu (Senin-Minggu)
  // Dari daily_stats GROUP BY day-of-week
  // ----------------------------------------------------------------

  export const getWeeklyHabitItem = z.object({
    /**
     * Hari dalam seminggu: 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
     * (sesuai JS Date.getDay() dan PostgreSQL EXTRACT(DOW))
     */
    dayOfWeek: z.number().int().min(0).max(6),
    /** Label singkat hari */
    dayLabel: z.enum(["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]),
    /** Rata-rata screen time harian pada hari ini (detik) */
    avgDurationSeconds: z.number().nonnegative(),
    /** Rata-rata frekuensi buka app */
    avgOpenFrequency: z.number().nonnegative(),
    /** Rata-rata durasi tengah malam */
    avgMidnightSeconds: z.number().nonnegative(),
    /** Rata-rata durasi jam produktif */
    avgProductiveHourSeconds: z.number().nonnegative(),
    /** Jumlah hari data yang digunakan untuk rata-rata */
    dataPoints: z.number().int().nonnegative(),
  });
  export type getWeeklyHabitItem = z.infer<typeof getWeeklyHabitItem>;

  export const getWeeklyHabitResponse = z.object({
    /** 7 slot hari, selalu lengkap 0-6 */
    days: z.array(getWeeklyHabitItem).length(7),
    /** Hari dengan rata-rata screen time tertinggi */
    busiestDay: z.number().int().min(0).max(6).nullable(),
    /** Hari dengan rata-rata screen time terendah (hanya hari yang ada data) */
    lightestDay: z.number().int().min(0).max(6).nullable(),
  });
  export type getWeeklyHabitResponse = z.infer<typeof getWeeklyHabitResponse>;
}
