import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import {
  DeviceModel,
  SettingModel,
  TrackedAppModel,
} from "@/lib/models/setting.model";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function validationError(error: z.ZodError) {
  return z.treeifyError(error);
}

const settingSelect = {
  productiveStart: table.userSettings.productiveStart,
  productiveEnd: table.userSettings.productiveEnd,
  sleepStart: table.userSettings.sleepStart,
  sleepEnd: table.userSettings.sleepEnd,
  screenTimeLimitSeconds: table.userSettings.screenTimeLimitSeconds,
  continuousLimitSeconds: table.userSettings.continuousLimitSeconds,
  notifScreenTimeEnabled: table.userSettings.notifScreenTimeEnabled,
  notifProductiveHourEnabled: table.userSettings.notifProductiveHourEnabled,
  notifMidnightEnabled: table.userSettings.notifMidnightEnabled,
  notifContinuousEnabled: table.userSettings.notifContinuousEnabled,
};

const deviceSelect = {
  platform: table.userDevices.platform,
  deviceName: table.userDevices.deviceName,
  browserName: table.userDevices.browserName,
  isConnected: table.userDevices.isConnected,
  lastSyncedAt: table.userDevices.lastSyncedAt,
  connectedAt: table.userDevices.connectedAt,
};

const trackedAppSelect = {
  appId: table.userTrackedApps.appId,
  isActive: table.userTrackedApps.isActive,
  addedAt: table.userTrackedApps.addedAt,
};

export async function getSettingService(): Promise<
  ServiceResult<SettingModel.getResponse>
> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  let [setting] = await db
    .select(settingSelect)
    .from(table.userSettings)
    .where(eq(table.userSettings.userId, userId));

  if (!setting) {
    [setting] = await db
      .insert(table.userSettings)
      .values({ userId })
      .returning(settingSelect);
  }

  const parsed = SettingModel.getResponse.safeParse(setting);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateSettingService(
  body: unknown,
): Promise<ServiceResult<SettingModel.getResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const parsed = SettingModel.updateRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const updateData = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(updateData).length === 0) {
    return getSettingService();
  }

  await db
    .insert(table.userSettings)
    .values({ userId, ...updateData, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: table.userSettings.userId,
      set: { ...updateData, updatedAt: new Date() },
    });

  return getSettingService();
}

export async function getDeviceService(): Promise<
  ServiceResult<DeviceModel.getResponse[]>
> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const devices = await db
    .select(deviceSelect)
    .from(table.userDevices)
    .where(eq(table.userDevices.userId, userId));

  const parsed = DeviceModel.getResponse.array().safeParse(devices);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateDeviceService(
  body: unknown,
): Promise<ServiceResult<DeviceModel.getResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const parsed = DeviceModel.updateRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const { platform, ...data } = parsed.data;

  if (!platform) {
    return { success: false, error: "Platform is required" };
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );

  const [existingDevice] = await db
    .select({ id: table.userDevices.id })
    .from(table.userDevices)
    .where(
      and(
        eq(table.userDevices.userId, userId),
        eq(table.userDevices.platform, platform),
      ),
    );

  let device: unknown;

  if (existingDevice) {
    if (Object.keys(updateData).length > 0) {
      [device] = await db
        .update(table.userDevices)
        .set(updateData)
        .where(eq(table.userDevices.id, existingDevice.id))
        .returning(deviceSelect);
    } else {
      [device] = await db
        .select(deviceSelect)
        .from(table.userDevices)
        .where(eq(table.userDevices.id, existingDevice.id));
    }
  } else {
    [device] = await db
      .insert(table.userDevices)
      .values({ userId, platform, ...updateData })
      .returning(deviceSelect);
  }

  const response = DeviceModel.getResponse.safeParse(device);

  if (!response.success) {
    return { success: false, error: validationError(response.error) };
  }

  return { success: true, data: response.data };
}

export async function getTrackedAppService(): Promise<
  ServiceResult<TrackedAppModel.getResponse[]>
> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const trackedApps = await db
    .select(trackedAppSelect)
    .from(table.userTrackedApps)
    .where(eq(table.userTrackedApps.userId, userId));

  const parsed = TrackedAppModel.getResponse.array().safeParse(trackedApps);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateTrackedAppService(
  body: unknown,
): Promise<ServiceResult<TrackedAppModel.getResponse>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, error: "User not found" };
  }

  const parsed = TrackedAppModel.insertRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: validationError(parsed.error) };
  }

  const [trackedApp] = await db
    .insert(table.userTrackedApps)
    .values({ userId, ...parsed.data })
    .onConflictDoUpdate({
      target: [table.userTrackedApps.userId, table.userTrackedApps.appId],
      set: { isActive: parsed.data.isActive ?? true },
    })
    .returning(trackedAppSelect);

  const response = TrackedAppModel.getResponse.safeParse(trackedApp);

  if (!response.success) {
    return { success: false, error: validationError(response.error) };
  }

  return { success: true, data: response.data };
}
