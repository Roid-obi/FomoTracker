import { z } from "zod";
import { supabase } from "@/lib/databases/supabase";
import { LoginModel, RegisterModel } from "@/lib/models/auth.model";

export async function registerService(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = RegisterModel.registerRequest.safeParse(raw);
  let avatar_url: string | null = null;

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { email, password, name, avatar } = parsed.data;

  if (avatar instanceof File && avatar.size > 0) {
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        avatar_url: avatar_url,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loginService(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = LoginModel.loginRequest.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
