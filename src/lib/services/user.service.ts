import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createClient, createSupabaseServer } from "@/lib/databases/supabase";
import { UserModel } from "../models/user.model";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

export async function getService() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const id = user.id;

  const [userData] = await db
    .select({
      name: table.users.name,
      avatarUrl: table.users.avatarUrl,
      onboardingCompleted: table.users.onboardingCompleted,
    })
    .from(table.users)
    .where(eq(table.users.id, id));

  if (!userData) {
    return { success: false, error: "User not found" };
  }

  const parsed = UserModel.userData.safeParse({
    ...userData,
    email: user.email,
    onboardingCompleted: userData.onboardingCompleted ?? false,
  });

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateService(formData: FormData) {
  const supabase = createClient();
  const supabaseServer = await createSupabaseServer();

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const id = user.id;

  const raw = Object.fromEntries(formData);
  const parsed = UserModel.updateRequest.safeParse(raw);
  let avatar_url: string | null = null;

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { name, avatar } = parsed.data;

  const [get_avatar_url] = await db
    .select({ url: table.users.avatarUrl })
    .from(table.users)
    .where(eq(table.users.id, id));

  if (avatar instanceof File && avatar.size > 0) {
    if (get_avatar_url?.url) {
      const { error } = await supabase.storage
        .from("avatars")
        .remove([get_avatar_url.url]);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    const fileName = `avatar_${Date.now()}.${avatar.name.split(".").pop()}`;

    const { data: urlData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    avatar_url = urlData.path;
  }

  const updateData: Partial<UserModel.updateData> = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (avatar_url !== null) {
    updateData.avatarUrl = avatar_url;
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updatedAt = new Date();
    await db.update(table.users).set(updateData).where(eq(table.users.id, id));
  }

  return { success: true };
}

export async function completeOnboardingService(
  body: unknown,
): Promise<ServiceResult> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const id = user.id;

  const parsed = UserModel.completeOnboardingRequest.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const data = parsed.data;

  // 1. Update user settings
  await db
    .insert(table.userSettings)
    .values({
      userId: id,
      productiveStart: data.productiveStart,
      productiveEnd: data.productiveEnd,
      sleepStart: data.sleepStart,
      sleepEnd: data.sleepEnd,
      screenTimeLimitSeconds: data.screenTimeLimitSeconds,
      continuousLimitSeconds: data.continuousLimitSeconds,
      notifScreenTimeEnabled: data.notifScreenTimeEnabled,
      notifProductiveHourEnabled: data.notifProductiveHourEnabled,
      notifMidnightEnabled: data.notifMidnightEnabled,
      notifContinuousEnabled: data.notifContinuousEnabled,
    })
    .onConflictDoUpdate({
      target: table.userSettings.userId,
      set: {
        productiveStart: data.productiveStart,
        productiveEnd: data.productiveEnd,
        sleepStart: data.sleepStart,
        sleepEnd: data.sleepEnd,
        screenTimeLimitSeconds: data.screenTimeLimitSeconds,
        continuousLimitSeconds: data.continuousLimitSeconds,
        notifScreenTimeEnabled: data.notifScreenTimeEnabled,
        notifProductiveHourEnabled: data.notifProductiveHourEnabled,
        notifMidnightEnabled: data.notifMidnightEnabled,
        notifContinuousEnabled: data.notifContinuousEnabled,
        updatedAt: new Date(),
      },
    });

  // 2. Add devices
  if (data.isAndroidConnected) {
    await db
      .insert(table.userDevices)
      .values({
        userId: id,
        platform: "android_app",
        deviceName: "Android Phone",
        isConnected: true,
        connectedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  if (data.isBrowserConnected) {
    await db
      .insert(table.userDevices)
      .values({
        userId: id,
        platform: "browser_extension",
        browserName: "Web Browser",
        isConnected: true,
        connectedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 3. Add tracked apps
  if (data.selectedApps.length > 0) {
    const trackedAppsToInsert = data.selectedApps.map((appId) => ({
      userId: id,
      appId,
      isActive: true,
    }));

    await db
      .insert(table.userTrackedApps)
      .values(trackedAppsToInsert)
      .onConflictDoUpdate({
        target: [table.userTrackedApps.userId, table.userTrackedApps.appId],
        set: { isActive: true },
      });
  }

  // 4. Set onboardingCompleted = true
  await db
    .update(table.users)
    .set({
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(table.users.id, id));

  return { success: true, data: undefined };
}
