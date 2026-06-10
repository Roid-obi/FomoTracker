import { z } from "zod";

export namespace UserModel {
  export const userData = z.object({
    name: z.string(),
    avatarUrl: z.string().nullable(),
    email: z.string().email(),
    onboardingCompleted: z.boolean(),
  });
  export type userData = z.infer<typeof userData>;

  export const updateRequest = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    newPassword: z.string().min(6).optional().or(z.literal("")),
    avatarUrl: z.string().url().optional(),
  });
  export type updateRequest = z.infer<typeof updateRequest>;

  export const updateData = z.object({
    name: z.string(),
    avatarUrl: z.string(),
    updatedAt: z.date(),
  });
  export type updateData = z.infer<typeof updateData>;

  export const completeOnboardingRequest = z.object({
    isAndroidConnected: z.boolean(),
    isBrowserConnected: z.boolean(),
    selectedApps: z.array(z.string()),
    productiveStart: z.string(),
    productiveEnd: z.string(),
    sleepStart: z.string(),
    sleepEnd: z.string(),
    notifScreenTimeEnabled: z.boolean(),
    screenTimeLimitSeconds: z.number(),
    notifProductiveHourEnabled: z.boolean(),
    notifMidnightEnabled: z.boolean(),
    notifContinuousEnabled: z.boolean(),
    continuousLimitSeconds: z.number(),
  });
  export type completeOnboardingRequest = z.infer<
    typeof completeOnboardingRequest
  >;
}
