"use client";

import { useState } from "react";
import { ArrowRight, BarChart2, Bell, Cpu, Smartphone } from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col text-primary">
      {/* Floating Navbar */}
      <div className="sticky top-4 z-50 w-full px-4 sm:px-6">
        <header className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md shadow-primary/5 p-4 md:py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Responsive Logo */}
            <div className="flex items-baseline gap-0.5 sm:gap-1 select-none">
              <span className="font-yellowtail text-3xl sm:text-4xl font-normal text-primary leading-none">
                Fomo
              </span>
              <span className="font-poppins text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase leading-none">
                Tracker
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="hover:text-secondary transition-colors">
                Fitur
              </a>
              <a href="#palette" className="hover:text-secondary transition-colors">
                Palet Warna
              </a>
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden md:flex items-center">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition-all shadow-sm cursor-pointer"
              >
                Masuk
              </button>
            </div>

            {/* Mobile Hamburger Button with Animation */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col justify-center items-center w-8 h-8 rounded-lg text-primary hover:bg-muted-light focus:outline-none transition-all relative cursor-pointer"
                aria-label="Toggle menu"
              >
                <span
                  className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "rotate-45" : "-translate-y-1.5"
                  }`}
                />
                <span
                  className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "-rotate-45" : "translate-y-1.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-64 opacity-100 mt-4 border-t border-border pt-4"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col gap-3 pb-2">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium hover:text-secondary transition-colors px-2 py-2 rounded-lg hover:bg-muted-light"
              >
                Fitur
              </a>
              <a
                href="#palette"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium hover:text-secondary transition-colors px-2 py-2 rounded-lg hover:bg-muted-light"
              >
                Palet Warna
              </a>
              <button
                type="button"
                className="w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition-all shadow-sm cursor-pointer mt-2"
              >
                Masuk
              </button>
            </nav>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="container mx-auto px-6 max-w-5xl text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent/30 text-secondary border border-accent/60 mb-8">
            <Bell className="w-3.5 h-3.5" /> Hadapi FOMO & Kendalikan Waktu Anda
          </span>

          {/* Responsive Logo Fomo Tracker Besar menggantikan Title */}
          <div className="flex flex-row items-baseline justify-center gap-1 sm:gap-2 mb-8 select-none max-w-full overflow-hidden">
            <span className="font-yellowtail text-6xl sm:text-8xl md:text-9xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-[10px] sm:text-xs md:text-sm lg:text-base font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </div>

          <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
            FomoTracker menganalisis screen time, kebiasaan digital, dan
            aktivitas Android Anda menggunakan AI untuk memberikan wawasan
            mendalam agar Anda tetap produktif.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white hover:bg-secondary font-semibold transition-all shadow-md group cursor-pointer"
            >
              Mulai Uji Coba Gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border bg-card hover:bg-muted-light font-semibold transition-all cursor-pointer"
            >
              Hubungkan Android
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Kenapa Memilih FomoTracker?</h2>
            <p className="text-muted font-light">
              Didesain dengan pendekatan visual premium untuk membantu Anda
              mencapai keseimbangan hidup digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-accent hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:bg-accent group-hover:text-primary transition-all">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Android Usage Stats</h3>
              <p className="text-muted text-sm leading-relaxed font-light">
                Sinkronisasi data langsung menggunakan API bawaan Android untuk
                pelacakan screen time yang akurat dan hemat daya.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-accent hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:bg-accent group-hover:text-primary transition-all">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rekomendasi Berbasis AI</h3>
              <p className="text-muted text-sm leading-relaxed font-light">
                Dapatkan insight personal dari AI yang mengenali kebiasaan buruk
                Anda dan memberikan saran alternatif yang menyehatkan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-border bg-background/50 hover:border-accent hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:bg-accent group-hover:text-primary transition-all">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visualisasi Data Cantik</h3>
              <p className="text-muted text-sm leading-relaxed font-light">
                Gunakan diagram interaktif Recharts untuk melihat kemajuan harian
                Anda dengan visual yang memanjakan mata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Palette Showcase Section */}
      <section id="palette" className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-2 text-center">
              Color Palette & Typography Showcase
            </h3>
            <p className="text-muted text-center mb-8 font-light">
              Variabel style yang telah diatur dan siap digunakan di seluruh
              proyek.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-background border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-primary mb-3 shadow-inner border border-black/10" />
                <span className="font-semibold text-sm">Primary</span>
                <code className="text-xs text-muted mt-1">#062743</code>
                <span className="text-[10px] text-muted-light bg-secondary px-1.5 py-0.5 rounded mt-1">
                  --primary
                </span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-background border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mb-3 shadow-inner border border-black/10" />
                <span className="font-semibold text-sm">Secondary</span>
                <code className="text-xs text-muted mt-1">#113A5D</code>
                <span className="text-[10px] text-muted-light bg-secondary px-1.5 py-0.5 rounded mt-1">
                  --secondary
                </span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-background border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-accent mb-3 shadow-inner border border-black/10" />
                <span className="font-semibold text-sm">Accent</span>
                <code className="text-xs text-muted mt-1">#C4FFDD</code>
                <span className="text-[10px] text-primary bg-accent px-1.5 py-0.5 rounded mt-1">
                  --accent
                </span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-background border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-background mb-3 shadow-inner border border-black/10" />
                <span className="font-semibold text-sm">Background</span>
                <code className="text-xs text-muted mt-1">#F9F9F9</code>
                <span className="text-[10px] text-muted-light bg-secondary px-1.5 py-0.5 rounded mt-1">
                  --background
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h4 className="font-semibold text-lg mb-4 text-center">
                Contoh Penggunaan Font & Aksen
              </h4>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-background border border-border">
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2 font-poppins">
                    Heading & Body (Poppins)
                  </span>
                  <h4 className="text-2xl font-bold font-poppins mb-2">
                    Ini adalah Heading Poppins
                  </h4>
                  <p className="text-sm font-poppins text-muted leading-relaxed font-light">
                    Ini adalah paragraf body teks menggunakan font Poppins.
                    Menggunakan weight 300 (light) dan 400 (normal) untuk tampilan
                    yang bersih dan mudah dibaca pada device apa saja.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-background border border-border">
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2 font-poppins">
                    Aksen Judul / Brand (Yellowtail & Poppins)
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-0.5 sm:gap-1 select-none">
                      <span className="font-yellowtail text-3xl sm:text-4xl font-normal text-primary leading-none">
                        Fomo
                      </span>
                      <span className="font-poppins text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase leading-none">
                        Tracker
                      </span>
                    </div>
                    <p className="text-xs text-muted italic font-poppins mt-2">
                      Digunakan untuk logo utama ("Fomo" menggunakan font Yellowtail warna primary, sejajar dengan "Tracker" menggunakan font Poppins warna primary).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card py-8 text-center text-xs text-muted">
        <div className="container mx-auto px-6">
          <p className="font-poppins">
            © {new Date().getFullYear()} FomoTracker. Dibuat dengan cinta menggunakan
            Next.js & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
