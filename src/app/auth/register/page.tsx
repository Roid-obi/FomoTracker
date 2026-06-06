"use client";

import { api } from "@/lib/utils/api";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok!");
      return;
    }
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    try {
      const response = await api.post('/api/auth/register', formData);

      if (!response.data.success) {
        setErrorMsg(response.data.error);
        return;
      }
      
      router.push("/onboarding");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden justify-center items-center px-4 sm:px-6">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/15 rounded-full blur-[100px] -z-10" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-lg shadow-primary/5">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-0.5 select-none mb-3">
            <span className="font-yellowtail text-4xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-[10px] font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </div>
          <h2 className="text-xl font-bold font-poppins text-primary">
            Buat Akun Baru
          </h2>
          <p className="text-muted text-xs font-poppins font-light mt-1.5">
            Daftar sekarang gratis untuk mulai mengontrol kebiasaan digitalmu.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegisterSubmit}>
          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-bold text-muted uppercase tracking-wider"
            >
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="username"
                type="text"
                placeholder="Nama Lengkap Anda"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
            </div>
          </div>

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
                type="email"
                placeholder="nama@email.com"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold text-muted uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
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

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-muted uppercase tracking-wider"
            >
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Ulangi password Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[10px] text-red-600 font-semibold">{errorMsg}</p>
          )}

          {/* Terms & Conditions checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              id="terms"
              type="checkbox"
              required
              className="mt-0.5 rounded border-border text-secondary focus:ring-secondary cursor-pointer"
            />
            <label
              htmlFor="terms"
              className="text-[10px] text-muted font-poppins leading-relaxed font-light cursor-pointer select-none"
            >
              Saya menyetujui{" "}
              <span className="font-semibold text-secondary hover:underline">
                Syarat & Ketentuan
              </span>{" "}
              serta{" "}
              <span className="font-semibold text-secondary hover:underline">
                Kebijakan Privasi
              </span>{" "}
              FomoTracker.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-secondary transition-all font-semibold shadow-sm text-sm cursor-pointer font-poppins mt-2"
          >
            Daftar Akun
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-[10px] text-muted font-semibold uppercase tracking-wider">
              Atau
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="w-full py-3 rounded-xl border border-border bg-white hover:bg-muted-light/35 text-primary transition-all font-semibold shadow-xs text-xs flex items-center justify-center gap-2.5 cursor-pointer font-poppins"
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
            <span>Daftar dengan Google</span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted font-poppins font-light mt-5">
          Sudah memiliki akun?{" "}
          <Link
            href="/auth/login"
            className="text-secondary font-semibold hover:underline"
          >
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
