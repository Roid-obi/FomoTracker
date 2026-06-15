"use client";

import { Capacitor } from "@capacitor/core";
import { Eye, EyeOff, Loader2, Lock, Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/databases/supabase";
import { api } from "@/lib/utils/api";

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { gooeyToast } from "goey-toast";

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const [isNative, setIsNative] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) {
      if (user.onboardingCompleted) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (errorParam) {
      gooeyToast.error(decodeURIComponent(errorParam));
      // Clear error param from URL to avoid re-triggering on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [errorParam]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const isNativePlatform = Capacitor.isNativePlatform();
      const origin = isNativePlatform
        ? "https://fomotracker.vercel.app"
        : typeof window !== "undefined"
          ? window.location.origin
          : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/confirm${isNativePlatform ? "?platform=mobile" : ""}`,
        },
      });
      if (error) {
        gooeyToast.error(`Gagal masuk dengan Google: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error(
        "Terjadi kesalahan sistem saat mencoba masuk dengan Google.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const body = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    try {
      const response = await api.post("/api/auth/login", body);

      if (response.data.success) {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      gooeyToast.error(err.response?.data?.error || "Login Gagal");
    } finally {
      setIsLoading(false);
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
      {/* Header Logo */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-0.5 select-none mb-3">
          <span className="font-yellowtail text-4xl font-normal text-primary leading-none">
            Fomo
          </span>
          <span className="font-poppins text-[10px] font-bold tracking-widest text-primary uppercase leading-none">
            Tracker
          </span>
        </div>
        <h2 className="text-xl font-bold font-poppins text-primary">
          Masuk ke Akun Anda
        </h2>
        <p className="text-muted text-xs font-poppins font-light mt-1.5">
          Selamat datang kembali! Silakan masukkan kredensial Anda.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" method="post" onSubmit={handleLoginSubmit}>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold text-muted uppercase tracking-wider"
          >
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-xs font-bold text-muted uppercase tracking-wider"
            >
              Password
            </label>
            <Link
              href="#"
              className="text-xs text-secondary hover:underline font-semibold"
            >
              Lupa Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-secondary transition-all font-semibold shadow-sm text-sm cursor-pointer font-poppins mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            "Masuk"
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-[10px] text-muted font-semibold uppercase tracking-wider">
            Atau
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-xl border border-border bg-white hover:bg-muted-light/35 text-primary transition-all font-semibold shadow-xs text-xs flex items-center justify-center gap-2.5 cursor-pointer font-poppins disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.87 3a7.16 7.16 0 0 1 6.89-5.68z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.45h6.46a5.52 5.52 0 0 1-2.4 3.62l3.72 2.89c2.18-2 3.71-4.96 3.71-8.62z"
            />
            <path
              fill="#FBBC05"
              d="M5.11 14.72A7.12 7.12 0 0 1 4.75 12c0-.95.16-1.87.46-2.72L1.24 6.28a11.96 11.96 0 0 0 0 11.44l3.87-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.72-2.89c-1.03.69-2.35 1.1-4.24 1.1a7.16 7.16 0 0 1-6.89-5.68l-3.87 3A11.97 11.97 0 0 0 12 23z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-muted font-poppins font-light mt-6">
        Belum punya akun?{" "}
        <Link
          href="/auth/register"
          className="text-secondary font-semibold hover:underline"
        >
          Daftar Gratis
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden justify-center items-center px-4 sm:px-6">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-secondary/15 rounded-full blur-[100px] -z-10" />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-lg shadow-primary/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted font-poppins">Memuat...</p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
