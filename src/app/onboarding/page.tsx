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
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { initialApps } from "@/lib/data/databaseInitialData";
import { api } from "@/lib/utils/api";
import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  isUsageStatsPermissionGranted,
  openUsageStatsSettings,
} from "@/lib/capacitor/usageStats";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: user } = useUser();

  // Platform & Extension Detection states
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [isAndroidPlatform, setIsAndroidPlatform] = useState(false);
  const [selectedInstallOption, setSelectedInstallOption] = useState<
    "android" | "extension" | null
  >(null);
  const [waitingForInstall, setWaitingForInstall] = useState(false);
  const [needsUsagePermission, setNeedsUsagePermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  // Form States
  const [selectedApps, setSelectedApps] = useState<string[]>([
    "550e8400-e29b-41d4-a716-446655440010", // Instagram
    "550e8400-e29b-41d4-a716-446655440011", // TikTok
  ]);
  const [monitoredUrls, setMonitoredUrls] = useState<
    { name: string; url: string }[]
  >([
    { name: "Instagram", url: "instagram.com" },
    { name: "TikTok", url: "tiktok.com" },
  ]);
  const [newUrlName, setNewUrlName] = useState("");
  const [newUrlAddress, setNewUrlAddress] = useState("");

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

  // Detect connection settings and usage permissions
  useEffect(() => {
    const isAndroid = Capacitor.getPlatform() === "android";
    setIsAndroidPlatform(isAndroid);

    const checkAndroidPermission = async () => {
      if (isAndroid) {
        const granted = await isUsageStatsPermissionGranted();
        setNeedsUsagePermission(!granted);
      }
      setIsCheckingPermission(false);
    };

    const checkExtension = () => {
      const hasExtension =
        typeof window !== "undefined" &&
        ((window as any).__FOMOTRACKER_EXTENSION_INSTALLED__ ||
          document.getElementById("fomotracker-extension-root"));
      setIsExtensionInstalled(!!hasExtension);
    };

    checkAndroidPermission();
    checkExtension();
    const timer = setTimeout(checkExtension, 1000);

    // If waiting for install or checking permission on Android, run a polling loop
    const interval = setInterval(() => {
      checkExtension();
      if (isAndroid) {
        isUsageStatsPermissionGranted().then((granted) => {
          setNeedsUsagePermission(!granted);
        });
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Lockdown: Redirect back to dashboard if they somehow got here but completed onboarding
  useEffect(() => {
    if (user && user.onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Dynamic steps mapping
  const getSteps = () => {
    const list = [
      { id: "welcome", title: "Selamat Datang" },
      { id: "devices", title: "Hubungkan Perangkat" },
    ];

    if (isAndroidPlatform) {
      list.push({ id: "android_apps", title: "Aplikasi Android" });
    }

    if (isExtensionInstalled) {
      list.push({ id: "browser_urls", title: "Situs Browser" });
    }

    list.push(
      { id: "hours", title: "Jadwal Harian" },
      { id: "alerts", title: "Batasan & Notifikasi" },
      { id: "finish", title: "Selesai" },
    );

    return list;
  };

  const stepsList = getSteps();
  const totalSteps = stepsList.length;
  const currentStepConfig = stepsList[step - 1];
  const stepId = currentStepConfig?.id;

  const handleToggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  };

  const handleAddUrl = () => {
    if (!newUrlName.trim() || !newUrlAddress.trim()) {
      gooeyToast.error("Nama dan URL situs harus diisi!");
      return;
    }
    let cleanUrl = newUrlAddress.trim().toLowerCase();
    cleanUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, "");

    if (monitoredUrls.some((item) => item.url === cleanUrl)) {
      gooeyToast.error("Situs web ini sudah terdaftar!");
      return;
    }

    setMonitoredUrls((prev) => [
      ...prev,
      { name: newUrlName.trim(), url: cleanUrl },
    ]);
    setNewUrlName("");
    setNewUrlAddress("");
    gooeyToast.success("Situs web berhasil ditambahkan!");
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setMonitoredUrls((prev) => prev.filter((item) => item.url !== urlToRemove));
  };

  const handleManualCheckConnection = () => {
    const hasExtension =
      typeof window !== "undefined" &&
      ((window as any).__FOMOTRACKER_EXTENSION_INSTALLED__ ||
        document.getElementById("fomotracker-extension-root"));
    setIsExtensionInstalled(!!hasExtension);

    if (hasExtension) {
      gooeyToast.success("Koneksi Ekstensi Browser berhasil dideteksi!");
      setWaitingForInstall(false);
    } else {
      gooeyToast.error("Koneksi Ekstensi Browser belum dideteksi.");
    }
  };

  const handleNext = async () => {
    // Validation
    if (stepId === "android_apps" && selectedApps.length === 0) {
      gooeyToast.warning("Pilih minimal 1 aplikasi untuk dipantau.");
      return;
    }

    if (stepId === "browser_urls" && monitoredUrls.length === 0) {
      gooeyToast.warning("Masukkan minimal 1 situs web untuk dipantau.");
      return;
    }

    if (stepId === "devices" && !isAndroidPlatform && !isExtensionInstalled) {
      if (!selectedInstallOption) {
        gooeyToast.error("Silakan pilih minimal 1 dari 2 opsi perangkat!");
        return;
      }
      window.open(`/instalasi?tab=${selectedInstallOption}`, "_blank");
      setWaitingForInstall(true);
      return;
    }

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await api.post("/api/onboarding", {
          isAndroidConnected: isAndroidPlatform,
          isBrowserConnected: isExtensionInstalled,
          selectedApps: isAndroidPlatform ? selectedApps : [],
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
          // Sync rules with browser extension if connected
          if (isExtensionInstalled) {
            window.postMessage(
              {
                type: "FOMOTRACKER_SYNC_RULES",
                rules: monitoredUrls.map((item) => ({
                  id: Math.random().toString(36).substring(7),
                  name: item.name,
                  url: item.url,
                  enabled: true,
                })),
              },
              "*",
            );
          }

          gooeyToast.success("Pengaturan onboarding berhasil disimpan!");
          await queryClient.invalidateQueries({ queryKey: ["user"] });
          router.replace("/dashboard");
        } else {
          gooeyToast.error(response.data.error || "Gagal menyimpan onboarding");
        }
      } catch (error: any) {
        console.error(error);
        gooeyToast.error(
          error.response?.data?.error ||
            "Terjadi kesalahan saat menyimpan data",
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
      <div className="flex items-center gap-1.5 mb-8 select-none">
        {stepsList.map((cfg, idx) => (
          <div
            key={cfg.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx + 1 <= step ? "bg-primary" : "bg-muted-light"
            }`}
          />
        ))}
      </div>
    );
  };

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

  if (isAndroidPlatform && isCheckingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-poppins">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted font-bold">
            Memeriksa izin perangkat...
          </p>
        </div>
      </div>
    );
  }

  if (isAndroidPlatform && needsUsagePermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-poppins relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-xl bg-card border border-border shadow-md rounded-3xl p-6 md:p-10 transition-all duration-300 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
            <Smartphone className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">
              Akses Pemakaian Diperlukan 📱
            </h1>
            <p className="text-muted font-light leading-relaxed max-w-md mx-auto text-sm">
              Untuk memantau durasi penggunaan aplikasi media sosial Anda secara
              akurat pada perangkat Android, FomoTracker memerlukan izin{" "}
              <strong>Akses Pemakaian (Usage Access)</strong>.
            </p>
          </div>
          <div className="bg-muted-light/45 rounded-2xl p-4 border border-border flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-muted font-light leading-relaxed">
              Silakan ketuk tombol di bawah, cari <strong>FomoTracker</strong>{" "}
              di daftar aplikasi, lalu aktifkan izin{" "}
              <strong>Bolehkan akses pemakaian</strong>. Setelah itu, kembalilah
              ke aplikasi ini.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await openUsageStatsSettings();
            }}
            className="w-full py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Buka Pengaturan Akses Pemakaian</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-poppins relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-xl bg-card border border-border shadow-md rounded-3xl p-6 md:p-10 transition-all duration-300">
        {renderProgress()}

        {/* STEP: welcome */}
        {stepId === "welcome" && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-muted-light flex items-center justify-center border border-border text-primary">
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

        {/* STEP: devices */}
        {stepId === "devices" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Hubungkan Perangkat Anda
              </h2>
              <p className="text-xs text-muted font-light">
                FomoTracker membutuhkan koneksi ke HP atau browser untuk melacak
                waktu pemakaian.
              </p>
            </div>

            {/* Display connectivity status if connected */}
            {isAndroidPlatform || isExtensionInstalled ? (
              <div className="space-y-4">
                {isAndroidPlatform && (
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800">
                          Aplikasi Android Terhubung
                        </h4>
                        <p className="text-[10px] text-emerald-600">
                          Melacak aplikasi HP Anda.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      Aktif
                    </span>
                  </div>
                )}

                {isExtensionInstalled && (
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800">
                          Ekstensi Browser Terhubung
                        </h4>
                        <p className="text-[10px] text-emerald-600">
                          Melacak tab browser komputer Anda.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      Aktif
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Neither connected: Ask user to choose one to install
              <div className="space-y-4">
                {waitingForInstall ? (
                  <div className="p-6 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-primary">
                        Menunggu Koneksi Terdeteksi...
                      </h4>
                      <p className="text-[10px] text-muted max-w-xs leading-relaxed">
                        Silakan pasang aplikasi/ekstensi Anda di tab baru.
                        Setelah terpasang, sistem akan mendeteksinya secara
                        otomatis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualCheckConnection}
                      className="px-4 py-2 border border-border bg-white hover:bg-muted-light rounded-xl text-[10px] font-bold text-primary cursor-pointer transition-all"
                    >
                      Cek Koneksi Sekarang
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl border border-red-100 bg-red-50/10 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-700 leading-relaxed">
                        Perangkat pemantau belum terdeteksi. Silakan pilih
                        minimal salah satu opsi di bawah ini untuk diarahkan ke
                        halaman instalasi terlebih dahulu.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedInstallOption("android")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                          selectedInstallOption === "android"
                            ? "border-primary bg-muted-light/20 shadow-xs"
                            : "border-border hover:bg-muted-light/10"
                        }`}
                      >
                        <Smartphone
                          className={`w-6 h-6 ${selectedInstallOption === "android" ? "text-primary" : "text-muted"}`}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-primary">
                            Aplikasi Android
                          </h4>
                          <p className="text-[9px] text-muted font-light mt-0.5 leading-tight">
                            Unduh APK untuk HP Android Anda.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedInstallOption("extension")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                          selectedInstallOption === "extension"
                            ? "border-primary bg-muted-light/20 shadow-xs"
                            : "border-border hover:bg-muted-light/10"
                        }`}
                      >
                        <Laptop
                          className={`w-6 h-6 ${selectedInstallOption === "extension" ? "text-primary" : "text-muted"}`}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-primary">
                            Ekstensi Browser
                          </h4>
                          <p className="text-[9px] text-muted font-light mt-0.5 leading-tight">
                            Pasang di Google Chrome komputer.
                          </p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

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
                disabled={
                  waitingForInstall &&
                  !isAndroidPlatform &&
                  !isExtensionInstalled
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all cursor-pointer text-xs disabled:opacity-50"
              >
                <span>
                  {!isAndroidPlatform && !isExtensionInstalled
                    ? "Lanjutkan ke Instalasi"
                    : "Lanjutkan"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP: android_apps */}
        {stepId === "android_apps" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Pilih Aplikasi HP yang Dipantau
              </h2>
              <p className="text-xs text-muted font-light">
                Pilih aplikasi media sosial yang biasa Anda gunakan di HP
                Android.
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
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-muted-light/20"
                        : "border-border hover:border-muted hover:bg-muted-light/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getAppColor(
                          app.name,
                        )} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}
                      >
                        {app.name.substring(0, 2)}
                      </div>
                      <span className="font-bold text-primary text-xs truncate">
                        {app.name}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
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

        {/* STEP: browser_urls */}
        {stepId === "browser_urls" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Atur Daftar Situs yang Dipantau
              </h2>
              <p className="text-xs text-muted font-light">
                Masukkan nama dan domain situs web yang ingin dipantau oleh
                Ekstensi FomoTracker.
              </p>
            </div>

            {/* Input Form */}
            <div className="p-4 rounded-2xl border border-border bg-muted-light/10 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="url-name"
                    className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                  >
                    Nama Situs
                  </label>
                  <input
                    id="url-name"
                    type="text"
                    placeholder="Instagram"
                    value={newUrlName}
                    onChange={(e) => setNewUrlName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="url-address"
                    className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                  >
                    Domain Website
                  </label>
                  <input
                    id="url-address"
                    type="text"
                    placeholder="instagram.com"
                    value={newUrlAddress}
                    onChange={(e) => setNewUrlAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Situs</span>
              </button>
            </div>

            {/* URL List */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {monitoredUrls.map((item) => (
                <div
                  key={item.url}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-primary">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted truncate">
                      {item.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(item.url)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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

        {/* STEP: hours */}
        {stepId === "hours" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Atur Waktu Harian Anda
              </h2>
              <p className="text-xs text-muted font-light">
                FomoTracker akan menganalisis jam tidur dan jam produktif harian
                Anda.
              </p>
            </div>

            <div className="space-y-4">
              {/* Productive Hours */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Jam Belajar / Kerja
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prod-start"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Mulai
                    </label>
                    <input
                      id="prod-start"
                      type="time"
                      value={productiveStart}
                      onChange={(e) => setProductiveStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prod-end"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Selesai
                    </label>
                    <input
                      id="prod-end"
                      type="time"
                      value={productiveEnd}
                      onChange={(e) => setProductiveEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sleep Hours */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Jam Tidur Malam
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sleep-start"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Mulai
                    </label>
                    <input
                      id="sleep-start"
                      type="time"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sleep-end"
                      className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1"
                    >
                      Bangun
                    </label>
                    <input
                      id="sleep-end"
                      type="time"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none"
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

        {/* STEP: alerts */}
        {stepId === "alerts" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Atur Batasan & Pengingat
              </h2>
              <p className="text-xs text-muted font-light">
                Sesuaikan notifikasi pengingat untuk melatih disiplin digital
                Anda.
              </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Daily HP Limit */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-xs sm:text-sm">
                      Batas Pemakaian Harian
                    </h3>
                    <p className="text-[10px] text-muted font-light">
                      Batas pemakaian media sosial harian.
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
                      Batasi berapa jam per hari?
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={excessiveHours}
                      onChange={(e) =>
                        setExcessiveHours(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-primary font-bold text-center focus:outline-none"
                    />
                    <span className="text-[11px] text-muted font-light">
                      Jam
                    </span>
                  </div>
                )}
              </div>

              {/* Productive Alert */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-bold text-primary text-xs sm:text-sm">
                    Pengingat Jam Kerja
                  </h3>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan jika membuka medsos di jam kerja.
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

              {/* Midnight Sleep Alert */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-bold text-primary text-xs sm:text-sm">
                    Pengingat Jam Tidur
                  </h3>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan jika main HP di jam tidur malam.
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

              {/* Continuous limit */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-xs sm:text-sm">
                      Pengingat Nonstop
                    </h3>
                    <p className="text-[10px] text-muted font-light">
                      Ingatkan jika online terus tanpa jeda.
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
                      Batas online nonstop?
                    </span>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={continuousMinutes}
                      onChange={(e) =>
                        setContinuousMinutes(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-primary font-bold text-center focus:outline-none"
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

        {/* STEP: finish */}
        {stepId === "finish" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-primary">
                Semua siap! 🎉
              </h2>
              <p className="text-xs text-muted font-light">
                Konfigurasi awal FomoTracker telah berhasil disiapkan.
              </p>
            </div>

            <div className="space-y-3.5 p-5 rounded-2xl border border-border bg-muted-light/10 text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Metode Pemantauan
                </span>
                <div className="text-right space-y-0.5 font-bold text-primary">
                  <div>
                    {isAndroidPlatform
                      ? "✅ Aplikasi Android HP"
                      : "❌ Aplikasi Android HP (Mati)"}
                  </div>
                  <div>
                    {isExtensionInstalled
                      ? "✅ Ekstensi Browser"
                      : "❌ Ekstensi Browser (Mati)"}
                  </div>
                </div>
              </div>

              {isAndroidPlatform && (
                <div className="flex justify-between items-start pb-3 border-b border-border/60">
                  <span className="font-semibold text-muted">
                    Aplikasi HP Dipantau
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {selectedApps.length > 0 ? (
                      initialApps
                        .filter((app) => selectedApps.includes(app.id))
                        .map((app) => (
                          <span
                            key={app.id}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase"
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
              )}

              {isExtensionInstalled && (
                <div className="flex justify-between items-start pb-3 border-b border-border/60">
                  <span className="font-semibold text-muted">
                    Situs Web Dipantau
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {monitoredUrls.length > 0 ? (
                      monitoredUrls.map((item) => (
                        <span
                          key={item.url}
                          className="text-[9px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary uppercase"
                        >
                          {item.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-red-500 font-semibold">
                        Belum ada situs
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Jadwal Jam Kerja
                </span>
                <span className="font-bold text-primary">
                  {productiveStart} – {productiveEnd}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <span className="font-semibold text-muted">
                  Jadwal Tidur Malam
                </span>
                <span className="font-bold text-primary">
                  {sleepStart} – {sleepEnd}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="font-semibold text-muted">Alerts Aktif</span>
                <div className="flex flex-col items-end gap-1 font-bold text-emerald-600">
                  {notifExcessive && (
                    <span>✓ Harian ({excessiveHours} Jam)</span>
                  )}
                  {notifProductive && <span>✓ Jam Kerja</span>}
                  {notifMidnight && <span>✓ Jam Tidur</span>}
                  {notifContinuous && (
                    <span>✓ Nonstop ({continuousMinutes} Mnt)</span>
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
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-secondary disabled:bg-primary/50 transition-all cursor-pointer text-sm shadow-md"
              >
                <span>
                  {isSubmitting ? "Menyimpan..." : "Masuk ke Beranda"}
                </span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
