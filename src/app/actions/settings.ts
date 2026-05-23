"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/databases";
import { userSettings } from "@/lib/databases/schema";

export async function getUserSettings(userId: string) {
  try {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return { success: true, settings };
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return { success: false, error: error.message };
  }
}
