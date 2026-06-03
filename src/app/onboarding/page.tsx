"use client";

import { ArrowRight, Bell, Briefcase, Check, ChevronLeft, ChevronRight, Eye, Laptop, Moon, Smartphone, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { onboardingDummy } from "@/lib/data/initialData";

const AVAILABLE_APPS = onboardingDummy.availableApps;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form States
  const [selectedApps, setSelectedApps] = useState<string[]>(onboardingDummy.selectedApps);
  const [productiveStart, setProductiveStart] = useState(onboardingDummy.productiveStart);
  const [productiveEnd, setProductiveEnd] = useState(onboardingDummy.productiveEnd);
  const [bedtimeStart, setBedtimeStart] = useState(onboardingDummy.bedtimeStart);
  const [bedtimeEnd, setBedtimeEnd] = useState(onboardingDummy.bedtimeEnd);
  const [notifications, setNotifications] = useState(onboardingDummy.notifications);

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
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted-light"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="w-full max-w-xl bg-card border border-border shadow-md rounded-3xl p-6 md:p-10 transition-all duration-300">
        {renderProgress()}

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-muted-light flex items-center justify-center border border-border text-primary animate-float-medium">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary tracking-tight">Selamat Datang di FomoTracker</h1>
              <p className="text-muted font-light leading-relaxed max-w-md mx-auto text-sm">
                Asisten kesehatan digital Anda. Kami membantu Anda memantau kebiasaan screen time, meningkatkan produktivitas, serta melindungi kualitas tidur malam Anda.
              </p>
            </div>
            <div className="bg-muted-light/45 rounded-2xl p-4 border border-border flex items-center gap-3 text-left">
              <Laptop className="w-5 h-5 text-secondary shrink-0" />
              <p className="text-xs text-muted font-light">Mulai konfigurasi pemantauan Anda untuk menyesuaikan preferensi pelacakan.</p>
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

        {/* STEP 2: Monitoring Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">Monitoring Setup</h2>
              <p className="text-xs text-muted font-light">Pilih aplikasi yang ingin dipantau serta atur jadwal harian Anda.</p>
            </div>

            {/* Apps selection list */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-muted uppercase tracking-wider">Aplikasi yang Dipantau</span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_APPS.map((app) => {
                  const isSelected = selectedApps.includes(app.id);
                  return (
                    <button
                      type="button"
                      key={app.id}
                      onClick={() => handleToggleApp(app.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected ? "border-primary bg-muted-light/35" : "border-border hover:border-muted hover:bg-muted-light/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${app.color} flex items-center justify-center text-white text-[10px] font-bold`}>{app.name.substring(0, 2)}</div>
                        <span className="font-semibold text-primary text-xs truncate max-w-[80px]">{app.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "bg-primary border-primary text-white" : "border-border text-transparent"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Jam Produktif */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Jam Produktif</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="productive-start" className="block text-[9px] font-semibold text-muted uppercase mb-1">
                      Mulai
                    </label>
                    <input
                      id="productive-start"
                      type="time"
                      value={productiveStart}
                      onChange={(e) => setProductiveStart(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="productive-end" className="block text-[9px] font-semibold text-muted uppercase mb-1">
                      Selesai
                    </label>
                    <input
                      id="productive-end"
                      type="time"
                      value={productiveEnd}
                      onChange={(e) => setProductiveEnd(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted font-light leading-relaxed">Mendeteksi aktivitas media sosial di jam belajar/fokus.</p>
              </div>

              {/* Jam Malam */}
              <div className="p-4 rounded-2xl border border-border bg-muted-light/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Jam Malam</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bedtime-start" className="block text-[9px] font-semibold text-muted uppercase mb-1">
                      Mulai
                    </label>
                    <input
                      id="bedtime-start"
                      type="time"
                      value={bedtimeStart}
                      onChange={(e) => setBedtimeStart(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="bedtime-end" className="block text-[9px] font-semibold text-muted uppercase mb-1">
                      Selesai
                    </label>
                    <input
                      id="bedtime-end"
                      type="time"
                      value={bedtimeEnd}
                      onChange={(e) => setBedtimeEnd(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted font-light leading-relaxed">Mendeteksi scrolling larut malam yang mengganggu istirahat tidur.</p>
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

        {/* STEP 3: Notification Setup */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">Notification Setup</h2>
              <p className="text-xs text-muted font-light">Sesuaikan jenis pemberitahuan cerdas dari FomoTracker.</p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Usage Warning */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-semibold text-primary text-xs sm:text-sm">Usage Warning</h3>
                  <p className="text-[10px] sm:text-xs text-muted font-light">Peringatan saat hampir melewati batas harian.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("usageWarning")}
                  className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${notifications.usageWarning ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.usageWarning ? "right-0.75" : "left-0.75"}`} />
                </button>
              </div>

              {/* Option 2: Focus Reminder */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-semibold text-primary text-xs sm:text-sm">Focus Reminder</h3>
                  <p className="text-[10px] sm:text-xs text-muted font-light">Pengingat fokus saat membuka medsos di jam kerja.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("focusReminder")}
                  className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${notifications.focusReminder ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.focusReminder ? "right-0.75" : "left-0.75"}`} />
                </button>
              </div>

              {/* Option 3: Midnight Alert */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-semibold text-primary text-xs sm:text-sm">Midnight Alert</h3>
                  <p className="text-[10px] sm:text-xs text-muted font-light">Peringatan tegas saat bermain HP larut malam.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("midnightAlert")}
                  className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${notifications.midnightAlert ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.midnightAlert ? "right-0.75" : "left-0.75"}`} />
                </button>
              </div>

              {/* Option 4: Continuous Usage */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card">
                <div>
                  <h3 className="font-semibold text-primary text-xs sm:text-sm">Continuous Usage Reminder</h3>
                  <p className="text-[10px] sm:text-xs text-muted font-light">Peringatan saat menggunakan HP nonstop tanpa jeda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification("continuousUsage")}
                  className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${notifications.continuousUsage ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${notifications.continuousUsage ? "right-0.75" : "left-0.75"}`} />
                </button>
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

        {/* STEP 4: Finish */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-primary">Setup Selesai!</h2>
              <p className="text-xs text-muted font-light leading-relaxed">Berikut ringkasan preferensi pemantauan digital Anda.</p>
            </div>

            {/* Config Summary Cards */}
            <div className="space-y-3 p-5 rounded-2xl border border-border bg-muted-light/10">
              <div className="flex justify-between items-center text-xs pb-2.5 border-b border-border">
                <span className="font-semibold text-muted">Aplikasi Dipantau</span>
                <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                  {selectedApps.map((app) => (
                    <span key={app} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs pb-2.5 border-b border-border">
                <span className="font-semibold text-muted">Jam Produktif</span>
                <span className="font-bold text-primary">
                  {productiveStart} – {productiveEnd}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2.5 border-b border-border">
                <span className="font-semibold text-muted">Jam Malam</span>
                <span className="font-bold text-primary">
                  {bedtimeStart} – {bedtimeEnd}
                </span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-semibold text-muted">Notifikasi Aktif</span>
                <div className="flex flex-col items-end gap-0.5">
                  {notifications.usageWarning && <span className="text-[9px] text-emerald-600 font-semibold">✓ Usage Warning</span>}
                  {notifications.focusReminder && <span className="text-[9px] text-emerald-600 font-semibold">✓ Focus Reminder</span>}
                  {notifications.midnightAlert && <span className="text-[9px] text-emerald-600 font-semibold">✓ Midnight Alert</span>}
                  {notifications.continuousUsage && <span className="text-[9px] text-emerald-600 font-semibold">✓ Continuous Usage</span>}
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
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-secondary transition-all cursor-pointer text-sm shadow-md shadow-primary/10"
              >
                <span>Masuk Dashboard</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
