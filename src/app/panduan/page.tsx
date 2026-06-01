"use client";

import {
  AlertTriangle,
  AppWindow,
  BarChart,
  Bell,
  BookOpen,
  Brain,
  CheckSquare,
  ChevronDown,
  Clock,
  Eye,
  Gauge,
  Key,
  Laptop,
  ShieldAlert,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

// Types for FAQ
interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Apakah FomoTracker membaca isi chat saya?",
    answer:
      "Tidak. FomoTracker menghormati privasi penuh Anda. Sistem kami hanya mencatat waktu aktif pemakaian aplikasi (Usage Stats) dan riwayat url web media sosial, tanpa pernah membaca pesan pribadi, isi chat, password, ataupun informasi sensitif lainnya.",
  },
  {
    question: "Data saya disimpan di mana?",
    answer:
      "Seluruh data pelacakan Anda disimpan dengan aman pada database PostgreSQL terenkripsi yang di-host di platform Supabase. Data ini sepenuhnya bersifat privat dan hanya dapat diakses oleh Anda sendiri.",
  },
  {
    question: "Apakah FomoTracker gratis?",
    answer:
      "Ya, FomoTracker 100% gratis dan bersifat nirlaba. Proyek ini dibangun sebagai instrumen kesejahteraan digital berbasis open-source untuk dampak sosial.",
  },
  {
    question: "Apa bedanya aplikasi mobile dan ekstensi browser?",
    answer:
      "Aplikasi mobile (Android) mendeteksi pemakaian media sosial langsung di smartphone Anda menggunakan Usage Stats API bawaan Android. Sementara ekstensi browser melacak kunjungan situs media sosial saat Anda berselancar di browser komputer/laptop.",
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
            <BookOpen className="w-3.5 h-3.5" /> Pusat Panduan
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-poppins tracking-tight mb-4">
            Pusat Panduan FomoTracker
          </h1>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto font-poppins font-light leading-relaxed">
            Panduan lengkap memahami dan mengonfigurasi FomoTracker untuk
            mencapai kesehatan digital dan produktivitas optimal.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto px-6 max-w-6xl py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 hidden md:block">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-bold text-muted uppercase tracking-wider px-3 mb-3">
                Daftar Isi
              </p>
              {[
                { id: "membuat-akun", name: "1. Membuat Akun" },
                { id: "install-android", name: "2. Instalasi Android App" },
                { id: "install-extension", name: "3. Instalasi Browser Ext" },
                { id: "setup-awal", name: "4. Setup Awal" },
                { id: "memahami-dashboard", name: "5. Memahami Dashboard" },
                { id: "behavioral-score", name: "6. Behavioral Score" },
                { id: "risk-level", name: "7. Memahami Risk Level" },
                { id: "ai-insight", name: "8. Memahami AI Insight" },
                { id: "faq", name: "9. FAQ" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-xs font-semibold py-2 px-3 rounded-xl hover:bg-muted-light text-muted hover:text-primary transition-all font-poppins truncate"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </aside>

          {/* Content Sections */}
          <main className="md:col-span-3 space-y-16">
            {/* Step 1: Membuat Akun */}
            <section id="membuat-akun" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  01
                </span>
                Membuat Akun
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Langkah pertama adalah membuat akun FomoTracker di web. Silakan
                buka halaman{" "}
                <a
                  href="/auth/register"
                  className="text-secondary font-semibold hover:underline"
                >
                  Registrasi
                </a>
                , masukkan nama lengkap, email, password, dan konfirmasi
                password. Anda juga dapat mendaftar secara praktis menggunakan
                tombol **Google OAuth** untuk integrasi akun yang lebih mudah.
              </p>
            </section>

            {/* Step 2: Instalasi Android App */}
            <section id="install-android" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  02
                </span>
                Instalasi Android App
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Untuk melacak screen time dan aktivitas mobile:
              </p>
              <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold font-poppins">
                    Langkah Instalasi Android:
                  </h4>
                </div>
                <ul className="list-decimal pl-5 text-xs text-muted font-poppins font-light space-y-1">
                  <li>
                    Unduh berkas APK resmi FomoTracker melalui tautan unduh di
                    halaman utama.
                  </li>
                  <li>
                    Buka berkas di ponsel Anda dan izinkan instalasi dari sumber
                    tidak dikenal.
                  </li>
                  <li>
                    Setelah terpasang, buka aplikasi dan masuk dengan akun
                    FomoTracker Anda.
                  </li>
                  <li>
                    <strong>Sangat Penting:</strong> Izinkan izin akses **Usage
                    Stats API** saat diminta oleh sistem agar aplikasi dapat
                    membaca durasi penggunaan aplikasi media sosial secara
                    otomatis.
                  </li>
                </ul>
              </div>
            </section>

            {/* Step 3: Instalasi Browser Extension */}
            <section id="install-extension" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  03
                </span>
                Instalasi Browser Extension
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Guna memantau aktivitas berselancar media sosial dari perangkat
                desktop/laptop:
              </p>
              <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-500" />
                  <h4 className="text-xs font-bold font-poppins">
                    Langkah Instalasi Ekstensi:
                  </h4>
                </div>
                <ul className="list-decimal pl-5 text-xs text-muted font-poppins font-light space-y-1">
                  <li>
                    Buka Chrome Web Store dan cari ekstensi **FomoTracker**.
                  </li>
                  <li>
                    Klik **Add to Chrome** untuk memasang ekstensi pada browser
                    Anda.
                  </li>
                  <li>
                    Klik ikon ekstensi di pojok kanan atas, masuk menggunakan
                    akun Anda.
                  </li>
                  <li>
                    Ekstensi secara otomatis akan mencatat durasi kunjungan tab
                    ke situs media sosial seperti Instagram, TikTok, YouTube,
                    dan Facebook.
                  </li>
                </ul>
              </div>
            </section>

            {/* Step 4: Setup Awal */}
            <section id="setup-awal" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  04
                </span>
                Setup Awal (Onboarding)
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Setelah masuk pertama kali, sistem akan mengarahkan Anda ke alur
                **Onboarding** 4 langkah untuk konfigurasi awal:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted font-poppins font-light space-y-2">
                <li>
                  <strong>Jam Produktif:</strong> Rentang waktu kerja/fokus
                  belajar (misal 08:00 – 17:00). Digunakan untuk melacak
                  distraksi.
                </li>
                <li>
                  <strong>Jam Malam:</strong> Rentang waktu tidur malam (misal
                  22:00 – 06:00). Digunakan untuk mendeteksi scroll tengah malam
                  yang mengganggu kualitas istirahat.
                </li>
                <li>
                  <strong>Aplikasi Dipantau:</strong> Centang media sosial yang
                  ingin Anda batasi atau awasi.
                </li>
                <li>
                  <strong>Target Peringatan:</strong> Tentukan toggle notifikasi
                  yang ingin Anda aktifkan.
                </li>
              </ul>
            </section>

            {/* Step 5: Memahami Dashboard */}
            <section id="memahami-dashboard" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  05
                </span>
                Memahami Dashboard
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Halaman Dashboard utama menyajikan kondisi kesejahteraan digital
                Anda hari ini secara instan:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted font-poppins font-light space-y-1">
                <li>
                  <strong>Screen Time Hari Ini:</strong> Total waktu aktif
                  bermain media sosial.
                </li>
                <li>
                  <strong>Most Used App:</strong> Aplikasi dengan durasi
                  terpanjang.
                </li>
                <li>
                  <strong>Active Behavioral Flags:</strong> Indikator kebiasaan
                  buruk yang terdeteksi aktif hari ini.
                </li>
                <li>
                  <strong>AI Insight Snippet:</strong> Rangkuman observasi
                  instan dari asisten kecerdasan buatan.
                </li>
              </ul>
            </section>

            {/* Step 6: Memahami Behavioral Score */}
            <section id="behavioral-score" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  06
                </span>
                Memahami Behavioral Score
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                **Behavioral Score (0 – 100)** adalah indikator kualitas
                perilaku digital Anda. Semakin rendah skor Anda, semakin sehat
                dan produktif aktivitas digital Anda. Sebaliknya, skor mendekati
                100 menandakan kebiasaan digital yang sangat berisiko.
              </p>
              <div className="p-4 rounded-xl border border-border bg-muted-light/20 text-xs text-muted font-poppins font-light leading-relaxed">
                Skor dihitung secara real-time dari kombinasi 5 parameter utama:
                **Usage Duration** (total durasi), **Open Frequency** (frekuensi
                buka), **Midnight Usage** (penggunaan jam tidur), **Continuous
                Usage** (penggunaan nonstop), dan **Productive Hour Usage**
                (distraksi jam produktif).
              </div>
            </section>

            {/* Step 7: Memahami Risk Level */}
            <section id="risk-level" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  07
                </span>
                Memahami Risk Level
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Tingkat risiko ketergantungan media sosial Anda diklasifikasikan
                berdasarkan Behavioral Score:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 text-center">
                  <span className="text-xs font-bold text-emerald-800">
                    LOW RISK (Rendah)
                  </span>
                  <p className="text-[10px] text-muted font-light mt-1">
                    Skor: 0 – 39
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 text-center">
                  <span className="text-xs font-bold text-amber-800">
                    MODERATE RISK (Sedang)
                  </span>
                  <p className="text-[10px] text-muted font-light mt-1">
                    Skor: 40 – 69
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-red-100 bg-red-50/20 text-center">
                  <span className="text-xs font-bold text-red-800">
                    HIGH RISK (Tinggi)
                  </span>
                  <p className="text-[10px] text-muted font-light mt-1">
                    Skor: 70 – 100
                  </p>
                </div>
              </div>
            </section>

            {/* Step 8: Memahami AI Insight */}
            <section id="ai-insight" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  08
                </span>
                Memahami AI Insight
              </h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                FomoTracker AI Insight Engine melakukan analisis mendalam
                terhadap tren penggunaan Anda:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted font-poppins font-light space-y-2">
                <li>
                  <strong>Pengguna Baru (&lt; 7 Hari):</strong> Karena data yang
                  terkumpul belum mencukupi untuk memetakan tren jangka panjang,
                  sistem akan menampilkan observasi awal dan banner informasi
                  bahwa data sedang dipelajari.
                </li>
                <li>
                  <strong>Pengguna Lama (&ge; 7 Hari):</strong> Setelah 7 hari
                  data terkumpul, AI akan menghasilkan rekomendasi mingguan
                  terstruktur, refleksi kebiasaan buruk, dan perbandingan
                  performa digital secara presisi.
                </li>
              </ul>
            </section>

            {/* Step 9: FAQ */}
            <section id="faq" className="scroll-mt-24 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold font-poppins border-b border-border pb-3 flex items-center gap-2">
                <span className="text-secondary font-yellowtail text-3xl font-normal leading-none">
                  09
                </span>
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
                        className={`w-5 h-5 text-muted transition-transform duration-300 shrink-0 ${activeFaq === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? "max-h-40 border-t border-border/50 p-5 bg-background/30" : "max-h-0"}`}
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
