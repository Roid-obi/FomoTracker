import { z } from "zod";

export namespace TrackingModel {
  export const activityLogItem = z
    .object({
      packageName: z.string().optional(),
      webDomain: z.string().optional(),
      startedAt: z.coerce.date(),
      endedAt: z.coerce.date(),
      durationSeconds: z.number().int().positive(),
      isMidnight: z.boolean().default(false),
      isProductiveHour: z.boolean().default(false),
      isContinuous: z.boolean().default(false),
      source: z.enum(["android_app", "browser_extension"]),
    })
    .refine((d) => d.packageName || d.webDomain, {
      message: "packageName atau webDomain harus diisi",
    });
  export type activityLogItem = z.infer<typeof activityLogItem>;

  export const syncActivityRequest = z.object({
    userId: z.string().uuid(),
    deviceId: z.string().uuid(),
    logs: z.array(activityLogItem).min(1, "Minimal satu log harus dikirim"),
  });
  export type syncActivityRequest = z.infer<typeof syncActivityRequest>;

  export const syncActivityResponse = z.object({
    inserted: z.number(),
    skipped: z.number(),
    deviceLastSyncedAt: z.date(),
  });
  export type syncActivityResponse = z.infer<typeof syncActivityResponse>;

  export const dailyStatItem = z
    .object({
      packageName: z.string().optional(),
      webDomain: z.string().optional(),
      totalDurationSeconds: z.number().int().nonnegative(),
      openFrequency: z.number().int().nonnegative(),
      midnightDurationSeconds: z.number().int().nonnegative().default(0),
      productiveHourDurationSeconds: z.number().int().nonnegative().default(0),
      maxContinuousSeconds: z.number().int().nonnegative().default(0),
      peakActiveHour: z.number().int().min(0).max(23).optional(),
    })
    .refine((d) => d.packageName || d.webDomain, {
      message: "packageName atau webDomain harus diisi",
    });
  export type dailyStatItem = z.infer<typeof dailyStatItem>;

  export const syncStatsRequest = z.object({
    userId: z.string().uuid(),
    deviceId: z.string().uuid(),
    statDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    stats: z.array(dailyStatItem).min(1, "Minimal satu stat harus dikirim"),
  });
  export type syncStatsRequest = z.infer<typeof syncStatsRequest>;

  export const behavioralScoreResult = z.object({
    totalScore: z.number(),
    dailyStatus: z.enum(["good", "attention", "heavy"]),
    flagExcessiveUsage: z.boolean(),
    flagCompulsiveChecking: z.boolean(),
    flagMidnightUsage: z.boolean(),
    flagContinuousUsage: z.boolean(),
    flagProductiveHourDistraction: z.boolean(),
  });
  export type behavioralScoreResult = z.infer<typeof behavioralScoreResult>;

  export const syncStatsResponse = z.object({
    statsUpserted: z.number(),
    behavioralScore: behavioralScoreResult,
    notificationsCreated: z.number(),
    newNotifications: z
      .array(
        z.object({
          type: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  });
  export type syncStatsResponse = z.infer<typeof syncStatsResponse>;
}
