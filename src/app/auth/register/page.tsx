"use client";

import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden justify-center items-center px-4 sm:px-6">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/15 rounded-full blur-[100px] -z-10" />

      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-lg shadow-primary/5">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-0.5 select-none mb-3">
            <span className="font-yellowtail text-4xl font-normal text-primary leading-none">Fomo</span>
            <span className="font-poppins text-[10px] font-bold tracking-widest text-primary uppercase leading-none">Tracker</span>
          </div>
          <h2 className="text-xl font-bold font-poppins text-primary">Buat Akun Baru</h2>
          <p className="text-muted text-xs font-poppins font-light mt-1.5">Daftar sekarang gratis untuk mulai mengontrol kebiasaan digitalmu.</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-bold text-muted uppercase tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="username"
                type="text"
                placeholder="Nama Lengkap Anda"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-muted uppercase tracking-wider">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-muted uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-sm font-light text-primary font-poppins"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms & Conditions checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input id="terms" type="checkbox" required className="mt-0.5 rounded border-border text-secondary focus:ring-secondary cursor-pointer animate-[pulse_2s_infinite]" />
            <label htmlFor="terms" className="text-[11px] text-muted font-poppins leading-relaxed font-light cursor-pointer select-none">
              Saya menyetujui <span className="font-semibold text-secondary hover:underline">Syarat & Ketentuan</span> serta{" "}
              <span className="font-semibold text-secondary hover:underline">Kebijakan Privasi</span> FomoTracker.
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-secondary transition-all font-semibold shadow-sm text-sm cursor-pointer font-poppins mt-3">
            Daftar Akun
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted font-poppins font-light mt-6">
          Sudah memiliki akun?{" "}
          <Link href="/auth/login" className="text-secondary font-semibold hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
