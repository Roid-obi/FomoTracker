import { NextResponse } from "next/server";
import { loginOauthService } from "@/lib/services/auth.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const platform = url.searchParams.get("platform") || "web";
    const result = await loginOauthService(origin, platform);

    if (result.success && result.url) {
      // Mobile: return JSON so the native app can open in Capacitor Browser
      if (platform === "mobile") {
        return NextResponse.json({ success: true, url: result.url });
      }
      // Web: redirect directly so browser follows to Google OAuth
      return NextResponse.redirect(result.url);
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || "Failed to initialize Google login",
      },
      { status: 400 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
