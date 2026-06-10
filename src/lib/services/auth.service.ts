import { z } from "zod";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { LoginModel, RegisterModel } from "@/lib/models/auth.model";

export async function registerService(body: unknown) {
  const parsed = RegisterModel.registerRequest.safeParse(body);

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  const { email, password, name } = parsed.data;

  // Use server client so session cookies are set in the HTTP response
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/confirm` : undefined,
      data: {
        name: name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loginService(body: unknown) {
  // Use server client so session cookies are written to the HTTP response
  const supabase = await createSupabaseServer();
  const parsed = LoginModel.loginRequest.safeParse(body);

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
