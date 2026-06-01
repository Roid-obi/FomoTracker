"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { settingsDummy } from "@/lib/databases/dummyData";

// Zod Schemas
const profileSchema = zod.object({
  name: zod.string().min(3, "Nama minimal harus 3 karakter"),
  email: zod.string().email("Format email tidak valid"),
});

const passwordSchema = zod
  .object({
    oldPassword: zod.string().min(6, "Password minimal 6 karakter"),
    newPassword: zod.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: zod.string().min(6, "Password minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileFormValues = zod.infer<typeof profileSchema>;
type PasswordFormValues = zod.infer<typeof passwordSchema>;

export default function ProfileSettingsPage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile Form Hook
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: settingsDummy.profile.name,
      email: settingsDummy.profile.email,
    },
  });

  // Password Form Hook
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSave = async (_data: ProfileFormValues) => {
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const onPasswordSave = async (_data: PasswordFormValues) => {
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPasswordSuccess(true);
    resetPasswordForm();
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-poppins">
      {/* Avatar Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
        <h3 className="font-bold text-sm text-primary mb-6">Foto Profil</h3>
        <div className="relative group mb-4">
          <div className="w-28 h-28 rounded-full bg-muted-light flex items-center justify-center overflow-hidden border-2 border-border">
            {avatar ? <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-primary">R</span>}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-secondary transition-all shadow-md">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <p className="text-xs text-muted font-light leading-relaxed max-w-xs">Unggah file JPG, PNG atau GIF. Maksimal ukuran 2MB.</p>
      </div>

      {/* Main Forms Grid */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form 1: Edit Profile */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-primary mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Detail Profil</span>
          </h3>

          <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-muted mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="profile-name"
                  type="text"
                  {...registerProfile("name")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-primary"
                />
                <User className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              </div>
              {profileErrors.name && <p className="text-[10px] text-red-500 mt-1">{profileErrors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-semibold text-muted mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  {...registerProfile("email")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-primary"
                />
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              </div>
              {profileErrors.email && <p className="text-[10px] text-red-500 mt-1">{profileErrors.email.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSuccess ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profil berhasil diperbarui!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                {isProfileSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Change Password */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-primary mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Ganti Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="space-y-4">
            <div>
              <label htmlFor="pwd-old" className="block text-xs font-semibold text-muted mb-1.5">
                Password Lama
              </label>
              <div className="relative">
                <input
                  id="pwd-old"
                  type="password"
                  {...registerPassword("oldPassword")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-primary"
                />
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              </div>
              {passwordErrors.oldPassword && <p className="text-[10px] text-red-500 mt-1">{passwordErrors.oldPassword.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pwd-new" className="block text-xs font-semibold text-muted mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    id="pwd-new"
                    type="password"
                    {...registerPassword("newPassword")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-primary"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                </div>
                {passwordErrors.newPassword && <p className="text-[10px] text-red-500 mt-1">{passwordErrors.newPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="pwd-confirm" className="block text-xs font-semibold text-muted mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    id="pwd-confirm"
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium text-primary focus:outline-none focus:border-primary"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                </div>
                {passwordErrors.confirmPassword && <p className="text-[10px] text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {passwordSuccess ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Password berhasil diperbarui!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                {isPasswordSubmitting ? "Memproses..." : "Perbarui Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
