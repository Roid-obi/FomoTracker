import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
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
      // Pass session tokens via deep link so the native app can call setSession()
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const deepLinkUrl = new URL("fomotracker://callback");
        deepLinkUrl.searchParams.set("access_token", session.access_token);
        deepLinkUrl.searchParams.set("refresh_token", session.refresh_token);
        return NextResponse.redirect(deepLinkUrl.toString());
      }
      return NextResponse.redirect(
        "fomotracker://login?error=Session%20tidak%20ditemukan",
      );
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Redirect user to login page if something goes wrong
  return NextResponse.redirect(
    new URL("/auth/login?error=Verifikasi gagal", request.url),
  );
}
