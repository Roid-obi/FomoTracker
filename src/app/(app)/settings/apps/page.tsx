"use client";

import { Laptop, Plus, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

interface MonitoredApp {
  id: string;
  name: string;
  platform: "Android" | "Browser" | "Both";
  enabled: boolean;
  category: string;
  color: string;
}

const INITIAL_APPS: MonitoredApp[] = [
  {
    id: "instagram",
    name: "Instagram",
    platform: "Android",
    enabled: true,
    category: "Sosial Media",
    color: "bg-pink-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    platform: "Both",
    enabled: true,
    category: "Sosial Media",
    color: "bg-black",
  },
  {
    id: "youtube",
    name: "YouTube",
    platform: "Browser",
    enabled: true,
    category: "Hiburan",
    color: "bg-red-600",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    platform: "Android",
    enabled: false,
    category: "Chatting",
    color: "bg-green-600",
  },
];

const AVAILABLE_ADD_APPS = [
  {
    id: "x",
    name: "X (Twitter)",
    category: "Sosial Media",
    color: "bg-zinc-800",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Sosial Media",
    color: "bg-blue-600",
  },
  { id: "reddit", name: "Reddit", category: "Diskusi", color: "bg-orange-500" },
];

export default function AppsSettingsPage() {
  const [monitoredApps, setMonitoredApps] =
    useState<MonitoredApp[]>(INITIAL_APPS);
  const [isAdding, setIsAdding] = useState(false);
  const [newAppName, setNewAppName] = useState("x");
  const [newAppPlatform, setNewAppPlatform] = useState<"Android" | "Browser">(
    "Android",
  );

  const handleToggleEnable = (id: string) => {
    setMonitoredApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, enabled: !app.enabled } : app,
      ),
    );
  };

  const handleDeleteApp = (id: string) => {
    setMonitoredApps((prev) => prev.filter((app) => app.id !== id));
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceApp = AVAILABLE_ADD_APPS.find((a) => a.id === newAppName);
    if (!sourceApp) return;

    // Check if already exists on same platform
    const exists = monitoredApps.find(
      (app) =>
        app.id === sourceApp.id &&
        (app.platform === newAppPlatform || app.platform === "Both"),
    );
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

  return (
    <div className="space-y-6 font-poppins">
      {/* Top action and header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-primary">
            Aplikasi Aktif yang Dipantau
          </h3>
          <p className="text-xs text-muted font-light mt-0.5">
            Daftar aplikasi yang dipantau melalui Agen Android atau Ekstensi
            Browser
          </p>
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

      {/* Add app panel */}
      {isAdding && (
        <form
          onSubmit={handleAddApp}
          className="p-5 rounded-3xl border border-border bg-card shadow-sm space-y-4 animate-page-enter"
        >
          <h4 className="font-bold text-xs text-primary uppercase tracking-wider">
            Tambah Pelacakan Baru
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="add-app-select"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
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
              <label
                htmlFor="add-platform-select"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
                Platform Pelacak
              </label>
              <select
                id="add-platform-select"
                value={newAppPlatform}
                onChange={(e) => setNewAppPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none"
              >
                <option value="Android">Android (Usage Stats API)</option>
                <option value="Browser">Browser Extension</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs"
              >
                Tambahkan Pelacakan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tracked Apps Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monitoredApps.map((app) => (
          <div
            key={`${app.id}-${app.platform}`}
            className={`p-5 rounded-3xl border bg-card flex items-center justify-between gap-4 transition-all shadow-xs ${
              app.enabled ? "border-border" : "border-border/60 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 ${app.color}`}
              >
                {app.name.substring(0, 2)}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-primary truncate leading-none">
                    {app.name}
                  </h4>
                  <span className="text-[9px] text-muted bg-muted-light px-1.5 py-0.5 rounded-md font-light leading-none">
                    {app.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Platform Badges */}
                  {(app.platform === "Android" || app.platform === "Both") && (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                      <Smartphone className="w-2.5 h-2.5" />
                      <span>Android</span>
                    </span>
                  )}
                  {(app.platform === "Browser" || app.platform === "Both") && (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md">
                      <Laptop className="w-2.5 h-2.5" />
                      <span>Browser</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Enable Toggle and Trash */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleToggleEnable(app.id)}
                className={`w-10 h-5.5 rounded-full transition-all relative ${
                  app.enabled ? "bg-primary" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-sm ${
                    app.enabled ? "right-0.75" : "left-0.75"
                  }`}
                />
              </button>

              {/* Trash */}
              <button
                type="button"
                onClick={() => handleDeleteApp(app.id)}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                title="Hapus pelacakan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Informational banner about Android Integration */}
      <div className="bg-muted-light/35 border border-border rounded-3xl p-5 flex gap-3.5 items-start">
        <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary font-poppins">
            Catatan Integrasi Seluler
          </h4>
          <p className="text-[11px] text-muted font-light leading-relaxed font-poppins">
            Untuk pelacakan aplikasi seluler (badge Android), pastikan Anda
            telah memasang aplikasi FomoTracker di ponsel Android Anda dan
            memberikan izin "Akses Penggunaan" (Usage Stats API) agar
            sinkronisasi data screen time berjalan otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
