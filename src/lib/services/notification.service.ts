import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { NotificationModel } from "@/lib/models/notification.model";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function validationError(error: z.ZodError) {
  return z.treeifyError(error);
}

const notificationSelect = {
  id: table.notifications.id,
  type: table.notifications.type,
  message: table.notifications.message,
  isRead: table.notifications.isRead,
  createdAt: table.notifications.createdAt,
};

export async function getNotificationsService(): Promise<ServiceResult<NotificationModel.getNotificationResponse[]>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const rows = await db
    .select(notificationSelect)
    .from(table.notifications)
    .where(eq(table.notifications.userId, userId))
    .orderBy(desc(table.notifications.createdAt));

  const parsed = NotificationModel.getNotificationResponse
    .array()
    .safeParse(rows);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function createNotificationService(
  body: unknown,
): Promise<ServiceResult<NotificationModel.getNotificationResponse>> {
  const parsed = NotificationModel.insertNotificationRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const [row] = await db
    .insert(table.notifications)
    .values(parsed.data)
    .returning(notificationSelect);

  const response = NotificationModel.getNotificationResponse.safeParse(row);

  if (!response.success) {
    return { success: false, error: validationError(response.error) };
  }

  return { success: true, data: response.data };
}

export async function updateNotificationService(
  body: unknown,
): Promise<ServiceResult<NotificationModel.getNotificationResponse[]>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const markAllParsed = NotificationModel.updateAllNotificationRequest.safeParse(body);

  if (markAllParsed.success) {
    await db
      .update(table.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(table.notifications.userId, userId),
          eq(table.notifications.isRead, false),
        ),
      );

    return getNotificationsService();
  }

  const parsed = NotificationModel.updateNotificationRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const { id, isRead } = parsed.data;

  const [existing] = await db
    .select({ id: table.notifications.id })
    .from(table.notifications)
    .where(
      and(
        eq(table.notifications.id, id),
        eq(table.notifications.userId, userId),
      ),
    );

  if (!existing) {
    return { success: false, error: "Notifikasi tidak ditemukan" };
  }

  if (isRead !== undefined) {
    await db
      .update(table.notifications)
      .set({ isRead })
      .where(eq(table.notifications.id, id));
  }

  return getNotificationsService();
}