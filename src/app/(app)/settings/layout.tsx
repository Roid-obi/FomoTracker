"use client";

import { AppWindow, Bell, Clock, Lock, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const settingsTabs = [
  { name: "Profil Saya", href: "/settings/profile", icon: User },
  { name: "Kelola Aplikasi", href: "/settings/apps", icon: AppWindow },
  { name: "Atur Jam", href: "/settings/hours", icon: Clock },
  { name: "Notifikasi", href: "/settings/notifications", icon: Bell },
  { name: "Privasi & Data", href: "/settings/privacy", icon: Lock },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted font-light mt-1">Kelola profil, daftar pelacakan aplikasi, jadwal jam produktif, dan kebijakan privasi Anda</p>
      </div>

      {/* Settings Tabs Sub-Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-1 shrink-0 scrollbar-none select-none">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                active ? "bg-secondary text-white shadow-xs" : "text-muted hover:bg-muted-light/60 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Settings Subpage Content */}
      <div>
        {children}
      </div>

      {/* Mobile-only logout action */}
      <div className="md:hidden rounded-3xl border border-red-200 bg-red-50 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-red-700">Keluar Akun</h3>
              <p className="mt-1 text-xs leading-relaxed text-red-700/80">Logout dipindahkan ke halaman pengaturan agar Bottom Navigation Bar tetap bersih di mobile.</p>
            </div>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-700">
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
