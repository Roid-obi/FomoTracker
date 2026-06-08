import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { table } from "@/lib/databases/schema";

export namespace NotificationModel {
  export const getNotificationResponse = z.object({
    id: z.string().uuid(),
    type: z.string(),
    message: z.string(),
    isRead: z.boolean().nullable(),
    createdAt: z.date().nullable(),
  });
  export type getNotificationResponse = z.infer<typeof getNotificationResponse>;

  const baseInsertNotificationRequest = createInsertSchema(
    table.notifications,
  ).pick({
    userId: true,
    type: true,
    message: true,
  });

  export const insertNotificationRequest = baseInsertNotificationRequest;
  export type insertNotificationRequest = z.infer<
    typeof insertNotificationRequest
  >;

  const baseUpdateNotificationRequest = createUpdateSchema(
    table.notifications,
  ).pick({
    isRead: true,
  });

  export const updateNotificationRequest = baseUpdateNotificationRequest.extend(
    {
      id: z.string().uuid(),
    },
  );
  export type updateNotificationRequest = z.infer<
    typeof updateNotificationRequest
  >;

  export const updateAllNotificationRequest = z.object({
    markAllRead: z.literal(true),
  });
  export type updateAllNotificationRequest = z.infer<
    typeof updateAllNotificationRequest
  >;
}
