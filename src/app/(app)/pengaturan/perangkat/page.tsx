"use client";

import { Capacitor, registerPlugin } from "@capacitor/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
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
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import {
  checkAndRequestUsagePermission,
  fetchInstalledApps,
  type InstalledApp,
} from "@/lib/capacitor/usageStats";
import type {
  DeviceModel,
  SettingModel,
  TrackedAppModel,
} from "@/lib/models/setting.model";
import { api } from "@/lib/utils/api";

export default function PerangkatSettingsPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  // Search and selector panel states
  const [isAddingAndroidApp, setIsAddingAndroidApp] = useState(false);
  const [androidSearch, setAndroidSearch] = useState("");

  // Platform detection & permission states
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [realDeviceName, setRealDeviceName] = useState("Perangkat Android");

  // Time settings local state
  const [prodStart, setProdStart] = useState("08:00");
  const [prodEnd, setProdEnd] = useState("17:00");
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("06:00");

  // Browser Extension URL Rules state (Syncs with extension)
  const [webUrls, setWebUrls] = useState<
    { id: string; name?: string; url: string; enabled?: boolean }[]
  >([]);

  // Form states for adding web URL
  const [newWebName, setNewWebName] = useState("");
  const [newWebUrl, setNewWebUrl] = useState("");

  // Sync rules with extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "FOMOTRACKER_RULES_DATA") {
        setWebUrls(event.data.rules || []);
      } else if (event.data && event.data.type === "FOMOTRACKER_SYNC_SUCCESS") {
        // Successfully synced
      }
    };

    window.addEventListener("message", handleMessage);

    // Request initial data from extension after a slight delay
    const timer = setTimeout(() => {
      window.postMessage({ type: "FOMOTRACKER_GET_RULES" }, "*");
    }, 500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, []);

  // 1. Fetch User Settings
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: SettingModel.getResponse;
      }>("/api/setting/user");
      return res.data.data;
    },
  });

  // Initialize time picker values once data is fetched
  useEffect(() => {
    if (settingsData) {
      setProdStart(settingsData.productiveStart || "08:00");
      setProdEnd(settingsData.productiveEnd || "17:00");
      setSleepStart(settingsData.sleepStart || "22:00");
      setSleepEnd(settingsData.sleepEnd || "06:00");
    }
  }, [settingsData]);

  // 2. Fetch User Devices
  const { data: devicesData, isLoading: isDevicesLoading } = useQuery({
    queryKey: ["userDevices"],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: DeviceModel.getResponse[];
      }>("/api/setting/device");
      return res.data.data;
    },
  });

  // 3. Fetch User Tracked Apps
  const { data: trackedAppsData, isLoading: isTrackedAppsLoading } = useQuery({
    queryKey: ["trackedApps"],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: TrackedAppModel.getResponse[];
      }>("/api/setting/tracked-app");
      return res.data.data;
    },
  });

  // 4. Fetch Available Master Apps
  const { data: availableAppsData } = useQuery({
    queryKey: ["availableApps"],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: TrackedAppModel.appResponse[];
      }>("/api/setting/tracked-app?available=true");
      return res.data.data;
    },
  });

  // Detect platform and fetch installed apps
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isAndroid = platform === "android";
    setIsAndroidDevice(isAndroid);

    if (isAndroid) {
      const CapacitorUsageStatsManager = registerPlugin<any>(
        "CapacitorUsageStatsManager",
      );
      if (CapacitorUsageStatsManager?.getDeviceInfo) {
        CapacitorUsageStatsManager.getDeviceInfo()
          .then((info: any) => {
            if (info?.deviceName) {
              setRealDeviceName(info.deviceName);
            }
          })
          .catch((e: any) => {
            console.error("Failed to get native device info:", e);
          });
      }
      checkAndRequestUsagePermission().then((granted) => {
        setHasPermission(granted);
        if (granted) {
          fetchInstalledApps().then((apps) => {
            setInstalledApps(apps);
          });
        }
      });
    } else {
      // For browser/development environments, do not load any apps since API is not detected
      setInstalledApps([]);
    }
  }, []);

  // Request Android usage stats permission explicitly
  const handleRequestPermission = async () => {
    const granted = await checkAndRequestUsagePermission();
    setHasPermission(granted);
    if (granted) {
      const apps = await fetchInstalledApps();
      setInstalledApps(apps);
      gooeyToast.success("Akses data penggunaan berhasil diaktifkan!");
    } else {
      gooeyToast.error(
        "Izin data penggunaan ditolak. Silakan aktifkan di Pengaturan Android Anda.",
      );
    }
  };

  // Device Mutation (Connect / Disconnect)
  const deviceMutation = useMutation({
    mutationFn: async ({
      platform,
      isConnected,
      deviceName,
      browserName,
    }: {
      platform: string;
      isConnected: boolean;
      deviceName?: string;
      browserName?: string;
    }) => {
      const res = await api.put<{
        success: boolean;
        data: DeviceModel.getResponse;
      }>("/api/setting/device", {
        platform,
        isConnected,
        deviceName,
        browserName,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["userDevices"] });
        gooeyToast.success("Status koneksi perangkat berhasil diubah!");
      }
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        apiError.response?.data?.error || "Gagal mengubah status koneksi.";
      gooeyToast.error(errorMsg);
    },
  });

  // Tracked App Mutation (Add / Remove)
  const trackAppMutation = useMutation({
    mutationFn: async ({
      appId,
      packageName,
      name,
      isActive,
    }: {
      appId?: string;
      packageName?: string;
      name?: string;
      isActive: boolean;
    }) => {
      const res = await api.post<{
        success: boolean;
        data: TrackedAppModel.getResponse;
      }>("/api/setting/tracked-app", {
        appId,
        packageName,
        name,
        isActive,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Update localStorage monitored apps list
        let currentApps: string[] = [];
        const stored = window.localStorage.getItem(
          "fomotracker_monitored_apps",
        );
        if (stored) {
          try {
            currentApps = JSON.parse(stored);
          } catch (e) {}
        }

        if (variables.packageName) {
          if (variables.isActive) {
            if (!currentApps.includes(variables.packageName)) {
              currentApps.push(variables.packageName);
            }
          } else {
            currentApps = currentApps.filter(
              (pkg) => pkg !== variables.packageName,
            );
          }
          window.localStorage.setItem(
            "fomotracker_monitored_apps",
            JSON.stringify(currentApps),
          );
        }

        queryClient.invalidateQueries({ queryKey: ["trackedApps"] });
        gooeyToast.success("Daftar aplikasi dipantau diperbarui!");

        // Trigger immediate sync on Android if adding an app
        if (
          variables.isActive &&
          user &&
          Capacitor.getPlatform() === "android"
        ) {
          import("@/lib/capacitor/usageStats").then(
            ({ fetchAndSyncUsageData }) => {
              fetchAndSyncUsageData(user.id)
                .then((result) => {
                  console.log("Immediate usage data sync result:", result);
                  queryClient.invalidateQueries({
                    queryKey: ["dashboard-screentime"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["dashboard-breakdown"],
                  });
                })
                .catch((err) => {
                  console.error("Immediate sync failed:", err);
                });
            },
          );
        }
      }
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        apiError.response?.data?.error ||
        "Gagal memperbarui aplikasi dipantau.";
      gooeyToast.error(errorMsg);
    },
  });

  // User Settings Mutation (Hours settings)
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      productiveStart: string;
      productiveEnd: string;
      sleepStart: string;
      sleepEnd: string;
    }) => {
      const res = await api.put<{
        success: boolean;
        data: SettingModel.getResponse;
      }>("/api/setting/user", payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["userSettings"] });
        gooeyToast.success("Target jam pemakaian berhasil disimpan!");
      }
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        apiError.response?.data?.error || "Gagal menyimpan jam pemakaian.";
      gooeyToast.error(errorMsg);
    },
  });

  // Extract connection states
  const androidDevice = devicesData?.find((d) => d.platform === "android_app");
  const browserDevice = devicesData?.find(
    (d) => d.platform === "browser_extension",
  );

  const androidConnected = androidDevice?.isConnected ?? false;
  const browserConnected = browserDevice?.isConnected ?? false;

  // Send user and device info to extension
  useEffect(() => {
    if (user?.id && browserDevice?.id && browserConnected) {
      window.postMessage(
        {
          type: "FOMOTRACKER_SET_USER_INFO",
          userId: user.id,
          deviceId: browserDevice.id,
        },
        "*",
      );
    }
  }, [user?.id, browserDevice?.id, browserConnected]);

  // Handlers
  const handleAddAndroidApp = (name: string, packageName: string) => {
    trackAppMutation.mutate({ name, packageName, isActive: true });
  };

  const handleRemoveAndroidApp = (appId: string) => {
    trackAppMutation.mutate({ appId, isActive: false });
  };

  const handleToggleBrowserExtension = () => {
    if (browserConnected) {
      deviceMutation.mutate({
        platform: "browser_extension",
        isConnected: false,
        browserName: "Google Chrome",
      });
    } else {
      // Deteksi apakah extension sudah terinstall (mock via window object atau DOM)
      // Dalam implementasi nyata, extension akan menyuntikkan script/variabel global ini.
      const isExtensionInstalled =
        typeof window !== "undefined" &&
        ((window as any).__FOMOTRACKER_EXTENSION_INSTALLED__ ||
          document.getElementById("fomotracker-extension-root"));

      if (isExtensionInstalled) {
        deviceMutation.mutate({
          platform: "browser_extension",
          isConnected: true,
          browserName: "Google Chrome",
        });
      } else {
        gooeyToast.error("Browser Extension belum terinstall!");
        window.open("/instalasi?tab=extension", "_blank");
      }
    }
  };

  const handleSaveUserSettings = () => {
    updateSettingsMutation.mutate({
      productiveStart: prodStart,
      productiveEnd: prodEnd,
      sleepStart: sleepStart,
      sleepEnd: sleepEnd,
    });
  };

  const handleAddWebUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebName.trim() || !newWebUrl.trim()) return;

    let url = newWebUrl.trim().toLowerCase();
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "");

    const newRule = {
      id: `web-${Date.now()}`,
      name: newWebName.trim(),
      url: url,
      enabled: true,
    };

    const updatedRules = [...webUrls, newRule];
    setWebUrls(updatedRules);
    window.postMessage(
      { type: "FOMOTRACKER_SYNC_RULES", rules: updatedRules },
      "*",
    );

    setNewWebName("");
    setNewWebUrl("");
    gooeyToast.success(
      "Domain pemantauan berhasil ditambahkan dan disinkronkan ke Ekstensi!",
    );
  };

  const handleDeleteWebUrl = (id: string) => {
    const updatedRules = webUrls.filter((item) => item.id !== id);
    setWebUrls(updatedRules);
    window.postMessage(
      { type: "FOMOTRACKER_SYNC_RULES", rules: updatedRules },
      "*",
    );
    gooeyToast.success("Domain pemantauan dihapus.");
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
      case "x":
      case "twitter":
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
  const monitoredApps = (trackedAppsData ?? []).filter((app) => app.isActive);

  // Filter installed apps from the device that are NOT currently monitored
  const availableInstalledAppsToSelect = installedApps.filter(
    (installedApp) => {
      const isAlreadyMonitored = monitoredApps.some(
        (monitored) => monitored.packageName === installedApp.packageName,
      );
      return !isAlreadyMonitored;
    },
  );

  const filteredAvailableAppsToSelect = availableInstalledAppsToSelect.filter(
    (app) => app.appName.toLowerCase().includes(androidSearch.toLowerCase()),
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
        {isDevicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {/* Skeleton 1 */}
            <div className="p-5 rounded-3xl border border-border bg-background/50 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-muted-light/60 border border-border/40 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-muted-light rounded w-32" />
                    <div className="h-3 bg-muted-light rounded w-20" />
                  </div>
                </div>
                <div className="w-16 h-5 bg-muted-light/60 rounded-full animate-pulse" />
              </div>
              <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
                <div className="h-3 bg-muted-light rounded w-36" />
                <div className="w-20 h-6 bg-muted-light/60 rounded-xl" />
              </div>
            </div>
            {/* Skeleton 2 */}
            <div className="p-5 rounded-3xl border border-border bg-background/50 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-muted-light/60 border border-border/40 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-muted-light rounded w-32" />
                    <div className="h-3 bg-muted-light rounded w-20" />
                  </div>
                </div>
                <div className="w-16 h-5 bg-muted-light/60 rounded-full animate-pulse" />
              </div>
              <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
                <div className="h-3 bg-muted-light rounded w-36" />
                <div className="w-20 h-6 bg-muted-light/60 rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
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
                      {androidConnected
                        ? androidDevice?.deviceName || "Perangkat Android"
                        : "Belum ditautkan"}
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
                    ? androidDevice?.lastSyncedAt
                      ? `Terakhir sinkron: ${new Date(androidDevice.lastSyncedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                      : "Terakhir sinkron: Baru saja"
                    : "Belum tersinkron"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    deviceMutation.mutate({
                      platform: "android_app",
                      isConnected: !androidConnected,
                      deviceName: realDeviceName,
                    })
                  }
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
                      {browserConnected
                        ? browserDevice?.browserName || "Google Chrome"
                        : "Belum ditautkan"}
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
                    ? browserDevice?.lastSyncedAt
                      ? `Terakhir sinkron: ${new Date(browserDevice.lastSyncedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                      : "Terakhir sinkron: Baru saja"
                    : "Belum tersinkron"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    deviceMutation.mutate({
                      platform: "browser_extension",
                      isConnected: !browserConnected,
                      browserName: "Google Chrome",
                    })
                  }
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
        )}
      </section>

      {/* Warning Notice if both disconnected */}
      {!isDevicesLoading && !androidConnected && !browserConnected && (
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

      {/* Warning Notice if not running inside Android App */}
      {!isAndroidDevice && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-amber-800 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold">API Android Tidak Terdeteksi</h4>
            <p className="text-[10px] text-amber-700 font-light leading-relaxed">
              Sistem mendeteksi Anda mengakses halaman ini dari browser/web.
              Pastikan aplikasi FomoTracker terinstal di perangkat Android Anda,
              dan izin statistik penggunaan (Usage Stats) telah diaktifkan agar
              pelacakan berjalan otomatis.
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
                {isAndroidDevice ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.2 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    API Android Terdeteksi
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    API Android Tidak Terdeteksi
                  </span>
                )}
              </div>
            </div>
          </div>

          {androidConnected && isAndroidDevice && (
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

        {isDevicesLoading || isTrackedAppsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 border border-border bg-background/50 rounded-2xl flex items-center justify-between gap-3 shadow-3xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7.5 h-7.5 rounded-lg bg-muted-light/60 border border-border/40 shrink-0" />
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="h-3 bg-muted-light rounded w-16" />
                    <div className="h-2 bg-muted-light rounded w-24" />
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-muted-light/60 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 1. Android Not Connected Warning */}
            {!androidConnected && (
              <div className="text-center p-8 border border-dashed border-border rounded-2xl bg-background/30 text-xs text-muted">
                Status API Android terputus. Silakan hubungkan perangkat Android
                Anda untuk mengimpor dan memilih aplikasi pemantauan.
              </div>
            )}

            {/* 2. Android Connected but usage permission missing */}
            {androidConnected && isAndroidDevice && hasPermission === false && (
              <div className="text-center p-8 border border-dashed border-border rounded-2xl bg-background/30 text-xs text-muted space-y-3">
                <p>
                  Izin data penggunaan Android (Usage Stats) belum diaktifkan.
                </p>
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Aktifkan Akses Data Penggunaan
                </button>
              </div>
            )}

            {/* 3. Android Connected & Adding App Selector Panel */}
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
                  {filteredAvailableAppsToSelect.length === 0 ? (
                    <div className="col-span-full text-center py-6 text-xs text-muted font-light">
                      {androidSearch
                        ? "Aplikasi tidak ditemukan"
                        : "Semua aplikasi terpasang sudah ditambahkan ke daftar pantau."}
                    </div>
                  ) : (
                    filteredAvailableAppsToSelect.map((app) => (
                      <button
                        type="button"
                        key={app.packageName}
                        onClick={() =>
                          handleAddAndroidApp(app.appName, app.packageName)
                        }
                        className="p-2.5 border border-border bg-card hover:bg-muted-light/20 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7.5 h-7.5 rounded-lg bg-gradient-to-tr ${getAppGradient(
                              app.appName,
                            )} flex items-center justify-center text-white text-[8px] font-bold shrink-0 shadow-2xs`}
                          >
                            {app.appName.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-primary block truncate">
                              {app.appName}
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

            {/* 4. Currently Monitored Android Apps Grid */}
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
                        key={app.appId}
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
                          onClick={() => handleRemoveAndroidApp(app.appId)}
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
          </>
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
                        {web.name || web.url}
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
        {isSettingsLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Jam Belajar / Kerja Skeleton */}
              <div className="p-5 rounded-3xl border border-border bg-background/40 space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
                  <div className="w-4.5 h-4.5 rounded bg-muted-light/60 border border-border/40 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-muted-light rounded w-28" />
                    <div className="h-2.5 bg-muted-light rounded w-36" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted-light rounded w-12" />
                    <div className="h-8 bg-muted-light rounded-xl w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted-light rounded w-12" />
                    <div className="h-8 bg-muted-light rounded-xl w-full" />
                  </div>
                </div>
              </div>

              {/* Jam Tidur Skeleton */}
              <div className="p-5 rounded-3xl border border-border bg-background/40 space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-border/40">
                  <div className="w-4.5 h-4.5 rounded bg-muted-light/60 border border-border/40 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-muted-light rounded w-28" />
                    <div className="h-2.5 bg-muted-light rounded w-36" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted-light rounded w-12" />
                    <div className="h-8 bg-muted-light rounded-xl w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted-light rounded w-12" />
                    <div className="h-8 bg-muted-light rounded-xl w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button placeholder */}
            <div className="flex justify-end pt-2">
              <div className="w-36 h-9 bg-muted-light/60 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
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

            {/* Save button for Target Jam Pemakaian */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveUserSettings}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition-all text-xs cursor-pointer shadow-xs"
              >
                Simpan Jam Waktu
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
