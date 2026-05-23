"use server";

import { registerService, loginService } from "@/lib/services/auth.service";

export async function register(formData: FormData) {
  return registerService(formData);
}

export async function login(formData: FormData) {
  return loginService(formData);
}
