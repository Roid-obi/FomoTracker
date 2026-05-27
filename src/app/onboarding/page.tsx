"use client";

import { ArrowRight, Briefcase, Check, ChevronLeft, ChevronRight, Laptop, Moon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Predefined available apps for monitoring
const AVAILABLE_APPS = [
  {
    id: "instagram",
    name: "Instagram",
    category: "Sosial Media",
    color: "from-pink-500 to-purple-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Sosial Media",
    color: "from-gray-900 to-black",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Hiburan",
    color: "from-red-600 to-red-700",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Sosial Media",
    color: "from-zinc-800 to-zinc-900",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Chatting",
    color: "from-green-500 to-green-600",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Sosial Media",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Diskusi",
    color: "from-orange-500 to-orange-600",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form States
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [productiveStart, setProductiveStart] = useState("08:00");
  const [productiveEnd, setProductiveEnd] = useState("17:00");
  const [bedtimeStart, setBedtimeStart] = useState("22:00");
  const [bedtimeEnd, setBedtimeEnd] = useState("06:00");
  const [notifications, setNotifications] = useState({
    usageWarning: true,
    focusReminder: true,
    midnightAlert: true,
    continuousUsage: false,
  });

  const handleToggleApp = (appId: string) => {
    setSelectedApps((prev) => (prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]));
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (step === 2 && selectedApps.length === 0) {
      alert("Pilih minimal 1 aplikasi untuk dipantau.");
      return;
    }
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      // Finished onboarding, save settings indicator in localStorage if needed and redirect
      router.push("/dashboard");
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
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted-light"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-card border border-border shadow-md rounded-3xl p-6 md:p-10 transition-all duration-300">
        {renderProgress()}

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-muted-light flex items-center justify-center border border-border text-primary animate-float-medium">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-poppins text-primary tracking-tight">Selamat Datang di FomoTracker</h1>
              <p className="text-muted font-poppins font-light leading-relaxed max-w-md mx-auto text-sm">
                Asisten kesehatan digital Anda. Kami membantu Anda memantau kebiasaan screen time, meningkatkan produktivitas, serta melindungi waktu istirahat malam Anda.
              </p>
            </div>
            <div className="bg-muted-light/45 rounded-2xl p-4 border border-border flex items-center gap-3 text-left">
              <Laptop className="w-5 h-5 text-secondary shrink-0" />
              <p className="text-xs text-muted font-poppins font-light">Setup awal ini hanya membutuhkan waktu 2 menit untuk menyesuaikan profil dan preferensi pelacakan Anda.</p>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all shadow-sm flex items-center justify-center gap-2 font-poppins cursor-pointer"
            >
              <span>Mulai Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Choose Monitored Apps */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-poppins text-primary">Aplikasi yang Dipantau</h2>
              <p className="text-sm text-muted font-poppins font-light">Pilih aplikasi yang sering mengalihkan fokus Anda. Anda harus memilih minimal 1 aplikasi.</p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {AVAILABLE_APPS.map((app) => {
                const isSelected = selectedApps.includes(app.id);
                return (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => handleToggleApp(app.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected ? "border-primary bg-muted-light/30" : "border-border hover:border-muted hover:bg-muted-light/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white text-xs font-semibold`}>{app.name.substring(0, 2)}</div>
                      <div>
                        <p className="font-poppins font-semibold text-primary text-sm">{app.name}</p>
                        <p className="text-xs text-muted font-poppins font-light">{app.category}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? "bg-primary border-primary text-white" : "border-border text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-medium transition-all font-poppins cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedApps.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary disabled:opacity-50 transition-all font-poppins cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Productive Hours */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-poppins text-primary">Atur Jam Produktif</h2>
              <p className="text-sm text-muted font-poppins font-light">Selama jam produktif, FomoTracker akan memantau screen time Anda secara ketat untuk mencegah distraksi.</p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-muted-light/10 space-y-6">
              <div className="flex justify-center items-center gap-4">
                <Briefcase className="w-10 h-10 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onb-prod-start" className="block text-xs font-semibold text-muted font-poppins mb-1.5">
                    Mulai Jam
                  </label>
                  <input
                    id="onb-prod-start"
                    type="time"
                    value={productiveStart}
                    onChange={(e) => setProductiveStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-primary font-poppins focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="onb-prod-end" className="block text-xs font-semibold text-muted font-poppins mb-1.5">
                    Selesai Jam
                  </label>
                  <input
                    id="onb-prod-end"
                    type="time"
                    value={productiveEnd}
                    onChange={(e) => setProductiveEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-primary font-poppins focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-center text-muted font-poppins font-light">Contoh standar: 08:00 – 17:00. Notifikasi pengingat fokus akan diaktifkan secara dinamis.</p>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-medium transition-all font-poppins cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all font-poppins cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Bedtime Hours */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-poppins text-primary">Atur Jam Malam (Tidur)</h2>
              <p className="text-sm text-muted font-poppins font-light">Batasi screen time Anda sebelum tidur untuk menjaga kualitas istirahat yang optimal.</p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-muted-light/10 space-y-6">
              <div className="flex justify-center items-center gap-4">
                <Moon className="w-10 h-10 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onb-bed-start" className="block text-xs font-semibold text-muted font-poppins mb-1.5">
                    Mulai Jam
                  </label>
                  <input
                    id="onb-bed-start"
                    type="time"
                    value={bedtimeStart}
                    onChange={(e) => setBedtimeStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-primary font-poppins focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="onb-bed-end" className="block text-xs font-semibold text-muted font-poppins mb-1.5">
                    Selesai Jam
                  </label>
                  <input
                    id="onb-bed-end"
                    type="time"
                    value={bedtimeEnd}
                    onChange={(e) => setBedtimeEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-primary font-poppins focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-center text-muted font-poppins font-light">Contoh standar: 22:00 – 06:00. Peringatan keras akan dikirim jika ada aktivitas penggunaan di jam tidur.</p>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-medium transition-all font-poppins cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all font-poppins cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Notification Preferences */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-poppins text-primary">Preferensi Notifikasi</h2>
              <p className="text-sm text-muted font-poppins font-light">Atur jenis peringatan cerdas apa saja yang ingin Anda terima dari FomoTracker.</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Usage Warning */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-poppins font-semibold text-primary text-sm">Usage Warning</h3>
                  <p className="text-xs text-muted font-poppins font-light">Peringatan saat hampir mencapai batas harian.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("usageWarning")}
                  className={`w-12 h-6.5 rounded-full transition-all relative ${notifications.usageWarning ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.usageWarning ? "right-1" : "left-1"}`} />
                </button>
              </div>

              {/* Option 2: Focus Reminder */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-poppins font-semibold text-primary text-sm">Focus Reminder</h3>
                  <p className="text-xs text-muted font-poppins font-light">Mengingatkan fokus jika membuka medsos di jam kerja.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("focusReminder")}
                  className={`w-12 h-6.5 rounded-full transition-all relative ${notifications.focusReminder ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.focusReminder ? "right-1" : "left-1"}`} />
                </button>
              </div>

              {/* Option 3: Midnight Alert */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-poppins font-semibold text-primary text-sm">Midnight Alert</h3>
                  <p className="text-xs text-muted font-poppins font-light">Peringatan tegas saat menggunakan HP larut malam.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("midnightAlert")}
                  className={`w-12 h-6.5 rounded-full transition-all relative ${notifications.midnightAlert ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.midnightAlert ? "right-1" : "left-1"}`} />
                </button>
              </div>

              {/* Option 4: Continuous Usage */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-poppins font-semibold text-primary text-sm">Continuous Usage</h3>
                  <p className="text-xs text-muted font-poppins font-light">Peringatan saat berselancar tanpa henti selama 30 menit.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("continuousUsage")}
                  className={`w-12 h-6.5 rounded-full transition-all relative ${notifications.continuousUsage ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.continuousUsage ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-border text-muted hover:text-primary hover:bg-muted-light/35 font-medium transition-all font-poppins cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-secondary transition-all font-poppins cursor-pointer"
              >
                <span>Selesai & Mulai</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
