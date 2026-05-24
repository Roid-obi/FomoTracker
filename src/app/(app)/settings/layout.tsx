"use client";

import { AppWindow, Bell, Clock, Lock, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsTabs = [
  { name: "Profil Saya", href: "/settings/profile", icon: User },
  { name: "Kelola Aplikasi", href: "/settings/apps", icon: AppWindow },
  { name: "Atur Jam", href: "/settings/hours", icon: Clock },
  { name: "Notifikasi", href: "/settings/notifications", icon: Bell },
  { name: "Privasi & Data", href: "/settings/privacy", icon: Lock },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 font-poppins">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Pengaturan
        </h1>
        <p className="text-sm text-muted font-light mt-1">
          Kelola profil, daftar pelacakan aplikasi, jadwal jam produktif, dan
          kebijakan privasi Anda
        </p>
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
                active
                  ? "bg-secondary text-white shadow-xs"
                  : "text-muted hover:bg-muted-light/60 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Settings Subpage Content */}
      <div className="animate-page-enter">{children}</div>
    </div>
  );
}
