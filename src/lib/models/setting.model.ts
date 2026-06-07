import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { table } from "@/lib/databases/schema";

export namespace SettingModel {
  export const getResponse = z.object({
    productiveStart: z.string(),
    productiveEnd: z.string(),
    sleepStart: z.string(),
    sleepEnd: z.string(),
    screenTimeLimitSeconds: z.number(),
    continuousLimitSeconds: z.number(),
    notifScreenTimeEnabled: z.boolean(),
    notifProductiveHourEnabled: z.boolean(),
    notifMidnightEnabled: z.boolean(),
    notifContinuousEnabled: z.boolean(),
  });
  export type getResponse = z.infer<typeof getResponse>;

  const baseUpdateRequest = createUpdateSchema(table.userSettings).omit({
    id: true,
    userId: true,
    updatedAt: true,
  });

  export const updateRequest = baseUpdateRequest;
  export type updateRequest = z.infer<typeof updateRequest>;
}

export namespace DeviceModel {
  export const getResponse = z.object({
    platform: z.string(),
    deviceName: z.string().nullable(),
    browserName: z.string().nullable(),
    isConnected: z.boolean().nullable(),
    lastSyncedAt: z.date().nullable(),
    connectedAt: z.date().nullable(),
  });
  export type getResponse = z.infer<typeof getResponse>;

  const baseUpdateRequest = createUpdateSchema(table.userDevices).omit({
    id: true,
    userId: true,
    createdAt: true,
  });

  export const updateRequest = baseUpdateRequest.extend({
    lastSyncedAt: z.coerce.date().nullable().optional(),
    connectedAt: z.coerce.date().nullable().optional(),
  });
  export type updateRequest = z.infer<typeof updateRequest>;
}

export namespace TrackedAppModel {
  export const getResponse = z.object({
    appId: z.string(),
    isActive: z.boolean().nullable(),
    addedAt: z.date().nullable(),
  });
  export type getResponse = z.infer<typeof getResponse>;

  const baseInsertRequest = createInsertSchema(table.userTrackedApps).omit({
    id: true,
    userId: true,
    addedAt: true,
  });

  export const insertRequest = baseInsertRequest;
  export type insertRequest = z.infer<typeof insertRequest>;
}
