"use client";

import { Briefcase, Check, Laptop, Moon, Plus, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { monitoringSettingsDummy } from "@/lib/databases/dummyData";

interface MonitoredApp {
  id: string;
  name: string;
  platform: "Android" | "Browser" | "Both";
  enabled: boolean;
  category: string;
  color: string;
}

const INITIAL_APPS: MonitoredApp[] = monitoringSettingsDummy.initialApps as MonitoredApp[];
const AVAILABLE_ADD_APPS = monitoringSettingsDummy.availableAddApps;

export default function MonitoringSettingsPage() {
  // App monitoring state
  const [monitoredApps, setMonitoredApps] = useState<MonitoredApp[]>(INITIAL_APPS);
  const [isAdding, setIsAdding] = useState(false);
  const [newAppName, setNewAppName] = useState("x");
  const [newAppPlatform, setNewAppPlatform] = useState<"Android" | "Browser">("Android");

  // Hours monitoring state
  const [productiveStart, setProductiveStart] = useState(monitoringSettingsDummy.hours.productiveStart);
  const [productiveEnd, setProductiveEnd] = useState(monitoringSettingsDummy.hours.productiveEnd);
  const [bedtimeStart, setBedtimeStart] = useState(monitoringSettingsDummy.hours.bedtimeStart);
  const [bedtimeEnd, setBedtimeEnd] = useState(monitoringSettingsDummy.hours.bedtimeEnd);
  const [hoursSaved, setHoursSaved] = useState(false);

  const handleToggleEnable = (id: string) => {
    setMonitoredApps((prev) => prev.map((app) => (app.id === id ? { ...app, enabled: !app.enabled } : app)));
  };

  const handleDeleteApp = (id: string) => {
    setMonitoredApps((prev) => prev.filter((app) => app.id !== id));
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceApp = AVAILABLE_ADD_APPS.find((a) => a.id === newAppName);
    if (!sourceApp) return;

    const exists = monitoredApps.find((app) => app.id === sourceApp.id && (app.platform === newAppPlatform || app.platform === "Both"));
    if (exists) {
      alert("Aplikasi pada platform ini sudah ditambahkan!");
      return;
    }

    const newApp: MonitoredApp = {
      id: sourceApp.id,
      name: sourceApp.name,
      platform: newAppPlatform,
      enabled: true,
      category: sourceApp.category,
      color: sourceApp.color,
    };

    setMonitoredApps((prev) => [...prev, newApp]);
    setIsAdding(false);
  };

  const handleHoursSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHoursSaved(true);
    setTimeout(() => setHoursSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-poppins">
      {/* Left Area (Apps List & Management) - 7 Columns on Large screen */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-primary">Aplikasi Dipantau</h3>
            <p className="text-xs text-muted font-light mt-0.5">Daftar media sosial yang diamati oleh FomoTracker</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aplikasi</span>
          </button>
        </div>

        {/* Add app form panel */}
        {isAdding && (
          <form onSubmit={handleAddApp} className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4 animate-page-enter">
            <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Tambah Pelacakan Baru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="add-app-select" className="block text-[10px] font-semibold text-muted mb-1">
                  Pilih Aplikasi
                </label>
                <select
                  id="add-app-select"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none"
                >
                  {AVAILABLE_ADD_APPS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="add-platform-select" className="block text-[10px] font-semibold text-muted mb-1">
                  Platform
                </label>
                <select
                  id="add-platform-select"
                  value={newAppPlatform}
                  onChange={(e) => setNewAppPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none"
                >
                  <option value="Android">Android App</option>
                  <option value="Browser">Browser Extension</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs">
                  Tambahkan
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Monitored Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {monitoredApps.map((app) => (
            <div
              key={`${app.id}-${app.platform}`}
              className={`p-4 rounded-3xl border bg-card flex items-center justify-between gap-3 transition-all shadow-xs ${app.enabled ? "border-border" : "border-border/60 opacity-60"}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 ${app.color}`}>{app.name.substring(0, 2)}</div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-primary truncate leading-none">{app.name}</h4>
                    <span className="text-[8px] text-muted bg-muted-light px-1 rounded-md font-light leading-none">{app.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(app.platform === "Android" || app.platform === "Both") && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 rounded-md">
                        <Smartphone className="w-2.5 h-2.5" />
                        <span>Android</span>
                      </span>
                    )}
                    {(app.platform === "Browser" || app.platform === "Both") && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-1 rounded-md">
                        <Laptop className="w-2.5 h-2.5" />
                        <span>Browser</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => handleToggleEnable(app.id)} className={`w-9 h-5 rounded-full transition-all relative ${app.enabled ? "bg-primary" : "bg-border"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${app.enabled ? "right-0.75" : "left-0.75"}`} />
                </button>
                <button type="button" onClick={() => handleDeleteApp(app.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer" title="Hapus">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Note */}
        <div className="bg-muted-light/35 border border-border rounded-3xl p-5 flex gap-3.5 items-start">
          <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary">Catatan Integrasi Seluler</h4>
            <p className="text-[11px] text-muted font-light leading-relaxed">
              Untuk pelacakan aplikasi seluler (badge Android), pastikan Anda telah memasang aplikasi FomoTracker di ponsel Android Anda dan memberikan izin "Akses Penggunaan" (Usage Stats API) agar
              sinkronisasi data screen time berjalan otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Right Area (Monitoring Hours Settings) - 5 Columns on Large screen */}
      <div className="lg:col-span-5">
        <form onSubmit={handleHoursSave} className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-primary">Jam Pemantauan</h3>
            <p className="text-xs text-muted font-light mt-0.5">Atur jadwal produktif dan istirahat Anda</p>
          </div>

          <div className="space-y-4">
            {/* Jam Produktif */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted-light/60 text-primary">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary">Jam Produktif</h4>
                  <p className="text-[10px] text-muted font-light">Waktu fokus bekerja atau belajar</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prod-start" className="block text-[10px] font-semibold text-muted mb-1">
                    Mulai Jam
                  </label>
                  <input
                    id="prod-start"
                    type="time"
                    value={productiveStart}
                    onChange={(e) => setProductiveStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="prod-end" className="block text-[10px] font-semibold text-muted mb-1">
                    Selesai Jam
                  </label>
                  <input
                    id="prod-end"
                    type="time"
                    value={productiveEnd}
                    onChange={(e) => setProductiveEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted font-light leading-relaxed">Penggunaan media sosial di jam ini akan memicu notifikasi **Focus Reminder**.</p>
            </div>

            {/* Jam Malam */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted-light/60 text-primary">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary">Jam Malam (Tidur)</h4>
                  <p className="text-[10px] text-muted font-light">Jadwal istirahat reguler Anda</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bedtime-start" className="block text-[10px] font-semibold text-muted mb-1">
                    Mulai Jam
                  </label>
                  <input
                    id="bedtime-start"
                    type="time"
                    value={bedtimeStart}
                    onChange={(e) => setBedtimeStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="bedtime-end" className="block text-[10px] font-semibold text-muted mb-1">
                    Selesai Jam
                  </label>
                  <input
                    id="bedtime-end"
                    type="time"
                    value={bedtimeEnd}
                    onChange={(e) => setBedtimeEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted font-light leading-relaxed">Membuka media sosial di jam ini akan memicu notifikasi **Midnight Alert**.</p>
            </div>
          </div>

          {/* Hours Save button */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            {hoursSaved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Disimpan!
              </span>
            ) : (
              <div className="flex items-center gap-1 text-[9px] text-muted">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Berlaku segera di sesi berikutnya</span>
              </div>
            )}
            <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs shrink-0">
              Simpan Jam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
