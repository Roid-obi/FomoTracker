"use server";

import { getService, updateService } from "@/lib/services/user.service";
import { supabase } from "@/lib/databases/supabase";

export async function getUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Login Required");
  }

  if (!user.email) {
    throw new Error("User email not found");
  }

  const result = await getService(user.id, user.email);
  return result;
}

export async function updateUser(formData: FormData) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Login Required");
  }

  const result = await updateService(user.id, formData);
  return result;
}
