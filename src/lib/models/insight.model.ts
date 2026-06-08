import { z } from "zod";

export namespace InsightModel {
  const topApp = z.object({
    appId: z.string().uuid(),
    appName: z.string(),
    iconUrl: z.string().nullable(),
  });

  export const insightDetail = z.object({
    id: z.string().uuid(),
    weekStart: z.string(), // YYYY-MM-DD
    weekEnd: z.string(), // YYYY-MM-DD
    generatedAt: z.coerce.date(),
    totalScreenTimeSeconds: z.number().int().nonnegative(),
    avgBehavioralScore: z.number().nonnegative(),
    weeklyStatus: z.enum(["good", "attention", "heavy"]),
    bestDay: z.string().nullable(), // YYYY-MM-DD
    worstDay: z.string().nullable(), // YYYY-MM-DD
    topApp: topApp.nullable(),
    prevWeekScreenTimeSeconds: z.number().int().nullable(),
    aiWeeklyStatusLabel: z.string().nullable(),
    aiPositiveNotes: z.string().nullable(),
    aiConcernNotes: z.string().nullable(),
    aiAnalysis: z.string().nullable(),
    aiTips: z.string().nullable(),
    generationStatus: z.enum(["pending", "generated", "failed"]),
  });
  export type insightDetail = z.infer<typeof insightDetail>;

  export const getLatestResponse = insightDetail;
  export type getLatestResponse = z.infer<typeof getLatestResponse>;

  export const getByIdResponse = insightDetail;
  export type getByIdResponse = z.infer<typeof getByIdResponse>;

  export const insightSummary = z.object({
    id: z.string().uuid(),
    weekStart: z.string(),
    weekEnd: z.string(),
    generatedAt: z.coerce.date(),
    totalScreenTimeSeconds: z.number().int().nonnegative(),
    avgBehavioralScore: z.number().nonnegative(),
    weeklyStatus: z.enum(["good", "attention", "heavy"]),
    generationStatus: z.enum(["pending", "generated", "failed"]),
    aiWeeklyStatusLabel: z.string().nullable(),
  });
  export type insightSummary = z.infer<typeof insightSummary>;

  export const getHistoryResponse = z.object({
    items: z.array(insightSummary),
    total: z.number().int().nonnegative(),
  });
  export type getHistoryResponse = z.infer<typeof getHistoryResponse>;

  export const generateRequest = z
    .object({
      weekStart: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format harus YYYY-MM-DD")
        .optional(),
    })
    .optional();
  export type generateRequest = z.infer<typeof generateRequest>;

  export const aiOutputSchema = z.object({
    weeklyStatusLabel: z.string(),
    positiveNotes: z.string(),
    concernNotes: z.string(),
    analysis: z.string(),
    tips: z.array(z.string()).min(1).max(5),
  });
  export type aiOutputSchema = z.infer<typeof aiOutputSchema>;

  export const generateResponse = z.object({
    id: z.string().uuid(),
    weekStart: z.string(),
    weekEnd: z.string(),
    generationStatus: z.enum(["pending", "generated", "failed"]),
    message: z.string(),
  });
  export type generateResponse = z.infer<typeof generateResponse>;
}
