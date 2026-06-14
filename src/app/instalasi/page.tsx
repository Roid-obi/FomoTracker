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
    <div className="min-h-screen flex flex-col bg-background text-primary font-poppins relative overflow-hidden pb-16">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Header */}
      <section className="relative py-12 md:py-20 text-center border-b border-border bg-card/45 backdrop-blur-xs">
        <div className="container mx-auto px-6 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-border mb-4">
            <Download className="w-3.5 h-3.5" /> Pusat Unduhan & Instalasi
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-primary leading-tight">
            Instalasi & Panduan Pemasangan
          </h1>
          <p className="text-muted text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Ikuti panduan langkah demi langkah di bawah ini untuk memasang
            aplikasi FomoTracker pada perangkat Android atau memasang ekstensi
            pemantau di Google Chrome Anda.
          </p>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="container mx-auto px-6 max-w-4xl mt-10">
        <div className="flex justify-center p-1 rounded-2xl bg-card border border-border max-w-md mx-auto relative z-10">
          {/* Android Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
              activeTab === "android"
                ? "text-white animate-pulse-once"
                : "text-muted hover:text-primary"
            }`}
          >
            {activeTab === "android" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-xl -z-10"
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
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
              activeTab === "extension"
                ? "text-white animate-pulse-once"
                : "text-muted hover:text-primary"
            }`}
          >
            {activeTab === "extension" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Globe className="w-4 h-4" />
            Ekstensi Browser
          </button>
        </div>

        {/* Dynamic Content Switching */}
        <div className="mt-12">
          {activeTab === "android" ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Android Card Header */}
              <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-xs flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 animate-bounce-slow">
                      <Smartphone className="w-6 h-6" />
                    </span>
                    FomoTracker untuk Android
                  </h2>
                  <p className="text-muted text-xs md:text-sm font-light">
                    Memonitor dan membatasi waktu penggunaan aplikasi sosial
                    langsung di ponsel Anda.
                  </p>
                </div>
                <a
                  href="/FomoTracker.apk"
                  download="FomoTracker.apk"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-all shadow-md shadow-emerald-600/15 group cursor-pointer"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Unduh APK Android
                </a>
              </div>

              {/* Large Zoomable Image Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-primary">
                    Panduan Gambar Pemasangan & Perizinan
                  </h3>
                  <p className="text-muted text-xs font-light mt-1">
                    Klik gambar di bawah ini untuk memperbesar dan membaca lebih
                    detail.
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
                  className="relative group cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card p-4 flex justify-center items-center shadow-xs max-w-2xl mx-auto hover:border-primary/20 transition-colors"
                >
                  {/* Image with container */}
                  <img
                    src="/instalasi-aplikasi-fomotracker.png"
                    alt="Langkah Pemasangan Android"
                    className="rounded-2xl max-h-[350px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Overlay instructions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/95 text-primary text-xs font-semibold rounded-full shadow-md">
                      <ZoomIn className="w-4 h-4" /> Klik Untuk Zoom
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide Steps */}
              <div className="space-y-10">
                {/* Part 1: Installation */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Bagian 1: Proses Instalasi Aplikasi
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {androidStepsPart1.map((item) => (
                      <div
                        key={item.step}
                        className="p-6 rounded-2xl border border-border bg-card/45 hover:shadow-md hover:border-primary/10 transition-all flex gap-4 items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-primary mb-1.5">
                            {item.title}
                          </h4>
                          <p className="text-muted text-xs font-light leading-relaxed whitespace-pre-line">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part 2: Permissions */}
                <div className="pt-4">
                  <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-8 flex gap-4 items-start">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">
                        Penting: Izin Akses Android
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-600/90 font-light leading-relaxed">
                        Sistem operasi Android 13+ mendeteksi file APK di luar
                        Play Store sebagai aplikasi berpotensi terbatas. Ikuti
                        langkah 6 hingga 12 di bawah ini dengan cermat untuk
                        memberikan izin restricted settings dan usage access.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Bagian 2: Pengaturan Perizinan Akses (Restricted Settings &
                    Usage Access)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {androidStepsPart2.map((item) => (
                      <div
                        key={item.step}
                        className="p-6 rounded-2xl border border-border bg-card/45 hover:shadow-md hover:border-primary/10 transition-all flex gap-4 items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-primary mb-1.5">
                            {item.title}
                          </h4>
                          <p className="text-muted text-xs font-light leading-relaxed whitespace-pre-line">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion Note */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 max-w-xl mx-auto text-center">
                  <p className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-2">
                    <span>💡</span> Selesai! Aplikasi FomoTracker sekarang sudah
                    terinstal sepenuhnya dan memiliki izin yang diperlukan untuk
                    memonitor waktu penggunaan aplikasi di ponsel Anda.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Extension Card Header */}
              <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-xs flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                      <Globe className="w-6 h-6 animate-spin-slow" />
                    </span>
                    FomoTracker Chrome Extension
                  </h2>
                  <p className="text-muted text-xs md:text-sm font-light">
                    Mencatat waktu browsing Anda secara langsung melalui
                    ekstensi di browser Google Chrome komputer.
                  </p>
                </div>
                <a
                  href="/fomotracker_extension.zip"
                  download="fomotracker_extension.zip"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 font-semibold transition-all shadow-md shadow-sky-600/15 group cursor-pointer"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Unduh Ekstensi ZIP
                </a>
              </div>

              {/* Large Zoomable Image Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-primary">
                    Panduan Gambar Pemasangan Ekstensi
                  </h3>
                  <p className="text-muted text-xs font-light mt-1">
                    Klik gambar di bawah ini untuk memperbesar dan membaca lebih
                    detail.
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
                  className="relative group cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card p-4 flex justify-center items-center shadow-xs max-w-2xl mx-auto hover:border-primary/20 transition-colors"
                >
                  {/* Image with container */}
                  <img
                    src="/cara-pasang-extensi.jpeg"
                    alt="Langkah Pemasangan Chrome Extension"
                    className="rounded-2xl max-h-[350px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Overlay instructions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/95 text-primary text-xs font-semibold rounded-full shadow-md">
                      <ZoomIn className="w-4 h-4" /> Klik Untuk Zoom
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide Steps */}
              <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Panduan Instalasi Ekstensi FomoTracker di Google Chrome
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {extensionSteps.map((item) => (
                    <div
                      key={item.step}
                      className="p-6 rounded-2xl border border-border bg-card/45 hover:shadow-md hover:border-primary/10 transition-all flex gap-4 items-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary mb-1.5">
                          {item.title}
                        </h4>
                        <p className="text-muted text-xs font-light leading-relaxed whitespace-pre-line">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
