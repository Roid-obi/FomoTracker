"use server";

import { loginService, registerService } from "@/lib/services/auth.service";

export async function register(formData: FormData) {
  return registerService(formData);
}

export async function login(formData: FormData) {
  return loginService(formData);
}
