"use client";

import { Bell, Check, Sliders } from "lucide-react";
import { useState } from "react";
import { settingsDummy } from "@/lib/data/initialData";

export default function NotificationsSettingsPage() {
  const [toggles, setToggles] = useState(settingsDummy.notificationSettings.toggles);

  const [thresholdDaily, setThresholdDaily] = useState(settingsDummy.notificationSettings.thresholdDaily);
  const [thresholdContinuous, setThresholdContinuous] = useState(settingsDummy.notificationSettings.thresholdContinuous);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-poppins">
      {/* Left 2 Cols: Toggles */}
      <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-primary mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span>Jenis Peringatan Aktif</span>
        </h3>

        <div className="space-y-3">
          {/* Usage Warning */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
            <div>
              <h4 className="font-semibold text-primary text-xs sm:text-sm">Usage Warning</h4>
              <p className="text-[10px] sm:text-xs text-muted font-light leading-relaxed">Peringatan dinamis saat Anda mendekati batas waktu harian yang Anda tetapkan.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("usageWarning")}
              className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${toggles.usageWarning ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${toggles.usageWarning ? "right-0.75" : "left-0.75"}`} />
            </button>
          </div>

          {/* Focus Reminder */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
            <div>
              <h4 className="font-semibold text-primary text-xs sm:text-sm">Focus Reminder</h4>
              <p className="text-[10px] sm:text-xs text-muted font-light leading-relaxed">Pengingat otomatis untuk kembali berfokus saat membuka media sosial di jam produktif.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("focusReminder")}
              className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${toggles.focusReminder ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${toggles.focusReminder ? "right-0.75" : "left-0.75"}`} />
            </button>
          </div>

          {/* Midnight Alert */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
            <div>
              <h4 className="font-semibold text-primary text-xs sm:text-sm">Midnight Alert</h4>
              <p className="text-[10px] sm:text-xs text-muted font-light leading-relaxed">Peringatan tegas saat screen time terdeteksi aktif pada jam istirahat malam hari.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("midnightAlert")}
              className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${toggles.midnightAlert ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${toggles.midnightAlert ? "right-0.75" : "left-0.75"}`} />
            </button>
          </div>

          {/* Continuous Usage Reminder */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
            <div>
              <h4 className="font-semibold text-primary text-xs sm:text-sm">Continuous Usage Reminder</h4>
              <p className="text-[10px] sm:text-xs text-muted font-light leading-relaxed">Peringatan berkala saat Anda beraktivitas menatap layar tanpa jeda selama durasi tertentu.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("continuousUsage")}
              className={`w-10 h-5.5 rounded-full transition-all relative shrink-0 ${toggles.continuousUsage ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${toggles.continuousUsage ? "right-0.75" : "left-0.75"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Right 1 Col: Thresholds */}
      <div className="flex flex-col gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Threshold Peringatan</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="threshold-daily" className="block text-[10px] font-semibold text-muted mb-1.5">
                Batas Harian Screen Time (Menit)
              </label>
              <input
                id="threshold-daily"
                type="number"
                value={thresholdDaily}
                onChange={(e) => setThresholdDaily(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
              <span className="text-[9px] text-muted font-light mt-1 block">Default: 90 menit (1.5 jam) per hari</span>
            </div>

            <div>
              <label htmlFor="threshold-continuous" className="block text-[10px] font-semibold text-muted mb-1.5">
                Batas Penggunaan Nonstop (Menit)
              </label>
              <input
                id="threshold-continuous"
                type="number"
                value={thresholdContinuous}
                onChange={(e) => setThresholdContinuous(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
              <span className="text-[9px] text-muted font-light mt-1 block">Default: 30 menit tanpa jeda istirahat</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Threshold berhasil disimpan!
            </span>
          )}
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs">
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </form>
  );
}
