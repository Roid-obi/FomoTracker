"use client";

import { useState } from "react";
import { Activity, Bell, Briefcase, Check, Clock, Moon } from "lucide-react";
import { initialUserSettings } from "@/lib/data/databaseInitialData";

export default function NotifikasiSettingsPage() {
  const settings = initialUserSettings[0];

  const [notifExcessive, setNotifExcessive] = useState(settings?.notif_screen_time_enabled ?? true);
  const [excessiveHours, setExcessiveHours] = useState(
    Math.round((settings?.screen_time_limit_seconds || 10800) / 3600)
  );

  const [notifProductive, setNotifProductive] = useState(settings?.notif_productive_hour_enabled ?? true);
  const [notifMidnight, setNotifMidnight] = useState(settings?.notif_midnight_enabled ?? true);

  const [notifContinuous, setNotifContinuous] = useState(settings?.notif_continuous_enabled ?? true);
  const [continuousMinutes, setContinuousMinutes] = useState(
    Math.round((settings?.continuous_limit_seconds || 2700) / 60)
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-poppins flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-primary">Preferensi Pengingat</h2>
          <p className="text-[11px] text-muted font-light mt-0.5">
            Aktifkan dan atur parameter ambang batas untuk pengingat cerdas kesejahteraan digital Anda.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Daily Limit */}
          <div className="p-4.5 rounded-2xl border border-border bg-background/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Clock className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">Batas Pemakaian Harian</h4>
                  <p className="text-[10px] text-muted font-light">Ingatkan saya saat total screen time harian melewati batas.</p>
                </div>
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
              <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                <span className="text-[10px] text-muted font-light">Batas waktu penggunaan per hari:</span>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={excessiveHours}
                  onChange={(e) => setExcessiveHours(Number(e.target.value))}
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-primary font-bold text-center focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-muted font-light">Jam</span>
              </div>
            )}
          </div>

          {/* Jam Kerja/Belajar */}
          <div className="p-4.5 rounded-2xl border border-border bg-background/40 flex items-center justify-between">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Briefcase className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">Pengingat Jam Produktif</h4>
                <p className="text-[10px] text-muted font-light">Kirim pengingat jika membuka media sosial di jam belajar/kerja.</p>
              </div>
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

          {/* Jam Tidur Malam */}
          <div className="p-4.5 rounded-2xl border border-border bg-background/40 flex items-center justify-between">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Moon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">Pengingat Larut Malam</h4>
                <p className="text-[10px] text-muted font-light">Kirim pengingat jika mendeteksi penggunaan HP di jam tidur malam.</p>
              </div>
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

          {/* Sesi Nonstop */}
          <div className="p-4.5 rounded-2xl border border-border bg-background/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <Activity className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">Batas Penggunaan Nonstop</h4>
                  <p className="text-[10px] text-muted font-light">Ingatkan jika membuka HP nonstop tanpa istirahat.</p>
                </div>
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
              <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                <span className="text-[10px] text-muted font-light">Durasi pemakaian nonstop maksimal:</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={continuousMinutes}
                  onChange={(e) => setContinuousMinutes(Number(e.target.value))}
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-primary font-bold text-center focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-muted font-light">Menit</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/40 justify-end">
            {isSaved && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Preferensi berhasil disimpan!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition-all text-xs cursor-pointer shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
