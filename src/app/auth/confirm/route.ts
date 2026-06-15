import type { EmailOtpType } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const platform = searchParams.get("platform");
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code");

  const supabase = await createSupabaseServer();

  let isSuccess = false;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect user to login page if something goes wrong
  return NextResponse.redirect(
    new URL("/auth/login?error=Verifikasi email gagal", request.url),
  );
}
