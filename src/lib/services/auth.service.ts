import { z } from "zod";
import { createClient, createSupabaseServer } from "@/lib/databases/supabase";
import { LoginModel, RegisterModel } from "@/lib/models/auth.model";

export async function registerService(formData: FormData) {
  // Use browser client only for storage (anon key is sufficient)
  const supabase = createClient();
  const raw = Object.fromEntries(formData);
  const parsed = RegisterModel.registerRequest.safeParse(raw);
  let avatar_url: string | null = null;

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { email, password, name, avatar } = parsed.data;

  if (avatar instanceof File && avatar.size > 0) {
    const fileName = `avatar_${Date.now()}.${avatar.name.split(".").pop()}`;

    const { data: urlData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    avatar_url = urlData.path;
  }

  // Use server client so session cookies are set in the HTTP response
  const supabaseServer = await createSupabaseServer();
  const { error } = await supabaseServer.auth.signUp({
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
  // Use server client so session cookies are written to the HTTP response
  const supabase = await createSupabaseServer();
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

export async function logoutService() {
  // Use server client so the session cookies are read and then cleared
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
