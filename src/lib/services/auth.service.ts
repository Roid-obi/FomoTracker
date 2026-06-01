import { z } from "zod";
import { supabase } from "@/lib/databases/supabase";
import { LoginModel, RegisterModel } from "@/lib/models/auth.model";

export async function registerService(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = RegisterModel.registerRequest.safeParse(raw);
  let profile_url: string | null = null;

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { email, password, username, profile } = parsed.data;

  if (profile instanceof File && profile.size > 0) {
    const fileName = `profile_${Date.now()}.${profile.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(fileName, profile);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);
    profile_url = urlData.publicUrl;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        profile_url: profile_url,
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
