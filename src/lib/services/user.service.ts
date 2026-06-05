import { z } from "zod";
import { UserModel } from "../models/user.model";
import { table } from "@/lib/databases/schema";
import { db } from "@/lib/databases";
import { supabase } from "@/lib/databases/supabase";
import { eq } from "drizzle-orm";

export async function getService(id: string, email: string) {
  const [user] = await db
    .select({
      name: table.users.name,
      avatarUrl: table.users.avatarUrl,
    })
    .from(table.users)
    .where(eq(table.users.id, id));

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const parsed = UserModel.userData.safeParse({
    ...user,
    email,
  });

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function updateService(id: string, formData: FormData) {
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

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);
    avatar_url = urlData.publicUrl;
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
