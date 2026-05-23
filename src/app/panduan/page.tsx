"use client";

import { useState } from "react";
import {
  UserPlus,
  Laptop,
  Smartphone,
  Key,
  AppWindow,
  Clock,
  Bell,
  Gauge,
  ShieldAlert,
  Brain,
  Eye,
  CheckSquare,
  AlertTriangle,
  BarChart,
  ChevronDown,
  BookOpen,
} from "lucide-react";

// Types for FAQ
interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Apakah FomoTracker membaca isi chat saya?",
    answer: "Tidak. FomoTracker menghormati privasi penuh Anda. Sistem kami hanya mencatat waktu aktif pemakaian aplikasi (Usage Stats) dan riwayat url web media sosial, tanpa pernah membaca pesan pribadi, isi chat, password, ataupun informasi sensitif lainnya.",
  },
  {
    question: "Data saya disimpan di mana?",
    answer: "Seluruh data pelacakan Anda disimpan dengan aman pada database PostgreSQL terenkripsi yang di-host di platform Supabase. Data ini sepenuhnya bersifat privat dan hanya dapat diakses oleh Anda sendiri.",
  },
  {
    question: "Apakah FomoTracker gratis?",
    answer: "Ya, FomoTracker 100% gratis dan bersifat nirlaba. Proyek ini dibangun sebagai instrumen kesejahteraan digital berbasis open-source untuk dampak sosial.",
  },
  {
    question: "Apa bedanya aplikasi mobile dan ekstensi browser?",
    answer: "Aplikasi mobile (Android) mendeteksi pemakaian media sosial langsung di smartphone Anda menggunakan Usage Stats API bawaan Android. Sementara ekstensi browser melacak kunjungan situs media sosial saat Anda berselancar di browser komputer/laptop.",
  },
];

export default function Panduan() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">

      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border bg-card">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-border mb-4 font-poppins">
            <BookOpen className="w-3.5 h-3.5" /> Pusat Bantuan
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-poppins tracking-tight mb-4">
            Cara Menggunakan FomoTracker
          </h1>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto font-poppins font-light leading-relaxed">
            Ikuti langkah berikut untuk memulai perjalanan digital wellbeing-mu dan membangun kendali penuh atas waktu berhargamu.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto px-6 max-w-5xl py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 hidden md:block">
            <div className="sticky top-24 space-y-2">
              <p className="text-xs font-bold text-muted uppercase tracking-wider px-3 mb-3">Daftar Isi</p>
              <a
                href="#persiapan"
                className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins"
              >
                1. Persiapan Awal
              </a>
              <a
                href="#onboarding"
                className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins"
              >
                2. Setup Onboarding
              </a>
              <a
                href="#dashboard"
                className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins"
              >
                3. Panduan Dashboard
              </a>
              <a
                href="#analytics"
                className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins"
              >
                4. Memahami Analytics
              </a>
              <a
                href="#faq"
                className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins"
              >
                5. Pertanyaan Umum (FAQ)
              </a>
            </div>
          </aside>

          {/* Content Sections */}
          <main className="md:col-span-3 space-y-16">
            {/* Bagian 1 — Persiapan Awal */}
            <section id="persiapan" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">01</span>
                Persiapan Awal
              </h2>

              <div className="space-y-6">
                {/* Step 1.1 */}
                <div className="p-6 rounded-2xl border border-border bg-card flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-poppins mb-1.5">1.1 Buat Akun FomoTracker</h3>
                    <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                      Kunjungi halaman pendaftaran di web, isi data diri yang diperlukan, dan verifikasi email Anda untuk mengaktifkan akun.
                    </p>
                  </div>
                </div>

                {/* Step 1.2 */}
                <div className="p-6 rounded-2xl border border-border bg-card flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h3 className="text-base font-bold font-poppins mb-1.5">1.2 Pilih Platform Tracking</h3>
                    <p className="text-muted text-sm leading-relaxed font-poppins font-light mb-4">
                      Pilih salah satu atau kedua platform di bawah ini sesuai perangkat Anda:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-xs font-bold font-poppins">Aplikasi Mobile (Android)</h4>
                        </div>
                        <p className="text-muted text-[11px] leading-relaxed font-poppins font-light">
                          Unduh file APK resmi, berikan izin akses "Usage Stats" di pengaturan Android agar screen time terdeteksi otomatis.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Laptop className="w-4 h-4 text-sky-500" />
                          <h4 className="text-xs font-bold font-poppins">Ekstensi Browser</h4>
                        </div>
                        <p className="text-muted text-[11px] leading-relaxed font-poppins font-light">
                          Pasang ekstensi dari Chrome Web Store dan izinkan akses tab untuk melacak kunjungan ke media sosial.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1.3 */}
                <div className="p-6 rounded-2xl border border-border bg-card flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-poppins mb-1.5">1.3 Hubungkan ke Akun</h3>
                    <p className="text-muted text-sm leading-relaxed font-poppins font-light">
                      Buka aplikasi Android atau ekstensi browser yang telah diinstall, kemudian masuk menggunakan akun FomoTracker Anda yang telah didaftarkan.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bagian 2 — Setup Awal */}
            <section id="onboarding" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">02</span>
                Setup Awal (Onboarding)
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-lg bg-accent/25 text-primary flex items-center justify-center mb-4">
                    <AppWindow className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-poppins mb-2">2.1 Pilih Aplikasi</h3>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Tentukan aplikasi media sosial mana saja yang ingin dipantau (seperti Instagram, TikTok, Twitter, dsb).
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-lg bg-accent/25 text-primary flex items-center justify-center mb-4">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-poppins mb-2">2.2 Atur Jam Kerja</h3>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Atur jam produktif harian Anda (misal: 08:00 - 17:00) agar notifikasi pembatasan aktif selama jam tersebut.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-lg bg-accent/25 text-primary flex items-center justify-center mb-4">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-poppins mb-2">2.3 Atur Notifikasi</h3>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Sesuaikan jenis peringatan/pemberitahuan yang akan dikirim saat screen time terdeteksi berlebihan.
                  </p>
                </div>
              </div>
            </section>

            {/* Bagian 3 — Menggunakan Dashboard */}
            <section id="dashboard" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">03</span>
                Menggunakan Dashboard
              </h2>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-border bg-card flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-poppins mb-1">3.1 Memahami Behavioral Score</h3>
                    <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                      Skor indikator produktivitas kamu (0 - 100). Semakin seimbang screen time media sosialmu selama jam produktif, semakin tinggi skor yang kamu raih.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-poppins mb-1">3.2 Membaca Risk Level</h3>
                    <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                      Indikasi tingkat risiko kecanduan media sosial Anda (Rendah, Sedang, Tinggi) yang dinilai dari frekuensi cek HP dan screen time.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-poppins mb-1">3.3 Membaca AI Insight</h3>
                    <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                      Rekomendasi dari asisten AI kami tentang alternatif aktivitas yang menyehatkan berdasarkan kebiasaan buruk Anda yang berhasil terdeteksi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bagian 4 — Memahami Analytics */}
            <section id="analytics" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">04</span>
                Memahami Analytics
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold font-poppins">4.1 Tab Overview</h3>
                  </div>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Melihat visualisasi durasi pemakaian (dalam menit/jam) seluruh media sosial dari hari ke hari dalam format grafik garis dan batang.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold font-poppins">4.2 Tab Behavior</h3>
                  </div>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Memahami pemicu pemakaian media sosial kamu seperti waktu-waktu tersering memegang HP (trigger hours).
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold font-poppins">4.3 Tab Risk</h3>
                  </div>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Analisis risiko kecanduan dengan instrumen Bergen Social Media Addiction Scale (BSMAS) guna pemantauan psikososial.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold font-poppins">4.4 Tab Weekly Report</h3>
                  </div>
                  <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                    Rangkuman perbandingan performa keseimbangan digital Anda minggu ini dibandingkan minggu lalu secara otomatis.
                  </p>
                </div>
              </div>
            </section>

            {/* Bagian 5 — FAQ Singkat */}
            <section id="faq" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">05</span>
                Pertanyaan Umum (FAQ)
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base font-poppins text-primary hover:bg-muted-light/40 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted transition-transform duration-300 shrink-0 ${
                          activeFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        activeFaq === index ? "max-h-40 border-t border-border/50 p-5 bg-background/30" : "max-h-0"
                      }`}
                    >
                      <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

    </div>
  );
}
