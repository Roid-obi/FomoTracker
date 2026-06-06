"use client";

import { Camera, Check, Key, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/utils/api";

export default function ProfilSettingsPage() {
  const { data: user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }
    const formData = new FormData(e.currentTarget);

    try {
      const response = await api.put('/api/user', formData)

      if (response.data.success) {
        setIsSaved(true);
      }
    } catch (error: any) {
      console.log(error.response?.data?.error || "Gagal Menyimpan");
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
          {/* Foto Profil Simulation */}
          <div className="flex items-center gap-4 border-b border-border/40 pb-5">
            <div className="relative group select-none">
              <div className="w-16 h-16 rounded-full bg-muted-light flex items-center justify-center font-bold text-primary text-xl border border-border">
                {name.trim().split(' ').map(kata => kata.charAt(0)).join('').substring(0, 2).toUpperCase() ?? "?"}
              </div>
              <button
                type="button"
                className="absolute inset-0 bg-primary/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Upload photo"
              >
                <Camera className="w-4 h-4" />
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
      </div>
    </div>
  );
}
