"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Activity, Briefcase, Check, Clock, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import type { SettingModel } from "@/lib/models/setting.model";
import { api } from "@/lib/utils/api";

export default function NotifikasiSettingsPage() {
  const queryClient = useQueryClient();

  // Time settings local state
  const [notifExcessive, setNotifExcessive] = useState(true);
  const [excessiveHours, setExcessiveHours] = useState(4);
  const [notifProductive, setNotifProductive] = useState(true);
  const [notifMidnight, setNotifMidnight] = useState(true);
  const [notifContinuous, setNotifContinuous] = useState(true);
  const [continuousMinutes, setContinuousMinutes] = useState(60);

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

  // Initialize form values once data is fetched
  useEffect(() => {
    if (settingsData) {
      setNotifExcessive(settingsData.notifScreenTimeEnabled ?? true);
      setExcessiveHours(
        Math.round((settingsData.screenTimeLimitSeconds || 14400) / 3600),
      );
      setNotifProductive(settingsData.notifProductiveHourEnabled ?? true);
      setNotifMidnight(settingsData.notifMidnightEnabled ?? true);
      setNotifContinuous(settingsData.notifContinuousEnabled ?? true);
      setContinuousMinutes(
        Math.round((settingsData.continuousLimitSeconds || 3600) / 60),
      );
    }
  }, [settingsData]);

  // 2. Mutation to update notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      notifScreenTimeEnabled: boolean;
      screenTimeLimitSeconds: number;
      notifProductiveHourEnabled: boolean;
      notifMidnightEnabled: boolean;
      notifContinuousEnabled: boolean;
      continuousLimitSeconds: number;
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
        gooeyToast.success("Preferensi pengingat berhasil disimpan!");
      }
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        apiError.response?.data?.error ||
        "Gagal menyimpan preferensi pengingat.";
      gooeyToast.error(errorMsg);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      notifScreenTimeEnabled: notifExcessive,
      screenTimeLimitSeconds: excessiveHours * 3600,
      notifProductiveHourEnabled: notifProductive,
      notifMidnightEnabled: notifMidnight,
      notifContinuousEnabled: notifContinuous,
      continuousLimitSeconds: continuousMinutes * 60,
    });
  };

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-muted animate-pulse">
          Memuat preferensi pengingat...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-poppins flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-primary">
            Preferensi Pengingat
          </h2>
          <p className="text-[11px] text-muted font-light mt-0.5">
            Aktifkan dan atur parameter ambang batas untuk pengingat cerdas
            kesejahteraan digital Anda.
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
                  <h4 className="text-xs font-bold text-primary">
                    Batas Pemakaian Harian
                  </h4>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan saya saat total screen time harian melewati batas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifExcessive(!notifExcessive)}
                className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${
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
                <span className="text-[10px] text-muted font-light">
                  Batas waktu penggunaan per hari:
                </span>
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
                <h4 className="text-xs font-bold text-primary">
                  Pengingat Jam Produktif
                </h4>
                <p className="text-[10px] text-muted font-light">
                  Kirim pengingat jika membuka media sosial di jam
                  belajar/kerja.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifProductive(!notifProductive)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${
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
                <h4 className="text-xs font-bold text-primary">
                  Pengingat Larut Malam
                </h4>
                <p className="text-[10px] text-muted font-light">
                  Kirim pengingat jika mendeteksi penggunaan HP di jam tidur
                  malam.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifMidnight(!notifMidnight)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${
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
                  <h4 className="text-xs font-bold text-primary">
                    Batas Penggunaan Nonstop
                  </h4>
                  <p className="text-[10px] text-muted font-light">
                    Ingatkan jika membuka HP nonstop tanpa istirahat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifContinuous(!notifContinuous)}
                className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${
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
                <span className="text-[10px] text-muted font-light">
                  Durasi pemakaian nonstop maksimal:
                </span>
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
            {updateSettingsMutation.isPending && (
              <span className="text-[10px] text-muted font-light animate-pulse">
                Menyimpan...
              </span>
            )}
            {updateSettingsMutation.isSuccess && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Preferensi berhasil disimpan!</span>
              </span>
            )}
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition-all text-xs cursor-pointer shadow-xs disabled:opacity-50"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
