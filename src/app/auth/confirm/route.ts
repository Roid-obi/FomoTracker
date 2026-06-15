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
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code");

  const supabase = await createSupabaseServer();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("OTP verification error:", error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url),
    );
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let onboardingCompleted = false;
      if (user) {
        // Cek apakah user sudah terdaftar di public.users
        const existingUser = await db
          .select()
          .from(table.users)
          .where(eq(table.users.id, user.id))
          .limit(1)
          .then((res) => res[0]);

        if (!existingUser) {
          // Sync nama dan avatar dari user metadata
          const name =
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            user.email?.split("@")[0] ||
            "User Google";
          const avatarUrl = user.user_metadata.avatar_url || null;

          await db.insert(table.users).values({
            id: user.id,
            name,
            avatarUrl,
            onboardingCompleted: false,
          });
        } else {
          onboardingCompleted = !!existingUser.onboardingCompleted;
        }
      }

      const redirectUrl = onboardingCompleted ? next : "/onboarding";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    console.error("Exchange code for session error:", error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  // Redirect user to login page if something goes wrong
  return NextResponse.redirect(
    new URL("/auth/login?error=Invalid request configuration", request.url),
  );
}
