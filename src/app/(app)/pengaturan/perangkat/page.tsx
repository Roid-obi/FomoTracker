"use client";

import {
  Briefcase,
  Globe,
  Info,
  Laptop,
  Moon,
  Plus,
  Search,
  Settings,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  initialUserDevices,
  initialUserSettings,
} from "@/lib/data/databaseInitialData";

// Static mock list representing all apps installed on the Android device
const ALL_INSTALLED_ANDROID_APPS = [
  { id: "app-ig", name: "Instagram", packageName: "com.instagram.android" },
  { id: "app-tt", name: "TikTok", packageName: "com.zhiliaoapp.musically" },
  { id: "app-yt", name: "YouTube", packageName: "com.google.android.youtube" },
  { id: "app-wa", name: "WhatsApp", packageName: "com.whatsapp" },
  { id: "app-fb", name: "Facebook", packageName: "com.facebook.katana" },
  { id: "app-tw", name: "X (Twitter)", packageName: "com.twitter.android" },
  { id: "app-rd", name: "Reddit", packageName: "com.reddit.frontpage" },
  { id: "app-dc", name: "Discord", packageName: "com.discord" },
  { id: "app-sp", name: "Spotify", packageName: "com.spotify.music" },
  { id: "app-nf", name: "Netflix", packageName: "com.netflix.mediaclient" },
  {
    id: "app-sl",
    name: "Slack",
    packageName: "com.tinyspeck.slacksoftmobilesapk",
  },
  { id: "app-ch", name: "Chrome", packageName: "com.android.chrome" },
];

export default function PerangkatSettingsPage() {
  const settings = initialUserSettings[0];

  // Device connection states
  const [androidConnected, setAndroidConnected] = useState(
    initialUserDevices.find((d) => d.platform === "android_app")
      ?.is_connected ?? true,
  );
  const [browserConnected, setBrowserConnected] = useState(
    initialUserDevices.find((d) => d.platform === "browser_extension")
      ?.is_connected ?? true,
  );

  // Time settings
  const [prodStart, setProdStart] = useState(
    settings?.productive_start || "08:00",
  );
  const [prodEnd, setProdEnd] = useState(settings?.productive_end || "17:00");
  const [sleepStart, setSleepStart] = useState(
    settings?.sleep_start || "22:00",
  );
  const [sleepEnd, setSleepEnd] = useState(settings?.sleep_end || "06:00");

  // Monitored Android App IDs (state of IDs selected for tracking)
  const [monitoredAppIds, setMonitoredAppIds] = useState<string[]>([
    "app-ig",
    "app-tt",
    "app-yt",
    "app-wa",
  ]);

  // Search and selector panel states
  const [isAddingAndroidApp, setIsAddingAndroidApp] = useState(false);
  const [androidSearch, setAndroidSearch] = useState("");

  // Browser Extension URL Rules state
  const [webUrls, setWebUrls] = useState([
    { id: "web-yt", name: "YouTube", url: "youtube.com" },
    { id: "web-ig", name: "Instagram", url: "instagram.com" },
    { id: "web-fb", name: "Facebook", url: "facebook.com" },
  ]);

  // Form states for adding web URL
  const [newWebName, setNewWebName] = useState("");
  const [newWebUrl, setNewWebUrl] = useState("");

  const handleAddAndroidApp = (id: string) => {
    if (!monitoredAppIds.includes(id)) {
      setMonitoredAppIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveAndroidApp = (id: string) => {
    setMonitoredAppIds((prev) => prev.filter((appId) => appId !== id));
  };

  const handleAddWebUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebName.trim() || !newWebUrl.trim()) return;

    // Normalize URL
    let url = newWebUrl.trim().toLowerCase();
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "");

    const newRule = {
      id: `web-${Date.now()}`,
      name: newWebName.trim(),
      url: url,
    };

    setWebUrls((prev) => [...prev, newRule]);
    setNewWebName("");
    setNewWebUrl("");
  };

  const handleDeleteWebUrl = (id: string) => {
    setWebUrls((prev) => prev.filter((item) => item.id !== id));
  };

  const getAppGradient = (name: string) => {
    switch (name.toLowerCase()) {
      case "instagram":
        return "from-pink-500 to-purple-600";
      case "tiktok":
        return "from-slate-800 to-black";
      case "youtube":
        return "from-red-500 to-red-600";
      case "whatsapp":
        return "from-green-400 to-emerald-600";
      case "facebook":
        return "from-blue-600 to-blue-800";
      case "x (twitter)":
        return "from-neutral-700 to-black";
      case "reddit":
        return "from-orange-500 to-red-600";
      case "discord":
        return "from-indigo-500 to-indigo-700";
      case "spotify":
        return "from-emerald-400 to-green-600";
      case "netflix":
        return "from-red-600 to-black";
      case "slack":
        return "from-purple-500 to-indigo-600";
      case "chrome":
        return "from-blue-400 via-yellow-400 to-red-500";
      default:
        return "from-secondary to-primary";
    }
  };

  // Get currently monitored apps objects
  const monitoredApps = ALL_INSTALLED_ANDROID_APPS.filter((app) =>
    monitoredAppIds.includes(app.id),
  );

  // Filter available apps from the full list for selection
  const availableAppsToSelect = ALL_INSTALLED_ANDROID_APPS.filter(
    (app) =>
      !monitoredAppIds.includes(app.id) &&
      app.name.toLowerCase().includes(androidSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8 font-poppins">
      {/* Sub Header */}
      <div>
        <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted" />
          <span>Perangkat & Pelacakan</span>
        </h2>
        <p className="text-[11px] text-muted font-light mt-0.5">
          Hubungkan perangkat pemantau gawai Anda, kelola batasan aplikasi media
          sosial, dan atur rentang waktu pelacakan.
        </p>
      </div>

      {/* Perangkat Terhubung */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
          Koneksi Perangkat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Android App Card */}
          <div className="p-5 rounded-3xl border border-border bg-background/50 flex flex-col justify-between h-40 hover:border-primary/10 hover:shadow-xs transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">
                    Android Application
                  </h4>
                  <p className="text-[10px] text-muted font-light leading-normal">
                    Samsung Galaxy S23
                  </p>
                </div>
              </div>
              <div>
                {androidConnected ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Connected
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Disconnected
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
              <span className="text-[10px] text-muted font-light">
                {androidConnected
                  ? "Terakhir sinkron: 20 menit lalu"
                  : "Belum tersinkron"}
              </span>
              <button
                type="button"
                onClick={() => setAndroidConnected(!androidConnected)}
                className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  androidConnected
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                {androidConnected ? "Putuskan" : "Hubungkan"}
              </button>
            </div>
          </div>

          {/* Browser Extension Card */}
          <div className="p-5 rounded-3xl border border-border bg-background/50 flex flex-col justify-between h-40 hover:border-primary/10 hover:shadow-xs transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-sky-700 flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-primary">
                    Browser Extension
                  </h4>
                  <p className="text-[10px] text-muted font-light leading-normal">
                    Google Chrome
                  </p>
                </div>
              </div>
              <div>
                {browserConnected ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Connected
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Disconnected
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
              <span className="text-[10px] text-muted font-light">
                {browserConnected
                  ? "Terakhir sinkron: 15 menit lalu"
                  : "Belum tersinkron"}
              </span>
              <button
                type="button"
                onClick={() => setBrowserConnected(!browserConnected)}
                className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  browserConnected
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                {browserConnected ? "Putuskan" : "Hubungkan"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Notice if both disconnected */}
      {!androidConnected && !browserConnected && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-amber-800 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold">Semua Perangkat Terputus</h4>
            <p className="text-[10px] text-amber-700 font-light leading-relaxed">
              Hubungkan salah satu gawai di atas untuk mulai memantau dan
              menganalisis aktivitas harian Anda.
            </p>
          </div>
        </div>
      )}

      {/* ── ANDROID SETTINGS SECTION (Conditional) ── */}
      <section className="space-y-4 p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 gap-2">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-primary">
                Aplikasi Android yang Dipantau
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {androidConnected ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.2 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    API Android Terdeteksi
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.2 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    API Android Tidak Terdeteksi
                  </span>
                )}
              </div>
            </div>
          </div>

          {androidConnected && (
            <button
              type="button"
              onClick={() => setIsAddingAndroidApp(!isAddingAndroidApp)}
              className="text-[11px] font-bold text-secondary bg-muted-light/60 hover:bg-muted-light border border-border px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors self-start sm:self-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aplikasi</span>
            </button>
          )}
        </div>

        {/* 1. Android Not Connected Warning */}
        {!androidConnected && (
          <div className="text-center p-8 border border-dashed border-border rounded-2xl bg-background/30 text-xs text-muted">
            Status API Android terputus. Silakan hubungkan perangkat Samsung
            Galaxy S23 Anda untuk mengimpor dan memilih aplikasi pemantauan.
          </div>
        )}

        {/* 2. Android Connected & Adding App Selector Panel */}
        {androidConnected && isAddingAndroidApp && (
          <div className="p-4 sm:p-5 border border-primary/20 bg-primary/[0.01] rounded-2xl space-y-4 animate-page-enter">
            <div className="flex justify-between items-center">
              <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">
                Pilih Aplikasi dari Device Android
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAndroidApp(false);
                  setAndroidSearch("");
                }}
                className="p-1 rounded-lg hover:bg-muted-light text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Searchbar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari aplikasi terpasang (misal: Spotify, Netflix, Discord)..."
                value={androidSearch}
                onChange={(e) => setAndroidSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-primary font-bold focus:outline-none focus:border-primary placeholder:font-light"
              />
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableAppsToSelect.length === 0 ? (
                <div className="col-span-full text-center py-6 text-xs text-muted font-light">
                  {androidSearch
                    ? "Aplikasi tidak ditemukan"
                    : "Semua aplikasi terpasang sudah ditambahkan ke daftar pantau."}
                </div>
              ) : (
                availableAppsToSelect.map((app) => (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => handleAddAndroidApp(app.id)}
                    className="p-2.5 border border-border bg-card hover:bg-muted-light/20 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7.5 h-7.5 rounded-lg bg-gradient-to-tr ${getAppGradient(
                          app.name,
                        )} flex items-center justify-center text-white text-[8px] font-bold shrink-0 shadow-2xs`}
                      >
                        {app.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-primary block truncate">
                          {app.name}
                        </span>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-muted shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. Currently Monitored Android Apps Grid */}
        {androidConnected && (
          <div className="space-y-2">
            {monitoredApps.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-2xl bg-background/20 text-xs text-muted">
                Belum ada aplikasi yang dipilih untuk dipantau. Klik "Tambah
                Aplikasi" di atas.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {monitoredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 border border-border bg-background/50 rounded-2xl flex items-center justify-between gap-3 shadow-3xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7.5 h-7.5 rounded-lg bg-gradient-to-tr ${getAppGradient(
                          app.name,
                        )} flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs`}
                      >
                        {app.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-primary block truncate">
                          {app.name}
                        </span>
                        <span className="text-[8px] text-muted block truncate font-light">
                          {app.packageName}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAndroidApp(app.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                      aria-label="Remove application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── BROWSER EXTENSION SETTINGS SECTION (Conditional) ── */}
      {browserConnected && (
        <section className="space-y-4 p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-2xs">
          <div className="flex items-start gap-3 border-b border-border/40 pb-3">
            <Globe className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-primary">
                Alamat Web (URL) yang Dipantau
              </h3>
              <p className="text-[10px] text-muted font-light mt-0.5">
                Ketik alamat domain situs (contoh:{" "}
                <strong className="text-primary">youtube.com</strong>) dan beri
                nama label pelacakan untuk memantau waktu akses:
              </p>
            </div>
          </div>

          {/* Form to add URL */}
          <form
            onSubmit={handleAddWebUrl}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div className="space-y-1">
              <label
                htmlFor="web-name-input"
                className="block text-[9px] font-bold text-muted uppercase tracking-wider"
              >
                Nama Website / Label
              </label>
              <input
                id="web-name-input"
                type="text"
                placeholder="misal: YouTube"
                value={newWebName}
                onChange={(e) => setNewWebName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-primary font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="web-url-input"
                className="block text-[9px] font-bold text-muted uppercase tracking-wider"
              >
                Alamat URL Website
              </label>
              <input
                id="web-url-input"
                type="text"
                placeholder="misal: youtube.com"
                value={newWebUrl}
                onChange={(e) => setNewWebUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-primary font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-secondary text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah URL</span>
            </button>
          </form>

          {/* List of tracked URLs */}
          <div className="space-y-2">
            <span className="block text-[9px] font-bold text-muted uppercase tracking-wider">
              Daftar Domain Aktif Pelacakan
            </span>
            <div className="flex flex-wrap gap-2.5">
              {webUrls.length === 0 ? (
                <div className="text-[11px] text-muted font-light p-3 border border-dashed border-border rounded-xl w-full text-center">
                  Belum ada URL pemantauan terdaftar. Silakan tambahkan lewat
                  form di atas.
                </div>
              ) : (
                webUrls.map((web) => (
                  <div
                    key={web.id}
                    className="pl-3.5 pr-2 py-1.5 rounded-xl border border-border bg-background/50 flex items-center gap-3 shadow-3xs group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-xs font-bold text-primary">
                        {web.name}
                      </span>
                      <span className="text-[10px] text-muted font-mono font-light bg-muted-light/40 border border-border/40 px-1.5 py-0.5 rounded-md">
                        {web.url}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWebUrl(web.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      aria-label={`Remove URL tracking for ${web.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Target Jam Waktu */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
          Target Jam Pemakaian
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Jam Belajar / Kerja */}
          <div className="p-5 rounded-3xl border border-border bg-background/40 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
              <Briefcase className="w-4.5 h-4.5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">
                  Jam Belajar / Kerja
                </h4>
                <p className="text-[10px] text-muted font-light">
                  Mendeteksi distraksi media sosial saat berfokus.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="prod-start-picker"
                  className="block text-[9px] font-bold text-muted uppercase tracking-wider"
                >
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
                <label
                  htmlFor="prod-end-picker"
                  className="block text-[9px] font-bold text-muted uppercase tracking-wider"
                >
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
          <div className="p-5 rounded-3xl border border-border bg-background/40 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
              <Moon className="w-4.5 h-4.5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">
                  Jam Tidur Malam
                </h4>
                <p className="text-[10px] text-muted font-light">
                  Mendeteksi aktivitas scroll larut malam sebelum tidur.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="sleep-start-picker"
                  className="block text-[9px] font-bold text-muted uppercase tracking-wider"
                >
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
                <label
                  htmlFor="sleep-end-picker"
                  className="block text-[9px] font-bold text-muted uppercase tracking-wider"
                >
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
