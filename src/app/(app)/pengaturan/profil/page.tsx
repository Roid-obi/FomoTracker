"use client";

import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Camera, Check, Key, Loader2, LogOut, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/utils/api";

export default function ProfilSettingsPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const platform =
        Capacitor.getPlatform() === "android"
          ? "android_app"
          : "browser_extension";
      try {
        await api.put("/api/setting/device", {
          platform,
          isConnected: false,
        });
      } catch (err) {
        console.error("Failed to disconnect device on logout:", err);
      }

      const response = await api.post("/api/auth/logout");
      if (response.status === 200) {
        queryClient.setQueryData(["user"], null);
        queryClient.clear();
        window.localStorage.removeItem("fomotracker_monitored_apps");
        gooeyToast.success("Berhasil keluar!");
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error(error);
      gooeyToast.error("Gagal keluar. Silakan coba lagi.");
    } finally {
      setShowLogoutModal(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (max 2MB) dan tipe
    if (file.size > 2 * 1024 * 1024) {
      gooeyToast.error("Ukuran file maksimal 2MB!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      gooeyToast.error("File harus berupa gambar (JPG atau PNG)!");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.put("/api/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setAvatarUrl(response.data.avatarUrl);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        gooeyToast.success("Avatar berhasil diperbarui!");
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { error?: string } } };
      gooeyToast.error(
        apiError.response?.data?.error || "Gagal mengupload avatar!",
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset input agar file yang sama bisa dipilih lagi
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      gooeyToast.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    const body: Record<string, string> = { name, email };
    if (oldPassword) body.oldPassword = oldPassword;
    if (newPassword) body.newPassword = newPassword;

    try {
      const response = await api.put("/api/user", body);

      if (response.data.success) {
        setIsSaved(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        queryClient.invalidateQueries({ queryKey: ["user"] });
        gooeyToast.success("Perubahan berhasil disimpan!");
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const errorMsg =
        apiError.response?.data?.error || "Gagal menyimpan perubahan!";
      console.log(errorMsg);
      gooeyToast.error(errorMsg);
    } finally {
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 font-poppins flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-primary">Profil Saya</h2>
          <p className="text-[11px] text-muted font-light mt-0.5">
            Perbarui detail identitas diri dan kredensial keamanan akun.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Foto Profil */}
          <div className="flex items-center gap-4 border-b border-border/40 pb-5">
            <div className="relative group select-none">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar preview atau inisial */}
              <div className="w-16 h-16 rounded-full bg-muted-light flex items-center justify-center font-bold text-primary text-xl border border-border overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (name
                    .trim()
                    .split(" ")
                    .map((kata) => kata.charAt(0))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() ?? "?")
                )}
              </div>

              {/* Tombol kamera overlay */}
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-primary/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                aria-label="Upload photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-primary">Foto Profil</h3>
              <p className="text-[10px] text-muted font-light leading-normal">
                Ubah gambar profil melalui unggahan berkas gambar JPG atau PNG
                (maksimal 2MB).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label
                htmlFor="name-input"
                className="text-[10px] font-bold text-muted uppercase tracking-wider"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="name-input"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-xs font-semibold text-primary font-poppins"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-input"
                className="text-[10px] font-bold text-muted uppercase tracking-wider"
              >
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary transition-all text-xs font-semibold text-primary font-poppins"
                />
              </div>
            </div>
          </div>

          {/* Ganti Password Section */}
          <div className="border-t border-border/40 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-muted" />
              <span>Ganti Password</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="old-pass"
                  className="text-[9px] font-bold text-muted uppercase tracking-wider"
                >
                  Password Lama
                </label>
                <input
                  id="old-pass"
                  name="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary text-xs text-primary font-poppins"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="new-pass"
                  className="text-[9px] font-bold text-muted uppercase tracking-wider"
                >
                  Password Baru
                </label>
                <input
                  id="new-pass"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary text-xs text-primary font-poppins"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-pass"
                  className="text-[9px] font-bold text-muted uppercase tracking-wider"
                >
                  Konfirmasi Baru
                </label>
                <input
                  id="confirm-pass"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-secondary text-xs text-primary font-poppins"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/40 justify-end">
            {isSaved && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Perubahan berhasil disimpan!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition-all text-xs cursor-pointer shadow-xs"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

        {/* Sesi & Keluar */}
        <section className="space-y-3 border-t border-red-100 bg-red-50/[0.05] p-5 rounded-2xl border mt-6">
          <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            <span>Sesi & Keluar — Keluar dari Akun</span>
          </h3>
          <p className="text-[11px] text-muted font-light leading-relaxed">
            Keluar dari sesi aktif Anda di perangkat ini. Anda perlu masuk
            kembali untuk mengakses data statistik Anda.
          </p>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Keluar Sekarang
          </button>
        </section>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-primary/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-sm font-extrabold text-primary font-poppins">
                Keluar dari Akun?
              </h3>
              <p className="text-[11px] text-muted font-light leading-relaxed font-poppins">
                Apakah Anda yakin ingin keluar dari FomoTracker? Anda perlu
                masuk kembali untuk melihat data dan insight Anda.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted-light/30 text-xs font-bold text-muted transition-all cursor-pointer font-poppins"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer font-poppins"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
