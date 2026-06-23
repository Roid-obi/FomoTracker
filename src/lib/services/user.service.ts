import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
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

  const avatarPath = userData.avatarUrl;
  const avatarUrl = avatarPath
    ? supabase.storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl
    : null;

  const parsed = UserModel.userData.safeParse({
    ...userData,
    id,
    avatarUrl,
    email: user.email,
    onboardingCompleted: userData.onboardingCompleted ?? false,
  });

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateService(body: unknown) {
  const supabaseServer = await createSupabaseServer();

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const id = user.id;

  const parsed = UserModel.updateRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { name, email, newPassword, avatarUrl } = parsed.data;

  // Update email di Supabase Auth jika berubah
  if (email && email !== user.email) {
    const { error: emailError } = await supabaseServer.auth.updateUser({
      email,
    });
    if (emailError) {
      return {
        success: false,
        error: `Gagal memperbarui email: ${emailError.message}`,
      };
    }
  }

  // Update password di Supabase Auth jika diisi
  if (newPassword) {
    const { error: passError } = await supabaseServer.auth.updateUser({
      password: newPassword,
    });
    if (passError) {
      return {
        success: false,
        error: `Gagal memperbarui password: ${passError.message}`,
      };
    }
  }

  const updateData: Partial<UserModel.updateData> = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl;
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updatedAt = new Date();
    await db.update(table.users).set(updateData).where(eq(table.users.id, id));
  }

  return { success: true };
}

export async function uploadAvatarService(formData: FormData) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not found" };
  }
  const id = user.id;

  const avatar = formData.get("avatar");
  if (!(avatar instanceof File) || avatar.size === 0) {
    return { success: false, error: "File avatar tidak valid" };
  }

  // Hapus avatar lama jika ada
  const [existing] = await db
    .select({ url: table.users.avatarUrl })
    .from(table.users)
    .where(eq(table.users.id, id));

  if (existing?.url) {
    await supabase.storage.from("avatars").remove([existing.url]);
  }

  // Upload avatar baru
  const ext = avatar.name.split(".").pop();
  const fileName = `${id}/avatar_${id}_${Date.now()}.${ext}`;

  const { data: urlData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Simpan path ke database
  await db
    .update(table.users)
    .set({ avatarUrl: urlData.path, updatedAt: new Date() })
    .where(eq(table.users.id, id));

  // Ambil public URL
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(urlData.path);

  return { success: true, avatarUrl: publicUrlData.publicUrl };
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
    const [existing] = await db
      .select({ id: table.userDevices.id })
      .from(table.userDevices)
      .where(
        and(
          eq(table.userDevices.userId, id),
          eq(table.userDevices.platform, "android_app"),
        ),
      );

    if (existing) {
      await db
        .update(table.userDevices)
        .set({ isConnected: true, connectedAt: new Date() })
        .where(eq(table.userDevices.id, existing.id));
    } else {
      await db.insert(table.userDevices).values({
        userId: id,
        platform: "android_app",
        deviceName: "Android Phone",
        isConnected: true,
        connectedAt: new Date(),
      });
    }
  }

  if (data.isBrowserConnected) {
    const [existing] = await db
      .select({ id: table.userDevices.id })
      .from(table.userDevices)
      .where(
        and(
          eq(table.userDevices.userId, id),
          eq(table.userDevices.platform, "browser_extension"),
        ),
      );

    if (existing) {
      await db
        .update(table.userDevices)
        .set({ isConnected: true, connectedAt: new Date() })
        .where(eq(table.userDevices.id, existing.id));
    } else {
      await db.insert(table.userDevices).values({
        userId: id,
        platform: "browser_extension",
        browserName: "Web Browser",
        isConnected: true,
        connectedAt: new Date(),
      });
    }
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

export async function deleteUserService(
  id: string,
): Promise<ServiceResult<void>> {
  // 1. Hapus dari tabel public.users (cascade delete akan menghapus baris dependen di schema public)
  await db.delete(table.users).where(eq(table.users.id, id));

  // 2. Hapus dari auth.users (menghapus record autentikasi Supabase)
  await db.execute(sql`delete from auth.users where id = ${id}`);

  return { success: true, data: undefined };
}
