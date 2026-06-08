import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createClient, createSupabaseServer } from "@/lib/databases/supabase";
import { UserModel } from "../models/user.model";

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
    })
    .from(table.users)
    .where(eq(table.users.id, id));

  if (!userData) {
    return { success: false, error: "User not found" };
  }

  const parsed = UserModel.userData.safeParse({
    ...userData,
    email: user.email,
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
