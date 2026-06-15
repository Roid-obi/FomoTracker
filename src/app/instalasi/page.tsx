// biome-ignore-all lint: static
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Download,
  Globe,
  Maximize2,
  Smartphone,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Tab types
type TabType = "android" | "extension";

function InstallationPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("android");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Sync active tab with query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "android" || tabParam === "extension") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Open Lightbox
  const handleOpenZoom = (src: string) => {
    setZoomImage(src);
    setZoomScale(1);
  };

  // Close Lightbox
  const handleCloseZoom = () => {
    setZoomImage(null);
    setZoomScale(1);
  };

  // Zoom controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(1);
  };

  // Guide Steps - Chrome Extension
  const extensionSteps = [
    {
      step: 1,
      title: "Download File Ekstensi",
      desc: "Unduh terlebih dahulu file ZIP ekstensi FomoTracker yang telah disediakan.\n\nSetelah selesai diunduh, ekstrak (unzip) file tersebut ke folder yang mudah Anda temukan di komputer Anda (misalnya di folder Downloads atau Documents).",
    },
    {
      step: 2,
      title: "Masuk ke Menu Extension Chrome",
      desc: "Buka browser Google Chrome Anda.\n\nMasuk ke halaman ekstensi dengan mengetik chrome://extensions/ pada kolom alamat (address bar) lalu tekan Enter, atau klik ikon teka-teki/titik tiga di pojok kanan atas lalu pilih Extensions > Manage Extensions.",
    },
    {
      step: 3,
      title: "Aktifkan Developer Mode",
      desc: "Perhatikan pojok kanan atas halaman ekstensi Anda.\n\nGeser tombol sakelar (toggle) pada bagian Developer mode hingga menjadi aktif (berwarna biru).",
    },
    {
      step: 4,
      title: "Klik Load Unpacked",
      desc: "Setelah Developer Mode aktif, menu baru akan muncul di pojok kiri atas halaman.\n\nKlik tombol Load unpacked.",
    },
    {
      step: 5,
      title: "Pilih Folder Ekstensi",
      desc: "Jendela penjelajah file (File Explorer) akan terbuka.\n\nCari dan pilih folder hasil ekstrak zip yang sudah Anda siapkan di Langkah 1 (pastikan memilih folder utama ekstensi, contoh pada gambar: fomotracker_extension).\n\nKlik tombol Select Folder.",
    },
    {
      step: 6,
      title: "Ekstensi Berhasil Terinstal",
      desc: "Ekstensi FomoTracker versi 1.0.0 kini telah berhasil terpasang dan aktif di browser Chrome Anda.\n\nAnda siap menggunakannya untuk melacak waktu browsing Anda di situs web!",
    },
  ];

  // Guide Steps - Android
  const androidStepsPart1 = [
    {
      step: 1,
      title: "Mengunduh Aplikasi",
      desc: "Unduh file instalasi (file APK) aplikasi FomoTracker terlebih dahulu dari sumber resmi atau tautan yang telah disediakan ke perangkat Android Anda.",
    },
    {
      step: 2,
      title: "Memulai Instalasi",
      desc: 'Buka file APK yang telah diunduh. Ketika muncul pop-up konfirmasi "Do you want to install this app?", klik Install.',
    },
    {
      step: 3,
      title: "Menangani Peringatan Google Play Protect",
      desc: "Jika muncul jendela App scan recommended dari Google Play Protect, klik tanda panah kecil di sebelah tulisan More details.",
    },
    {
      step: 4,
      title: "Lewati Pemindaian",
      desc: "Setelah detail terbuka, klik pilihan Install without scanning untuk melanjutkan proses pemasangan aplikasi.",
    },
    {
      step: 5,
      title: "Aplikasi Berhasil Terinstal",
      desc: "Tunggu beberapa saat hingga proses selesai. Ikon aplikasi FomoTracker akan muncul di menu utama ponsel Anda.",
    },
  ];

  const androidStepsPart2 = [
    {
      step: 6,
      title: "Buka Pengaturan Ponsel",
      desc: "Masuk ke menu Settings (Pengaturan) ponsel Anda, lalu gulir ke bawah dan pilih App Management (Manajemen Aplikasi).",
    },
    {
      step: 7,
      title: "Masuk ke Daftar Aplikasi",
      desc: "Di dalam menu App Management, pilih opsi App List (Daftar Aplikasi).",
    },
    {
      step: 8,
      title: "Cari Fomo Tracker",
      desc: 'Gunakan kolom pencarian di bagian atas, ketik "fomo", lalu klik aplikasi Fomo Tracker yang muncul.',
    },
    {
      step: 9,
      title: "Buka Menu Rahasia (Titik Tiga)",
      desc: "Pada halaman informasi aplikasi Fomo Tracker, klik ikon titik tiga yang berada di pojok kanan atas layar.",
    },
    {
      step: 10,
      title: "Izinkan Pengaturan Terbatas",
      desc: "Klik opsi Allow restricted settings (Izinkan pengaturan terbatas) yang muncul dari ikon titik tiga tersebut.",
    },
    {
      step: 11,
      title: "Masuk ke Menu Akses Penggunaan",
      desc: "Kembali ke halaman sebelumnya atau cari menu Usage Access (Akses Penggunaan) di pengaturan ponsel Anda, lalu temukan dan klik Fomo Tracker (yang saat itu statusnya masih Not allowed).",
    },
    {
      step: 12,
      title: "Aktifkan Izin Akses",
      desc: "Aktifkan tombol sakelar (toggle) pada bagian Permit usage access hingga berwarna aktif.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden">
      {/* Hero Header - Matched with Tentang Page style */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border bg-card">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-border mb-4 font-poppins">
            <Download className="w-3.5 h-3.5 text-secondary" /> Pusat Unduhan &
            Panduan
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-poppins tracking-tight mb-4">
            Instalasi & Panduan Pemasangan
          </h1>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto font-poppins font-light leading-relaxed">
            Ikuti panduan langkah demi langkah di bawah ini untuk memasang
            aplikasi FomoTracker pada perangkat Android atau memasang ekstensi
            pemantau di Google Chrome Anda.
          </p>
        </div>
      </section>

      {/* Main Content - Matched structure with Tentang Page */}
      <main className="container mx-auto px-6 max-w-4xl py-16 space-y-20">
        {/* Tabs switcher Navigation */}
        <div className="flex flex-col sm:flex-row justify-center p-2 rounded-3xl sm:rounded-2xl bg-card border border-border max-w-md mx-auto relative z-10 shadow-xs gap-2 sm:gap-0">
          {/* Android Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`w-full sm:flex-1 py-3.5 rounded-2xl sm:rounded-xl font-semibold text-sm transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
              activeTab === "android"
                ? "text-white"
                : "text-muted hover:text-primary"
            }`}
          >
            {activeTab === "android" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-2xl sm:rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Smartphone className="w-4 h-4" />
            Aplikasi Android
          </button>

          {/* Extension Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab("extension")}
            className={`w-full sm:flex-1 py-3.5 rounded-2xl sm:rounded-xl font-semibold text-sm transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
              activeTab === "extension"
                ? "text-white"
                : "text-muted hover:text-primary"
            }`}
          >
            {activeTab === "extension" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-2xl sm:rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Globe className="w-4 h-4" />
            Ekstensi Browser
          </button>
        </div>

        {/* Dynamic Content Switching */}
        <AnimatePresence mode="wait">
          {activeTab === "android" ? (
            <motion.div
              key="android-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-20"
            >
              {/* Android Download Card - Matched with Tentang page "Latar Belakang" style, Button placed at bottom */}
              <section className="p-8 md:p-10 rounded-3xl border border-border bg-card relative overflow-hidden flex flex-col items-start shadow-xs">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-6 shrink-0">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="w-full space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold font-poppins text-primary">
                    FomoTracker untuk Android
                  </h2>
                  <p className="text-muted text-sm font-poppins font-light leading-relaxed max-w-2xl">
                    Memonitor dan membatasi waktu penggunaan aplikasi sosial
                    langsung di ponsel Anda menggunakan Android Usage Stats API.
                    Unduh berkas APK di bawah ini dan ikuti langkah-langkah
                    panduan.
                  </p>
                  <div className="pt-2">
                    <a
                      href="/FomoTracker.apk"
                      download="FomoTracker.apk"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-all shadow-md shadow-emerald-600/15 group cursor-pointer font-poppins text-sm w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      Unduh APK Android
                    </a>
                  </div>
                </div>
              </section>

              {/* Large Zoomable Image Section */}
              <section className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-bold font-poppins text-primary">
                    Panduan Gambar Pemasangan & Perizinan
                  </h3>
                  <p className="text-muted text-xs md:text-sm font-poppins font-light mt-1">
                    Klik gambar di bawah ini untuk memperbesar dan membaca
                    detail teks petunjuk.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleOpenZoom("/instalasi-aplikasi-fomotracker.png")
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleOpenZoom("/instalasi-aplikasi-fomotracker.png")
                  }
                  tabIndex={0}
                  role="button"
                  className="relative group cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card p-6 flex justify-center items-center shadow-xs max-w-2xl mx-auto hover:border-primary/20 transition-colors"
                >
                  <img
                    src="/instalasi-aplikasi-fomotracker.png"
                    alt="Langkah Pemasangan Android"
                    className="rounded-2xl max-h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/95 text-primary text-xs font-semibold rounded-full shadow-md">
                      <ZoomIn className="w-4 h-4" /> Klik Untuk Zoom
                    </span>
                  </div>
                </div>
              </section>

              {/* Guide Steps - Highly Responsive with Flex layouts and increased gaps */}
              <section className="space-y-16">
                {/* Part 1: Installation */}
                <div className="space-y-8">
                  <h3 className="text-lg md:text-xl font-bold font-poppins text-primary mb-6 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Bagian 1: Proses Instalasi Aplikasi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {androidStepsPart1.map((item) => (
                      <div
                        key={item.step}
                        className="p-6 md:p-8 rounded-3xl border border-border bg-card/40 hover:shadow-md hover:border-primary/10 transition-all flex flex-col sm:flex-row gap-5 items-start"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold font-poppins text-sm">
                          {item.step}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-primary font-poppins leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-muted text-xs md:text-sm font-poppins font-light leading-relaxed whitespace-pre-line">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part 2: Permissions */}
                <div className="space-y-8 pt-4">
                  {/* Important Notice */}
                  <div className="p-6 md:p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row gap-5 items-start">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-amber-800 dark:text-amber-500 font-poppins mb-1.5">
                        Penting: Izin Akses Android 13+
                      </h4>
                      <p className="text-muted text-xs md:text-sm font-poppins font-light leading-relaxed">
                        Sistem operasi Android mendeteksi file instalasi luar
                        Play Store sebagai aplikasi berpotensi terbatas. Ikuti
                        langkah 6 hingga 12 di bawah ini secara seksama untuk
                        mengizinkan Restricted Settings serta Usage Access di HP
                        Android Anda.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold font-poppins text-primary mb-6 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Bagian 2: Pengaturan Perizinan Akses (Restricted Settings &
                    Usage Access)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {androidStepsPart2.map((item) => (
                      <div
                        key={item.step}
                        className="p-6 md:p-8 rounded-3xl border border-border bg-card/40 hover:shadow-md hover:border-primary/10 transition-all flex flex-col sm:flex-row gap-5 items-start"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold font-poppins text-sm">
                          {item.step}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-primary font-poppins leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-muted text-xs md:text-sm font-poppins font-light leading-relaxed whitespace-pre-line">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion Note */}
                <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 max-w-xl mx-auto text-center shadow-2xs">
                  <p className="text-xs md:text-sm font-semibold text-emerald-600 font-poppins leading-relaxed">
                    💡 Selesai! Aplikasi FomoTracker sekarang sudah terinstal
                    sepenuhnya dan memiliki izin yang diperlukan untuk memonitor
                    waktu penggunaan aplikasi di ponsel Anda.
                  </p>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="extension-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-20"
            >
              {/* Extension Download Card - Matched with Tentang page "Latar Belakang" style, Button placed at bottom */}
              <section className="p-8 md:p-10 rounded-3xl border border-border bg-card relative overflow-hidden flex flex-col items-start shadow-xs">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-bl-full pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center mb-6 shrink-0">
                  <Globe className="w-8 h-8" />
                </div>
                <div className="w-full space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold font-poppins text-primary">
                    FomoTracker Chrome Extension
                  </h2>
                  <p className="text-muted text-sm font-poppins font-light leading-relaxed max-w-2xl">
                    Mencatat durasi penjelajahan media sosial langsung dari
                    peramban web Google Chrome secara otomatis tanpa instalasi
                    program eksternal tambahan. Unduh paket ekstensi di bawah
                    ini.
                  </p>
                  <div className="pt-2">
                    <a
                      href="/fomotracker_extension.zip"
                      download="fomotracker_extension.zip"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 font-semibold transition-all shadow-md shadow-sky-600/15 group cursor-pointer font-poppins text-sm w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      Unduh Ekstensi ZIP
                    </a>
                  </div>
                </div>
              </section>

              {/* Large Zoomable Image Section */}
              <section className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-bold font-poppins text-primary">
                    Panduan Gambar Pemasangan Ekstensi
                  </h3>
                  <p className="text-muted text-xs md:text-sm font-poppins font-light mt-1">
                    Klik gambar di bawah ini untuk memperbesar dan membaca
                    detail teks petunjuk.
                  </p>
                </div>
                <div
                  onClick={() => handleOpenZoom("/cara-pasang-extensi.jpeg")}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleOpenZoom("/cara-pasang-extensi.jpeg")
                  }
                  tabIndex={0}
                  role="button"
                  className="relative group cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card p-6 flex justify-center items-center shadow-xs max-w-2xl mx-auto hover:border-primary/20 transition-colors"
                >
                  <img
                    src="/cara-pasang-extensi.jpeg"
                    alt="Langkah Pemasangan Chrome Extension"
                    className="rounded-2xl max-h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/95 text-primary text-xs font-semibold rounded-full shadow-md">
                      <ZoomIn className="w-4 h-4" /> Klik Untuk Zoom
                    </span>
                  </div>
                </div>
              </section>

              {/* Guide Steps - Chrome Extension */}
              <section className="space-y-8">
                <h3 className="text-lg md:text-xl font-bold font-poppins text-primary mb-6 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  Panduan Instalasi Ekstensi FomoTracker di Google Chrome
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {extensionSteps.map((item) => (
                    <div
                      key={item.step}
                      className="p-6 md:p-8 rounded-3xl border border-border bg-card/45 hover:shadow-md hover:border-primary/10 transition-all flex flex-col sm:flex-row gap-5 items-start"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 font-bold font-poppins text-sm">
                        {item.step}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-bold text-primary font-poppins leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-muted text-xs md:text-sm font-poppins font-light leading-relaxed whitespace-pre-line">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Lightbox Modal / Click to Zoom Component */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseZoom}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center p-4 cursor-zoom-out select-none"
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.75}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Reset Zoom Button */}
              <button
                type="button"
                onClick={handleResetZoom}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 3}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-6 bg-white/20 mx-1" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseZoom}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Scale Indicator */}
            <div className="absolute bottom-6 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 text-white text-xs font-semibold z-50 tracking-wider">
              {Math.round(zoomScale * 100)}% Zoom
            </div>

            {/* Zoomable Image Container */}
            <div
              className="w-full h-full flex justify-center items-center overflow-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: zoomScale }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative flex justify-center items-center max-w-full max-h-full"
              >
                <img
                  src={zoomImage}
                  alt="Detail Gambar Panduan yang diperbesar"
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle scale between 1 and 2
                    setZoomScale((prev) => (prev === 1 ? 2 : 1));
                  }}
                  title="Klik dua kali untuk beralih zoom 100% / 200%"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstallationLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-poppins">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-muted font-light">
        Memuat Panduan Instalasi...
      </p>
    </div>
  );
}

export default function InstallationPage() {
  return (
    <Suspense fallback={<InstallationLoading />}>
      <InstallationPageContent />
    </Suspense>
  );
}
