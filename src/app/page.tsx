"use client";
import { Capacitor } from "@capacitor/core";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Bell,
  BookOpen,
  Briefcase,
  Clock,
  Cpu,
  Download,
  Heart,
  Hourglass,
  Laptop,
  Moon,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();
  const [isNative, setIsNative] = useState(false);
  const [isNativeChecked, setIsNativeChecked] = useState(false);
  const isMobileTarget = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setIsNativeChecked(true);
  }, []);

  useEffect(() => {
    if (isMobileTarget || (isNativeChecked && isNative)) {
      if (!isLoading) {
        if (user) {
          router.replace("/dashboard");
        } else {
          router.replace("/auth/login");
        }
      }
    }
  }, [isNative, isNativeChecked, user, isLoading, router, isMobileTarget]);

  if (isMobileTarget || isNative) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-poppins">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-baseline gap-1 animate-pulse">
            <span className="font-yellowtail text-5xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-sm font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </div>
          <p className="text-[10px] text-muted font-light tracking-widest uppercase mt-2 opacity-60">
            Digital Wellbeing Assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Floating Decorative Elements (Desktop Only) */}
        {/* Widget 1: Screen Time */}
        <div className="hidden lg:flex items-center gap-3 absolute left-[6%] top-[20%] p-3.5 rounded-2xl border border-border bg-card/85 backdrop-blur-sm shadow-md animate-float-slow select-none">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left font-poppins">
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              Screen Time
            </p>
            <p className="text-xs font-bold text-primary">2j 45m Hari Ini</p>
          </div>
        </div>

        {/* Widget 2: AI Sparkles */}
        <div className="hidden lg:flex items-center gap-3 absolute right-[8%] top-[18%] p-3.5 rounded-2xl border border-border bg-card/85 backdrop-blur-sm shadow-md animate-float-medium select-none">
          <div className="w-9 h-9 rounded-xl bg-accent/30 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left font-poppins">
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              AI Insight
            </p>
            <p className="text-xs font-bold text-primary">Focus Mode Aktif</p>
          </div>
        </div>

        {/* Widget 3: Productivity */}
        <div className="hidden lg:flex items-center gap-3 absolute left-[8%] bottom-[15%] p-3.5 rounded-2xl border border-border bg-card/85 backdrop-blur-sm shadow-md animate-float-fast select-none">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-left font-poppins">
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              Habit Streak
            </p>
            <p className="text-xs font-bold text-primary">Produktivitas +18%</p>
          </div>
        </div>

        {/* Widget 4: Fomo Warning */}
        <div className="hidden lg:flex items-center gap-3 absolute right-[9%] bottom-[18%] p-3.5 rounded-2xl border border-border bg-card/85 backdrop-blur-sm shadow-md animate-float-slow select-none">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left font-poppins">
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              Batas Aplikasi
            </p>
            <p className="text-xs font-bold text-primary">Sosmed 10m Tersisa</p>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-4xl text-center flex flex-col items-center">
          {/* Logo brand Fomo Tracker Besar */}
          {/* <div className="flex flex-row items-baseline justify-center gap-1 sm:gap-2 mb-8 select-none max-w-full overflow-hidden">
            <span className="font-yellowtail text-6xl sm:text-8xl md:text-9xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-[10px] sm:text-xs md:text-sm lg:text-base font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </div> */}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.25] text-primary mb-6 font-poppins max-w-2xl">
            Pahami Kebiasaan Digitalmu Sebelum Ia Mengontrolmu.
          </h1>

          <p className="text-muted text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light font-poppins">
            FomoTracker membantu kamu memahami pola penggunaan media sosial dan
            membangun kebiasaan digital yang lebih sehat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white hover:bg-secondary font-semibold transition-all shadow-md group cursor-pointer font-poppins text-sm sm:text-base"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#problem"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border bg-card hover:bg-muted-light font-semibold transition-all cursor-pointer font-poppins text-sm sm:text-base text-primary/95"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins mb-4">
              Apakah ini Terasa Relatable Bagi Kamu?
            </h2>
            <p className="text-muted font-poppins font-light text-sm sm:text-base">
              Ketergantungan digital seringkali tidak disadari dan mempengaruhi
              kualitas kehidupan kita sehari-hari.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-primary/20 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Hourglass className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Tanpa Sadar Scroll Berjam-jam?
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                Membuka HP sebentar untuk cek sesuatu, tapi berakhir scroll
                tanpa tujuan selama berjam-jam.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-primary/20 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Susah Fokus Karena Notifikasi?
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                Kerjaan atau belajar terganggu setiap beberapa menit karena
                terdorong untuk mengecek notifikasi baru.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-primary/20 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Moon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Gangguan Tidur Larut Malam?
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                Kebiasaan scrolling media sosial sebelum tidur membuat jam
                istirahat terganggu dan lelah di pagi hari.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins mb-4">
              Solusi — Cara Kerja FomoTracker
            </h2>
            <p className="text-muted font-poppins font-light text-sm sm:text-base">
              Hanya dengan 3 langkah mudah untuk memulai perjalanan menuju
              kebiasaan digital yang lebih sehat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-primary/20">
                1
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Pasang & Hubungkan
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                Install aplikasi mobile atau ekstensi browser FomoTracker, lalu
                hubungkan ke akunmu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-primary/20">
                2
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Pantau Aktivitasmu
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                FomoTracker mendeteksi dan mencatat aktivitas media sosialmu
                secara otomatis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-primary/20">
                3
              </div>
              <h3 className="text-lg font-bold font-poppins mb-3">
                Dapatkan Insight
              </h3>
              <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                AI kami menganalisis polamu dan memberikan rekomendasi personal
                untuk kebiasaan digital yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan Section */}
      <section id="features" className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted font-poppins font-light text-sm sm:text-base">
              FomoTracker dilengkapi berbagai fitur cerdas untuk menunjang
              produktivitas dan digital wellbeing kamu.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-border bg-background/60 hover:shadow-sm transition-all flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-poppins mb-1.5">
                  Behavioral Analytics
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                  Analisis mendalam pola kebiasaan digitalmu melalui dashboard
                  interaktif terperinci.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-border bg-background/60 hover:shadow-sm transition-all flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-poppins mb-1.5">
                  AI Insight Personal
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                  Rekomendasi yang disesuaikan secara dinamis berbasis data asli
                  penggunaan HP kamu, bukan asumsi umum.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-border bg-background/60 hover:shadow-sm transition-all flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-poppins mb-1.5">
                  Risk Level Detection
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                  Deteksi dini potensi penggunaan media sosial berlebihan
                  menggunakan Bergen Social Media Addiction Scale.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-border bg-background/60 hover:shadow-sm transition-all flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-poppins mb-1.5">
                  Smart Notification
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                  Pengingat cerdas yang muncul otomatis saat pola pemakaianmu
                  mulai menyimpang dari target produktivitas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full font-poppins">
              Sangat Penting
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins mt-4 mb-4">
              Tersedia di 2 Platform
            </h2>
            <p className="text-muted font-poppins font-light text-sm sm:text-base">
              Pantau screen time-mu dari gadget manapun. Data tersinkronisasi
              secara otomatis dalam satu dashboard terpadu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Android */}
            <div className="p-8 rounded-3xl border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between items-start">
              <div className="w-full">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-poppins mb-2">
                  FomoTracker Mobile
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light mb-6">
                  Deteksi otomatis aktivitas media sosial langsung dari
                  perangkat Android-mu menggunakan Android Usage Stats API.
                </p>
              </div>
              <Link
                href="/instalasi?tab=android"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary font-semibold transition-all cursor-pointer font-poppins text-sm w-full sm:w-auto"
              >
                <Download className="w-4 h-4" /> Unduh Aplikasi
              </Link>
            </div>

            {/* Card 2: Browser Extension */}
            <div className="p-8 rounded-3xl border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between items-start">
              <div className="w-full">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-6">
                  <Laptop className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-poppins mb-2">
                  FomoTracker Extension
                </h3>
                <p className="text-muted text-sm leading-relaxed font-poppins font-light mb-6">
                  Pantau aktivitas media sosialmu langsung dari browser
                  laptop/komputer tanpa perlu menginstall aplikasi tambahan.
                </p>
              </div>
              <Link
                href="/instalasi?tab=extension"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary font-semibold transition-all cursor-pointer font-poppins text-sm w-full sm:w-auto"
              >
                <Download className="w-4 h-4" /> Pasang Ekstensi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SDGs Impact Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins mb-4">
              Kontribusi SDGs PBB
            </h2>
            <p className="text-muted font-poppins font-light text-sm sm:text-base">
              FomoTracker dirancang untuk membawa dampak nyata bagi pembangunan
              berkelanjutan global.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* SDG 3 */}
            <div className="p-6 rounded-2xl border border-border bg-background/50">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-poppins mb-2">
                SDG 3 — Kesehatan & Kesejahteraan
              </h4>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Membantu mencegah kecemasan, gangguan tidur, dan stres
                psikologis yang dipicu oleh FOMO dan kecanduan media sosial.
              </p>
            </div>

            {/* SDG 4 */}
            <div className="p-6 rounded-2xl border border-border bg-background/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-poppins mb-2">
                SDG 4 — Pendidikan Berkualitas
              </h4>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Meningkatkan fokus dan kemampuan berkonsentrasi pelajar dengan
                mengurangi distraksi gawai selama waktu belajar produktif.
              </p>
            </div>

            {/* SDG 8 */}
            <div className="p-6 rounded-2xl border border-border bg-background/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-poppins mb-2">
                SDG 8 — Pekerjaan & Pertumbuhan
              </h4>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Mendukung produktivitas tenaga kerja profesional melalui
                manajemen waktu kerja dan screen time yang lebih seimbang.
              </p>
            </div>
          </div>

          <div className="text-center p-4 rounded-xl border border-border/60 bg-muted-light max-w-md mx-auto">
            <p className="text-xs font-semibold text-primary font-poppins">
              💡 Catatan: FomoTracker adalah platform nirlaba untuk dampak
              sosial.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Penutup Section */}
      <section className="py-20 relative overflow-hidden bg-primary text-white text-center">
        <div className="absolute inset-0 bg-secondary/35 mix-blend-overlay pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-poppins tracking-tight mb-6">
            Mulai kenali kebiasaan digitalmu hari ini.
          </h2>
          <p className="text-white/80 max-w-xl mb-8 font-poppins font-light text-sm sm:text-base">
            Ambil kembali kendali atas fokus dan produktivitas hidupmu sekarang
            juga. Pendaftaran 100% gratis dan data kamu dijamin aman.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-primary hover:bg-white font-semibold transition-all shadow-lg font-poppins text-sm sm:text-base"
          >
            Daftar Gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
