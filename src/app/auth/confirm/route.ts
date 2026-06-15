import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
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
    if (!error) isSuccess = true;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) isSuccess = true;
  }

  if (isSuccess) {
    if (platform === "mobile") {
      return NextResponse.redirect("com.fomotracker.app://dashboard");
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Redirect user to login page if something goes wrong
  return NextResponse.redirect(
    new URL("/auth/login?error=Verifikasi gagal", request.url),
  );
}
