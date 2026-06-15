"use client";

import { Capacitor } from "@capacitor/core";
import { gooeyToast } from "goey-toast";
import { Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/databases/supabase";
import { api } from "@/lib/utils/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (!email) {
      router.replace("/auth/login");
      return;
    }

    const supabase = createClient();

    const checkSession = async () => {
      try {
        const res = await api.get<{ authenticated: boolean }>(
          "/api/auth/check-session",
        );
        if (res.data.authenticated) {
          clearInterval(interval);
          try {
            const userRes = await api.get("/api/user");
            const user = userRes.data.data;
            if (user && !user.onboardingCompleted) {
              gooeyToast.success(
                "Email berhasil diverifikasi! Mengalihkan ke onboarding...",
              );
              router.push("/onboarding");
            } else {
              gooeyToast.success(
                "Email berhasil diverifikasi! Mengalihkan ke dashboard...",
              );
              router.push("/dashboard");
            }
          } catch {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa sesi:", err);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(checkSession, 3000);

    // Initial check
    checkSession();

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        clearInterval(interval);
        try {
          const userRes = await api.get("/api/user");
          const user = userRes.data.data;
          if (user && !user.onboardingCompleted) {
            gooeyToast.success(
              "Email berhasil diverifikasi! Mengalihkan ke onboarding...",
            );
            router.push("/onboarding");
          } else {
            gooeyToast.success(
              "Email berhasil diverifikasi! Mengalihkan ke dashboard...",
            );
            router.push("/dashboard");
          }
        } catch {
          router.push("/dashboard");
        }
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [email, router]);

  // Cooldown timer logic
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);

    try {
      const supabase = createClient();
      const isNativePlatform = Capacitor.isNativePlatform();
      const origin = isNativePlatform
        ? "https://fomotracker.vercel.app"
        : typeof window !== "undefined"
          ? window.location.origin
          : "";
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${origin}/auth/confirm${isNativePlatform ? "?platform=mobile" : ""}`,
        },
      });

      if (error) {
        gooeyToast.error(`Gagal: ${error.message}`);
      } else {
        gooeyToast.success("Email verifikasi baru berhasil dikirim!");
        setResendCooldown(60); // 60 seconds cooldown
      }
    } catch (_err) {
      gooeyToast.error("Gagal mengirim ulang email verifikasi.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-lg shadow-primary/5 relative">
      {/* Close Button */}
      {!isNative && (
        <Link
          href="/"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted hover:text-primary hover:bg-muted-light/10 transition-colors"
          aria-label="Kembali ke Beranda"
        >
          <X className="w-4 h-4" />
        </Link>
      )}

      {/* Pulsing visual envelope */}
      <div className="flex justify-center mb-6">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
          <Mail className="w-8 h-8 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-secondary/10 animate-ping opacity-75" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-poppins text-primary">
          Verifikasi Email Anda
        </h2>
        <p className="text-muted text-xs font-poppins font-light mt-3 leading-relaxed">
          Kami telah mengirimkan tautan verifikasi ke alamat email:
        </p>
        <p className="text-secondary text-sm font-semibold font-poppins mt-2 select-all break-all">
          {email}
        </p>
      </div>

      {/* Auto-redirect status indicator */}
      <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-muted-light/20 rounded-2xl border border-border/40 my-6">
        <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] text-muted font-medium text-center leading-relaxed">
          Menunggu verifikasi email Anda... Halaman ini akan otomatis beralih ke
          beranda setelah diverifikasi.
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="w-full py-3.5 rounded-xl border border-border bg-white hover:bg-muted-light/35 text-primary transition-all font-semibold shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Mengirim...</span>
            </>
          ) : resendCooldown > 0 ? (
            <span>Kirim Ulang Email ({resendCooldown}s)</span>
          ) : (
            <span>Kirim Ulang Email Verifikasi</span>
          )}
        </button>

        <p className="text-center text-xs text-muted font-poppins font-light pt-2">
          Sudah memverifikasi?{" "}
          <Link
            href="/auth/login"
            className="text-secondary font-semibold hover:underline"
          >
            Masuk manual di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden justify-center items-center px-4 sm:px-6">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/15 rounded-full blur-[100px] -z-10" />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-lg shadow-primary/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted font-poppins">Memuat...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
