"use client";

import { useState } from "react";
import {
  Briefcase,
  Check,
  Download,
  Info,
  Laptop,
  Moon,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  initialApps,
  initialUserDevices,
  initialUserSettings,
} from "@/lib/data/databaseInitialData";

export default function PerangkatSettingsPage() {
  const settings = initialUserSettings[0];

  // Connection states simulation
  const [androidConnected, setAndroidConnected] = useState(
    initialUserDevices.find((d) => d.platform === "android_app")?.is_connected ?? true
  );
  const [browserConnected, setBrowserConnected] = useState(
    initialUserDevices.find((d) => d.platform === "browser_extension")?.is_connected ?? true
  );

  // Time settings
  const [prodStart, setProdStart] = useState(settings?.productive_start || "08:00");
  const [prodEnd, setProdEnd] = useState(settings?.productive_end || "17:00");
  const [sleepStart, setSleepStart] = useState(settings?.sleep_start || "22:00");
  const [sleepEnd, setSleepEnd] = useState(settings?.sleep_end || "06:00");

  // Tracked apps
  const [trackedApps, setTrackedApps] = useState(
    initialApps.slice(0, 4) // mock first 4 as active
  );
  const [availableAppsToConnect, setAvailableAppsToConnect] = useState(
    initialApps.slice(4) // mock rest as inactives
  );
  const [isAddingApp, setIsAddingApp] = useState(false);

  const handleAddApp = (app: typeof initialApps[0]) => {
    setTrackedApps((prev) => [...prev, app]);
    setAvailableAppsToConnect((prev) => prev.filter((a) => a.id !== app.id));
    setIsAddingApp(false);
  };

  const handleRemoveApp = (id: string) => {
    const appToRemove = trackedApps.find((a) => a.id === id);
    if (appToRemove) {
      setTrackedApps((prev) => prev.filter((a) => a.id !== id));
      setAvailableAppsToConnect((prev) => [...prev, appToRemove]);
    }
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

  return (
    <div className="space-y-8 font-poppins">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-primary">Perangkat & Aplikasi</h2>
        <p className="text-[11px] text-muted font-light mt-0.5">
          Hubungkan gawai pelacak Anda, kelola batasan aplikasi media sosial, dan atur waktu produktif.
        </p>
      </div>

      {/* Perangkat Terhubung */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Perangkat Terhubung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Android App Card */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">Android App</h4>
                  <p className="text-[10px] text-muted font-light leading-normal">Samsung Galaxy S23</p>
                </div>
              </div>
              <div>
                {androidConnected ? (
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                    Terhubung
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                    Terputus
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
              <span className="text-[10px] text-muted font-light">
                {androidConnected ? "Terakhir sinkron: 20 menit lalu" : "Belum tersinkron"}
              </span>
              <button
                type="button"
                onClick={() => setAndroidConnected(!androidConnected)}
                className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
              >
                {androidConnected ? "Putuskan" : "Hubungkan"}
              </button>
            </div>
          </div>

          {/* Browser Extension Card */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">Browser Extension</h4>
                  <p className="text-[10px] text-muted font-light leading-normal">Google Chrome</p>
                </div>
              </div>
              <div>
                {browserConnected ? (
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                    Terhubung
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                    Terputus
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
              <span className="text-[10px] text-muted font-light">
                {browserConnected ? "Terakhir sinkron: 15 menit lalu" : "Belum tersinkron"}
              </span>
              <button
                type="button"
                onClick={() => setBrowserConnected(!browserConnected)}
                className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
              >
                {browserConnected ? "Putuskan" : "Hubungkan"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Aplikasi yang Dipantau */}
      <section className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Aplikasi yang Dipantau</h3>
          <button
            type="button"
            onClick={() => setIsAddingApp(!isAddingApp)}
            className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Aplikasi
          </button>
        </div>

        {/* Modal-like inline selection for adding apps */}
        {isAddingApp && (
          <div className="p-4 border border-primary/20 bg-primary/[0.01] rounded-2xl space-y-3">
            <span className="block text-[10px] font-bold text-muted uppercase">Pilih Aplikasi untuk Ditambahkan</span>
            <div className="flex flex-wrap gap-2">
              {availableAppsToConnect.length === 0 ? (
                <span className="text-xs text-muted font-light">Semua aplikasi sudah dipantau.</span>
              ) : (
                availableAppsToConnect.map((app) => (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => handleAddApp(app)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary hover:border-primary/40 hover:bg-muted-light/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{app.name}</span>
                    <Plus className="w-3 h-3 text-muted" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {trackedApps.map((app) => (
            <div
              key={app.id}
              className="p-3 border border-border bg-background/50 rounded-2xl flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7.5 h-7.5 rounded-lg bg-gradient-to-tr ${getAppColor(
                    app.name
                  )} flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs`}
                >
                  {app.name.substring(0, 2)}
                </div>
                <span className="text-xs font-bold text-primary truncate">{app.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveApp(app.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                aria-label="Remove application"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Target Jam Waktu */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Target Waktu Penggunaan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Jam Belajar / Kerja */}
          <div className="p-5 rounded-2xl border border-border bg-background/40 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
              <Briefcase className="w-4.5 h-4.5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">Jam Belajar / Kerja</h4>
                <p className="text-[10px] text-muted font-light">Mendeteksi distraksi media sosial saat berfokus.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="prod-start-picker" className="block text-[9px] font-bold text-muted uppercase tracking-wider">
                  Jam Mulai
                </label>
                <input
                  id="prod-start-picker"
                  type="time"
                  value={prodStart}
                  onChange={(e) => setProdStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="prod-end-picker" className="block text-[9px] font-bold text-muted uppercase tracking-wider">
                  Jam Selesai
                </label>
                <input
                  id="prod-end-picker"
                  type="time"
                  value={prodEnd}
                  onChange={(e) => setProdEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Jam Tidur */}
          <div className="p-5 rounded-2xl border border-border bg-background/40 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
              <Moon className="w-4.5 h-4.5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">Jam Tidur Malam</h4>
                <p className="text-[10px] text-muted font-light">Mendeteksi aktivitas scroll larut malam sebelum tidur.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="sleep-start-picker" className="block text-[9px] font-bold text-muted uppercase tracking-wider">
                  Jam Mulai
                </label>
                <input
                  id="sleep-start-picker"
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sleep-end-picker" className="block text-[9px] font-bold text-muted uppercase tracking-wider">
                  Jam Selesai
                </label>
                <input
                  id="sleep-end-picker"
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
