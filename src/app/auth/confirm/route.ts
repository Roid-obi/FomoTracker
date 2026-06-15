import type { EmailOtpType } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";

function getRedirectHtml(redirectUrl: string, isError: boolean = false, errorMessage?: string) {
  const title = isError ? "Autentikasi Gagal" : "Autentikasi Berhasil";
  const statusClass = isError ? "error" : "success";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Fomo Tracker</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
      padding: 20px;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 40px 30px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .icon {
      font-size: 32px;
      margin-bottom: 20px;
      display: inline-block;
      width: 80px;
      height: 80px;
      line-height: 80px;
      border-radius: 50%;
    }
    .success .icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .error .icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #ffffff;
    }
    p {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .btn:active {
      transform: scale(0.98);
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
    }
    .error .btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
    }
    .loader {
      display: inline-block;
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: #6366f1;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
  <script>
    window.onload = function() {
      // Automatic redirect after a brief delay
      setTimeout(function() {
        window.location.href = "${redirectUrl}";
      }, 500);
    };
  </script>
</head>
<body>
  <div class="card ${statusClass}">
    ${isError ? '<div class="icon">✕</div>' : '<div class="loader"></div>'}
    <h1>${title}</h1>
    <p>${isError ? (errorMessage || "Terjadi kesalahan saat memproses login.") : "Autentikasi berhasil. Klik tombol di bawah untuk kembali ke aplikasi jika tidak dialihkan secara otomatis."}</p>
    <a href="${redirectUrl}" class="btn">Kembali ke Aplikasi</a>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const platform = searchParams.get("platform");
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code");

  const supabase = await createSupabaseServer();

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      if (platform === "mobile") {
        if (data.session) {
          const redirectUrl = new URL("fomotracker://auth/confirm");
          redirectUrl.searchParams.set("access_token", data.session.access_token);
          redirectUrl.searchParams.set("refresh_token", data.session.refresh_token);
          return new Response(getRedirectHtml(redirectUrl.toString()), {
            headers: { "Content-Type": "text/html" },
          });
        }
        const errorUrl = "fomotracker://auth/login?error=Sesi+autentikasi+tidak+ditemukan";
        return new Response(getRedirectHtml(errorUrl, true, "Sesi autentikasi tidak ditemukan."), {
          headers: { "Content-Type": "text/html" },
        });
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (platform === "mobile") {
        if (data.session) {
          const redirectUrl = new URL("fomotracker://auth/confirm");
          redirectUrl.searchParams.set("access_token", data.session.access_token);
          redirectUrl.searchParams.set("refresh_token", data.session.refresh_token);
          return new Response(getRedirectHtml(redirectUrl.toString()), {
            headers: { "Content-Type": "text/html" },
          });
        }
        const errorUrl = "fomotracker://auth/login?error=Sesi+autentikasi+tidak+ditemukan";
        return new Response(getRedirectHtml(errorUrl, true, "Sesi autentikasi tidak ditemukan."), {
          headers: { "Content-Type": "text/html" },
        });
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect user to login page if something goes wrong
  if (platform === "mobile") {
    const errorUrl = "fomotracker://auth/login?error=Verifikasi+email+gagal";
    return new Response(getRedirectHtml(errorUrl, true, "Verifikasi email gagal."), {
      headers: { "Content-Type": "text/html" },
    });
  }
  return NextResponse.redirect(
    new URL("/auth/login?error=Verifikasi email gagal", request.url),
  );
}
