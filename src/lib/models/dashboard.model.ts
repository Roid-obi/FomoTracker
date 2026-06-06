import { z } from "zod";

export namespace DashboardModel {
  export const getDailyStatusResponse = z.object({
    scoreDate: z.date(),
    dailyStatus: z.string(),
    usageDurationScore: z.number(),
    openFrequencyScore: z.number(),
    midnightUsageScore: z.number(),
    continuousUsageScore: z.number(),
    productiveHourScore: z.number(),
    totalScore: z.number(),
  });
  export type getDailyStatusResponse = z.infer<typeof getDailyStatusResponse>;

  export const getChartResponse = z.object({
    statDate: z.date(),
    totalDurationSeconds: z.number(),
    openFrequency: z.number(),
    midnightDurationSeconds: z.number(),
    productiveHourDurationSeconds: z.number(),
    maxContinuousSeconds: z.number(),
    peakActiveHour: z.number(),
  });
  export type getChartResponse = z.infer<typeof getChartResponse>;

  export const getBehaviorFlagResponse = z.object({
    flagExcessiveUsage: z.boolean(),
    flagCompulsiveChecking: z.boolean(),
    flagMidnightUsage: z.boolean(),
    flagContinuousUsage: z.boolean(),
    flagProductiveHourDistraction: z.boolean(),
  });
  export type getBehaviorFlagResponse = z.infer<typeof getBehaviorFlagResponse>;
}