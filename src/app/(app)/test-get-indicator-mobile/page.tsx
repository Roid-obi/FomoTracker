"use client";

import { Capacitor } from "@capacitor/core";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Check,
  CheckSquare,
  Clock,
  Database,
  Flame,
  HelpCircle,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkAndRequestUsagePermission,
  fetchInstalledApps,
  type InstalledApp,
  syncUsageStatsClient,
} from "@/lib/capacitor/usageStats";

export default function TestGetIndicatorMobilePage() {
  const [userId, setUserId] = useState("2f57a6f4-7ccb-4f34-bebf-b0d2c4c2f803");
  const [platform, setPlatform] = useState("web");
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  // App Selection State
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // Indicator Calculations & Mock Control
  const [indicatorData, setIndicatorData] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Browser Mock Configurations
  const [mockDurationMin, setMockDurationMin] = useState(75);
  const [mockFrequency, setMockFrequency] = useState(12);
  const [mockMidnightMin, setMockMidnightMin] = useState(15);
  const [mockContinuousMin, setMockContinuousMin] = useState(25);
  const [mockProductiveMin, setMockProductiveMin] = useState(30);

  // Load User, Platform, and Selection on mount
  useEffect(() => {
    setPlatform(Capacitor.getPlatform());

    async function loadUserAndPerms() {
      // TODO: Restore Supabase auth integration when backend is ready
      // For now, using hardcoded userId for testing
      // try {
      //   const { supabase } = await import("@/lib/databases/supabase");
      //   const { data } = await supabase.auth.getUser();
      //   if (data?.user?.id) {
      //     setUserId(data.user.id);
      //   }
      // } catch (e) {
      //   console.error("Failed to load authenticated user:", e);
      // }

      // Check permission
      setIsCheckingPermission(true);
      if (Capacitor.getPlatform() === "android") {
        const perm = await checkAndRequestUsagePermission();
        setHasPermission(perm);
      } else {
        setHasPermission(true); // Always allowed on browser for mock purposes
      }
      setIsCheckingPermission(false);
    }

    loadUserAndPerms();

    // Load selected packages from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fomotracker_monitored_apps");
      if (stored) {
        try {
          setSelectedPackages(JSON.parse(stored));
        } catch (e) {
          console.error("Error loading selected packages:", e);
        }
      }
    }
  }, []);

  // Fetch installed apps list
  const loadApps = async () => {
    setIsLoadingApps(true);
    try {
      const apps = await fetchInstalledApps();
      // Sort alphabetically
      const sorted = [...apps].sort((a, b) =>
        a.appName.localeCompare(b.appName),
      );
      setInstalledApps(sorted);
    } catch (error) {
      console.error("Failed to load apps:", error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [platform]);

  // Handle selection toggling
  const handleToggleApp = (packageName: string) => {
    let updated: string[];
    if (selectedPackages.includes(packageName)) {
      updated = selectedPackages.filter((p) => p !== packageName);
    } else {
      updated = [...selectedPackages, packageName];
    }
    setSelectedPackages(updated);
    localStorage.setItem("fomotracker_monitored_apps", JSON.stringify(updated));
  };

  // Select all launcher apps
  const handleSelectAll = () => {
    const allPkgs = installedApps.map((app) => app.packageName);
    setSelectedPackages(allPkgs);
    localStorage.setItem("fomotracker_monitored_apps", JSON.stringify(allPkgs));
  };

  // Clear selections
  const handleClearSelection = () => {
    setSelectedPackages([]);
    localStorage.removeItem("fomotracker_monitored_apps");
    setIndicatorData([]);
  };

  // Open usage settings on Android
  const requestAndroidPermission = async () => {
    if (platform === "android") {
      setIsCheckingPermission(true);
      const perm = await checkAndRequestUsagePermission();
      setHasPermission(perm);
      setIsCheckingPermission(false);
    }
  };

  // Retrieve & calculate indicators
  const calculateIndicators = async () => {
    if (selectedPackages.length === 0) {
      alert("Pilih minimal satu aplikasi terlebih dahulu!");
      return;
    }

    setIsCalculating(true);
    setSyncStatus(null);

    // Give visual feedback delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (platform !== "android") {
        // Browser/Mock Mode - calculate indicators using web sliders
        const mockResults = selectedPackages.map((pkg) => {
          const appInfo = installedApps.find((a) => a.packageName === pkg);
          const appName = appInfo
            ? appInfo.appName
            : pkg.split(".").pop() || pkg;

          // Introduce a bit of variation based on package name length
          const varianceFactor = (pkg.length % 5) * 0.1 + 0.8; // between 0.8 and 1.2
          const totalDurationSec = Math.floor(
            mockDurationMin * 60 * varianceFactor,
          );
          const openFreq = Math.round(mockFrequency * varianceFactor);
          const midnightSec = Math.floor(
            mockMidnightMin * 60 * (varianceFactor > 1 ? 0.8 : 1.2),
          );
          const continuousSec = Math.floor(
            mockContinuousMin * 60 * (varianceFactor * 0.9),
          );
          const productiveSec = Math.floor(
            mockProductiveMin * 60 * varianceFactor,
          );

          return {
            packageName: pkg,
            appName,
            totalDurationSeconds: totalDurationSec,
            openFrequency: openFreq,
            midnightDurationSeconds: midnightSec,
            maxContinuousSeconds: continuousSec,
            productiveHourDurationSeconds: productiveSec,
          };
        });
        setIndicatorData(mockResults);
      } else {
        // Native Capacitor Integration
        // Dynamically import Capacitor plugins only on Android
        const { analyzeUsageEvents, fetchUsageEvents } = await import(
          "../../../lib/capacitor/usageEvents"
        );
        const { registerPlugin } = await import("@capacitor/core");

        // Define types locally for compilation safety
        interface UsageStatRecord {
          packageName: string;
          totalTimeInForeground: number;
        }
        interface CapacitorUsageStatsPlugin {
          queryAndAggregateUsageStats(options: {
            beginTime: number;
            endTime: number;
          }): Promise<Record<string, UsageStatRecord>>;
        }

        const CapacitorUsageStats = registerPlugin<CapacitorUsageStatsPlugin>(
          "CapacitorUsageStatsManager",
        );

        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        // Get raw aggregated duration today
        const statsRecord =
          await CapacitorUsageStats.queryAndAggregateUsageStats({
            beginTime: startOfDay.getTime(),
            endTime: now.getTime(),
          });

        // Get events for detailed indicators
        const rawEvents = await fetchUsageEvents(
          startOfDay.getTime(),
          now.getTime(),
        );
        const detailedSessions = analyzeUsageEvents(rawEvents);

        // Map outcomes
        const nativeResults = selectedPackages.map((pkg) => {
          const appInfo = installedApps.find((a) => a.packageName === pkg);
          const appName = appInfo
            ? appInfo.appName
            : pkg.split(".").pop() || pkg;

          const stat = statsRecord[pkg];
          const details = detailedSessions[pkg];

          return {
            packageName: pkg,
            appName,
            totalDurationSeconds: stat
              ? Math.floor(stat.totalTimeInForeground / 1000)
              : 0,
            openFrequency: details ? details.frequency : 0,
            midnightDurationSeconds: details
              ? details.midnightDurationSeconds
              : 0,
            maxContinuousSeconds: details ? details.maxContinuousSeconds : 0,
            productiveHourDurationSeconds: details
              ? details.productiveHourDurationSeconds
              : 0,
          };
        });
        setIndicatorData(nativeResults);
      }
    } catch (error: any) {
      console.error("Calculation failed:", error);
      alert(`Gagal kalkulasi data: ${error.message || error}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Sync to database
  const syncToDatabase = async () => {
    if (indicatorData.length === 0) return;

    setIsSyncing(true);
    setSyncStatus(null);

    const statsToSync = indicatorData.map((ind) => ({
      packageName: ind.packageName,
      totalTimeInForeground: ind.totalDurationSeconds * 1000, // back to ms
      openFrequency: ind.openFrequency,
      midnightDurationSeconds: ind.midnightDurationSeconds,
      productiveHourDurationSeconds: ind.productiveHourDurationSeconds,
      maxContinuousSeconds: ind.maxContinuousSeconds,
    }));

    try {
      const response = await syncUsageStatsClient(userId, statsToSync);
      if (response.success) {
        setSyncStatus({
          success: true,
          message: `Berhasil menyinkronkan ${response.count} aplikasi ke database!`,
        });
      } else {
        setSyncStatus({
          success: false,
          message: `Gagal sinkronisasi: ${response.error}`,
        });
      }
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: `Kesalahan koneksi: ${e.message || e}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper formatting durations
  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}d`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remainingSecs}d`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}j ${remainingMins}m`;
  };

  // Filtering apps list based on query
  const filteredApps = installedApps.filter(
    (app) =>
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="space-y-6 font-poppins text-primary"
      id="testing-page-container"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Mobile Indicator Tester
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light mt-1">
            Uji pembacaan data aplikasi mobile (Android) dan kalkulasi indikator
            FoMO.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card shadow-xs text-xs font-semibold text-primary">
          <Smartphone className="w-4 h-4 text-secondary" />
          <span>
            Platform:{" "}
            <span className="uppercase text-secondary">{platform}</span>
          </span>
        </div>
      </div>

      {/* Permission & System Status */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl ${hasPermission ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
            >
              {hasPermission ? (
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              ) : (
                <AlertCircle className="w-6 h-6 animate-bounce" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-primary">
                Izin Akses Penggunaan Aplikasi
              </h3>
              <p className="text-xs text-muted font-light leading-relaxed">
                {hasPermission
                  ? "Izin akses statistik penggunaan (Usage Access) telah diberikan. Aplikasi dapat membaca durasi dan aktivitas."
                  : "Izin akses statistik penggunaan dinonaktifkan. Anda harus mengizinkannya di pengaturan Android agar fitur berjalan."}
              </p>
            </div>
          </div>
          {platform === "android" && !hasPermission && (
            <button
              onClick={requestAndroidPermission}
              disabled={isCheckingPermission}
              className="px-5 py-2.5 rounded-2xl bg-secondary text-white text-xs font-semibold hover:bg-primary transition-all cursor-pointer shadow-xs shrink-0 self-start md:self-center"
            >
              Aktifkan Izin di Settings
            </button>
          )}
        </div>
      </div>

      {/* Grid: App selection and simulation inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: App Selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-primary">
                  1. Pilih Aplikasi
                </h3>
                <p className="text-xs text-muted font-light mt-0.5">
                  Tentukan aplikasi media sosial atau produktivitas yang ingin
                  dipantau.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted-light text-[10px] font-semibold transition-all cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-red-50 text-red-600 hover:border-red-100 text-[10px] font-semibold transition-all cursor-pointer"
                >
                  Hapus Pilihan
                </button>
              </div>
            </div>

            {/* Search and count summary */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari nama aplikasi atau nama paket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-secondary transition-all"
                />
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              </div>
              <button
                onClick={loadApps}
                disabled={isLoadingApps}
                className="p-2.5 rounded-xl border border-border hover:bg-muted-light transition-all cursor-pointer self-stretch sm:self-auto flex items-center justify-center"
                title="Refresh Daftar Aplikasi"
              >
                <RefreshCw
                  className={`w-4 h-4 text-muted ${isLoadingApps ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* Selected Apps Pills */}
            {selectedPackages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-muted-light/60 border border-border/50">
                <span className="text-[10px] font-bold text-muted uppercase self-center px-1.5">
                  Terpilih ({selectedPackages.length}):
                </span>
                {selectedPackages.map((pkg) => {
                  const appObj = installedApps.find(
                    (a) => a.packageName === pkg,
                  );
                  return (
                    <span
                      key={pkg}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-[10px] font-medium"
                    >
                      <span>
                        {appObj ? appObj.appName : pkg.split(".").pop()}
                      </span>
                      <button
                        onClick={() => handleToggleApp(pkg)}
                        className="hover:text-accent font-bold ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* App Grid */}
            <div className="max-h-72 overflow-y-auto border border-border rounded-2xl">
              {isLoadingApps ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
                  <p className="text-xs text-muted font-light">
                    Membaca aplikasi dari mobile...
                  </p>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted font-light">
                  Aplikasi tidak ditemukan.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredApps.map((app) => {
                    const isSelected = selectedPackages.includes(
                      app.packageName,
                    );
                    return (
                      <div
                        key={app.packageName}
                        onClick={() => handleToggleApp(app.packageName)}
                        className={`flex items-center justify-between p-3.5 hover:bg-muted-light/30 transition-all cursor-pointer select-none ${isSelected ? "bg-muted-light/40" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white uppercase shadow-xs ${app.isSystem ? "bg-secondary" : "bg-primary"}`}
                          >
                            {app.appName.substring(0, 2)}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-primary block">
                              {app.appName}
                            </span>
                            <span className="text-[10px] text-muted block truncate font-mono">
                              {app.packageName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.isSystem && (
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-muted-light text-muted uppercase">
                              System
                            </span>
                          )}
                          <div>
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-secondary" />
                            ) : (
                              <Square className="w-5 h-5 text-border hover:text-muted" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mock Web Simulators (Only displays if on Web browser) */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-primary flex items-center gap-1.5">
                <span>Web Simulator Panel</span>
                <span title="Gunakan slider ini untuk mengatur data simulasi pada browser sebelum menekan Ambil Data.">
                  <HelpCircle className="w-4 h-4 text-muted cursor-help" />
                </span>
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                {platform !== "android"
                  ? "Atur nilai simulasi Android OS di bawah ini untuk mensimulasikan hasil pengujian."
                  : "Slider dinonaktifkan di mobile karena aplikasi langsung menggunakan data riil dari sistem Android."}
              </p>
            </div>

            {/* Simulators Form */}
            <div className="space-y-3.5 pt-2">
              {/* Duration Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Total Durasi
                  </span>
                  <span className="text-primary font-bold">
                    {mockDurationMin} menit
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="480"
                  disabled={platform === "android"}
                  value={mockDurationMin}
                  onChange={(e) => setMockDurationMin(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Frequency Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Frekuensi Buka
                  </span>
                  <span className="text-primary font-bold">
                    {mockFrequency} kali
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  disabled={platform === "android"}
                  value={mockFrequency}
                  onChange={(e) => setMockFrequency(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Midnight Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5" /> Durasi Malam Hari
                  </span>
                  <span className="text-primary font-bold">
                    {mockMidnightMin} menit
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={mockDurationMin}
                  disabled={platform === "android"}
                  value={mockMidnightMin}
                  onChange={(e) =>
                    setMockMidnightMin(
                      Math.min(Number(e.target.value), mockDurationMin),
                    )
                  }
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Continuous Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Durasi Tanpa Jeda
                  </span>
                  <span className="text-primary font-bold">
                    {mockContinuousMin} menit
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={mockDurationMin}
                  disabled={platform === "android"}
                  value={mockContinuousMin}
                  onChange={(e) =>
                    setMockContinuousMin(
                      Math.min(Number(e.target.value), mockDurationMin),
                    )
                  }
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Productive Hour Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Jam Produktif
                  </span>
                  <span className="text-primary font-bold">
                    {mockProductiveMin} menit
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={mockDurationMin}
                  disabled={platform === "android"}
                  value={mockProductiveMin}
                  onChange={(e) =>
                    setMockProductiveMin(
                      Math.min(Number(e.target.value), mockDurationMin),
                    )
                  }
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 & 3: Results Display */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-primary">
              2. Hasil Kalkulasi Indikator
            </h3>
            <p className="text-xs text-muted font-light mt-0.5">
              Tekan tombol di samping untuk mengambil dan menguji kalkulasi
              indikator.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={calculateIndicators}
              disabled={isCalculating || selectedPackages.length === 0}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengkalkulasi...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Ambil Data Indikator</span>
                </>
              )}
            </button>

            {indicatorData.length > 0 && (
              <button
                onClick={syncToDatabase}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-accent text-primary text-xs font-semibold hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-accent-hover/30"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Sinkron ke Database</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sync Toast Status */}
        {syncStatus && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              syncStatus.success
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{syncStatus.message}</span>
          </div>
        )}

        {/* Indicator Cards List */}
        {indicatorData.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted font-light">
            Belum ada data indikator. Silakan pilih aplikasi dan tekan tombol
            "Ambil Data Indikator".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicatorData.map((data) => (
              <div
                key={data.packageName}
                className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:border-secondary transition-all group"
              >
                {/* Header app */}
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-black uppercase">
                    {data.appName.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      {data.appName}
                    </h4>
                    <p className="text-[10px] text-muted font-mono">
                      {data.packageName}
                    </p>
                  </div>
                </div>

                {/* Grid indicators (5 metrics) */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Usage Duration */}
                  <div className="p-3 rounded-xl bg-muted-light/40 border border-border/40 space-y-1">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Usage Duration</span>
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {formatDuration(data.totalDurationSeconds)}
                    </p>
                  </div>

                  {/* Open Frequency */}
                  <div className="p-3 rounded-xl bg-muted-light/40 border border-border/40 space-y-1">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Open Frequency</span>
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {data.openFrequency} kali
                    </p>
                  </div>

                  {/* Midnight Usage */}
                  <div className="p-3 rounded-xl bg-muted-light/40 border border-border/40 space-y-1">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Midnight Usage</span>
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {formatDuration(data.midnightDurationSeconds)}
                    </p>
                  </div>

                  {/* Continuous Usage */}
                  <div className="p-3 rounded-xl bg-muted-light/40 border border-border/40 space-y-1">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>Continuous Usage</span>
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {formatDuration(data.maxContinuousSeconds)}
                    </p>
                  </div>

                  {/* Productivity Hour Usage */}
                  <div className="p-3 rounded-xl bg-muted-light/40 border border-border/40 space-y-1 col-span-2">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>Productivity Hour Usage</span>
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {formatDuration(data.productiveHourDurationSeconds)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
