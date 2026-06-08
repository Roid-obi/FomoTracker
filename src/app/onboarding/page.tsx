"use client";

import { gooeyToast } from "goey-toast";
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Laptop,
  Moon,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initialApps } from "@/lib/data/databaseInitialData";
import { api } from "@/lib/utils/api";
import { useUser } from "@/hooks/useUser";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: user } = useUser();

  useEffect(() => {
    if (user && user.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Form States
  const [isAndroidConnected, setIsAndroidConnected] = useState(false);
  const [isBrowserConnected, setIsBrowserConnected] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([
    "550e8400-e29b-41d4-a716-446655440010", // Instagram
    "550e8400-e29b-41d4-a716-446655440011", // TikTok
  ]);
  const [productiveStart, setProductiveStart] = useState("08:00");
  const [productiveEnd, setProductiveEnd] = useState("17:00");
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("06:00");

  const [notifExcessive, setNotifExcessive] = useState(true);
  const [excessiveHours, setExcessiveHours] = useState(3);
  const [notifProductive, setNotifProductive] = useState(true);
  const [notifMidnight, setNotifMidnight] = useState(true);
  const [notifContinuous, setNotifContinuous] = useState(true);
  const [continuousMinutes, setContinuousMinutes] = useState(45);

  const handleToggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  };

  const handleNext = async () => {
    if (step === 3 && selectedApps.length === 0) {
      gooeyToast.warning("Pilih minimal 1 aplikasi untuk dipantau.");
      return;
    }
    if (step < 6) {
      setStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await api.post("/api/onboarding", {
          isAndroidConnected,
          isBrowserConnected,
          selectedApps,
          productiveStart,
          productiveEnd,
          sleepStart,
          sleepEnd,
          notifScreenTimeEnabled: notifExcessive,
          screenTimeLimitSeconds: excessiveHours * 3600,
          notifProductiveHourEnabled: notifProductive,
          notifMidnightEnabled: notifMidnight,
          notifContinuousEnabled: notifContinuous,
          continuousLimitSeconds: continuousMinutes * 60,
        });

        if (response.data.success) {
          gooeyToast.success("Pengaturan onboarding berhasil disimpan!");
          router.push("/dashboard");
        } else {
          gooeyToast.error(response.data.error || "Gagal menyimpan onboarding");
        }
      } catch (error: any) {
        console.error(error);
        gooeyToast.error(
          error.response?.data?.error || "Terjadi kesalahan saat menyimpan data",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const renderProgress = () => {
    return (
      <div className="flex items-center gap-1.5 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? "bg-primary" : "bg-muted-light"
            }`}
          />
        ))}
      </div>
    );
  };

  // Helper colors for apps
  const getAppColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "instagram":
        return "from-pink-500 to-purple-600";
      case "tiktok":
        return "from-slate-800 to-black";
      case "youtube":
        return "from-red-500 to-red-700";
      case "whatsapp":
        return "from-green-400 to-emerald-600";
      case "x (twitter)":
        return "from-neutral-700 to-black";
      case "facebook":
        return "from-blue-600 to-blue-800";
      case "reddit":
        return "from-orange-500 to-red-600";
      default:
        return "from-secondary to-primary";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-poppins relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-xl bg-card border border-border shadow-md rounded-3xl p-6 md:p-10 transition-all duration-300">
        {renderProgress()}

        {/* STEP 1: Selamat Datang */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-muted-light flex items-center justify-center border border-border text-primary animate-float-medium">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                Kenali Kebiasaan Digitalmu
              </h1>
              <p className="text-muted font-light leading-relaxed max-w-md mx-auto text-sm">
                FomoTracker membantu Anda memahami seberapa sering dan berapa
                lama Anda membuka media sosial. Dapatkan kendali atas fokus Anda
                kembali.
              </p>
            </div>
            <div className="bg-muted-light/45 rounded-2xl p-4 border border-border flex items-center gap-3 text-left">
              <Info className="w-5 h-5 text-secondary shrink-0" />
              <p className="text-xs text-muted font-light">
                Setup hanya memakan waktu 2 menit dan akan menyesuaikan
                pengaturan pengingat Anda secara personal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Mulai Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Hubungkan Perangkat */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Hubungkan HP atau Browsermu
              </h2>
              <p className="text-xs text-muted font-light">
                FomoTracker butuh izin untuk membaca aktivitas media sosialmu.
              </p>
            </div>

            <div className="space-y-4">
              {/* Android Card */}
              <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-primary">
                      Untuk Pengguna HP Android
                    </h3>
                    <p className="text-[11px] text-muted leading-relaxed font-light">
                      Memantau semua aplikasi media sosial yang kamu pakai di
                      HP.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAndroidConnected(true)}
                      className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all mt-2 flex items-center gap-1 cursor-pointer ${
                        isAndroidConnected
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-border hover:bg-muted-light text-primary"
                      }`}
                    >
                      <Download className="w-3 h-3" />
                      {isAndroidConnected
                        ? "Unduh Lagi (APK)"
                        : "Unduh Aplikasi"}
                    </button>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  {isAndroidConnected ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                      ✅ Terhubung
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted bg-muted-light border border-border px-2 py-0.5 rounded-full uppercase">
                      ⏳ Belum
                    </span>
                  )}
                </div>
              </div>

              {/* Browser Card */}
              <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-primary">
                      Untuk Pengguna Laptop/Komputer
                    </h3>
                    <p className="text-[11px] text-muted leading-relaxed font-light">
                      Memantau media sosial yang kamu buka lewat browser seperti
                      Chrome.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsBrowserConnected(true)}
                      className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all mt-2 flex items-center gap-1 cursor-pointer ${
                        isBrowserConnected
                          ? "bg-sky-50 border-sky-200 text-sky-700"
                          : "bg-white border-border hover:bg-muted-light text-primary"
                      }`}
                    >
                      <Download className="w-3 h-3" />
                      {isBrowserConnected ? "Pasang Lagi" : "Pasang Ekstensi"}
                    </button>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  {isBrowserConnected ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                      ✅ Terhubung
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted bg-muted-light border border-border px-2 py-0.5 rounded-full uppercase">
                      ⏳ Belum
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-semibold transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all cursor-pointer text-xs"
              >
                <span>Lanjutkan / Lewati</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pilih Aplikasi yang Dipantau */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Aplikasi mana yang ingin kamu pantau?
              </h2>
              <p className="text-xs text-muted font-light">
                Pilih aplikasi media sosial yang biasa kamu pakai sehari-hari.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {initialApps.map((app) => {
                const isSelected = selectedApps.includes(app.id);
                return (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => handleToggleApp(app.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-muted-light/30 shadow-xs"
                        : "border-border hover:border-muted hover:bg-muted-light/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAppColor(
                          app.name,
                        )} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs`}
                      >
                        {app.name.substring(0, 2)}
                      </div>
                      <span className="font-bold text-primary text-xs truncate">
                        {app.name}
                      </span>
                    </div>
                    <div
                      className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-semibold transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all cursor-pointer text-xs"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Atur Jam Belajar & Tidur */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Kapan kamu biasanya belajar/kerja dan tidur?
              </h2>
              <p className="text-xs text-muted font-light">
                Ini membantu FomoTracker mendeteksi apakah HP mengganggu waktu
                pentingmu.
              </p>
            </div>

            <div className="space-y-4">
              {/* Jam Belajar / Kerja */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Jam Belajar / Kerja
                  </span>
                  <span className="text-[10px] text-muted font-light ml-auto">
                    Contoh: 08.00 – 17.00
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prod-start"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Jam Mulai
                    </label>
                    <input
                      id="prod-start"
                      type="time"
                      value={productiveStart}
                      onChange={(e) => setProductiveStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prod-end"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Jam Selesai
                    </label>
                    <input
                      id="prod-end"
                      type="time"
                      value={productiveEnd}
                      onChange={(e) => setProductiveEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Jam Tidur */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Jam Tidur
                  </span>
                  <span className="text-[10px] text-muted font-light ml-auto">
                    Contoh: 22.00 – 06.00
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sl-start"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Mulai Istirahat
                    </label>
                    <input
                      id="sl-start"
                      type="time"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sl-end"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Bangun Tidur
                    </label>
                    <input
                      id="sl-end"
                      type="time"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-semibold transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all cursor-pointer text-xs"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Aktifkan Pengingat */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Mau diingatkan kalau kebablasan?
              </h2>
              <p className="text-xs text-muted font-light">
                FomoTracker bisa mengirim pengingat saat kamu perlu istirahat
                dari HP.
              </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Limit HP Harian */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-xs sm:text-sm">
                      Batas Pemakaian HP
                    </h3>
                    <p className="text-[10px] text-muted font-light">
                      Ingatkan jika pakai HP terlalu lama hari ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifExcessive(!notifExcessive)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                      notifExcessive ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${
                        notifExcessive ? "right-0.75" : "left-0.75"
                      }`}
                    />
                  </button>
                </div>
                {notifExcessive && (
                  <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
                    <span className="text-[11px] text-muted font-light">
                      Batas berapa jam per hari?
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={excessiveHours}
                      onChange={(e) =>
                        setExcessiveHours(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-primary font-bold text-center focus:outline-none focus:border-primary"
                    />
                    <span className="text-[11px] text-muted font-light">
                      Jam
                    </span>
                  </div>
                )}
              </div>

              {/* Jam Produktif */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-bold text-primary text-xs sm:text-sm">
                    Pengingat Jam Produktif
                  </h3>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan saat jam belajar/kerja jika membuka medsos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifProductive(!notifProductive)}
                  className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                    notifProductive ? "bg-primary" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${
                      notifProductive ? "right-0.75" : "left-0.75"
                    }`}
                  />
                </button>
              </div>

              {/* Main Malam */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-bold text-primary text-xs sm:text-sm">
                    Pengingat Jam Tidur
                  </h3>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan saat main HP malam hari di jam tidur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifMidnight(!notifMidnight)}
                  className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                    notifMidnight ? "bg-primary" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${
                      notifMidnight ? "right-0.75" : "left-0.75"
                    }`}
                  />
                </button>
              </div>

              {/* Nonstop Alert */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-xs sm:text-sm">
                      Pengingat Sesi Nonstop
                    </h3>
                    <p className="text-[10px] text-muted font-light">
                      Ingatkan jika membuka HP nonstop tanpa jeda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifContinuous(!notifContinuous)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                      notifContinuous ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${
                        notifContinuous ? "right-0.75" : "left-0.75"
                      }`}
                    />
                  </button>
                </div>
                {notifContinuous && (
                  <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
                    <span className="text-[11px] text-muted font-light">
                      Batas waktu nonstop?
                    </span>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={continuousMinutes}
                      onChange={(e) =>
                        setContinuousMinutes(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-primary font-bold text-center focus:outline-none focus:border-primary"
                    />
                    <span className="text-[11px] text-muted font-light">
                      Menit
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-semibold transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all cursor-pointer text-xs"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Selesai */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-primary">
                Semua siap! 🎉
              </h2>
              <p className="text-xs text-muted font-light">
                Konfigurasi Anda berhasil disimpan.
              </p>
            </div>

            {/* Config Summary */}
            <div className="space-y-3.5 p-5 rounded-2xl border border-border bg-muted-light/10 text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Perangkat Terhubung
                </span>
                <div className="text-right space-y-0.5">
                  <div className="font-bold text-primary">
                    {isAndroidConnected
                      ? "✅ HP Android"
                      : "⏳ HP Android (Belum)"}
                  </div>
                  <div className="font-bold text-primary">
                    {isBrowserConnected
                      ? "✅ Browser Extension"
                      : "⏳ Browser Extension (Belum)"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Aplikasi Dipantau
                </span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {selectedApps.length > 0 ? (
                    initialApps
                      .filter((app) => selectedApps.includes(app.id))
                      .map((app) => (
                        <span
                          key={app.id}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase"
                        >
                          {app.name}
                        </span>
                      ))
                  ) : (
                    <span className="text-[10px] text-red-500 font-semibold">
                      Belum memilih
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Jam Belajar / Kerja
                </span>
                <span className="font-bold text-primary">
                  {productiveStart} – {productiveEnd}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">Jam Tidur</span>
                <span className="font-bold text-primary">
                  {sleepStart} – {sleepEnd}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="font-semibold text-muted">
                  Pengingat Aktif
                </span>
                <div className="flex flex-col items-end gap-1">
                  {notifExcessive && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ Batas Harian ({excessiveHours} Jam)
                    </span>
                  )}
                  {notifProductive && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ Jam Produktif
                    </span>
                  )}
                  {notifMidnight && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ Jam Tidur Malam
                    </span>
                  )}
                  {notifContinuous && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ Sesi Nonstop ({continuousMinutes} mnt)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-semibold transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-secondary disabled:bg-primary/50 transition-all cursor-pointer text-sm shadow-md shadow-primary/10"
              >
                <span>{isSubmitting ? "Menyimpan..." : "Masuk ke Beranda"}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
