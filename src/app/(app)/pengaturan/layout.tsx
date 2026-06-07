"use client";

import { Bell, ShieldCheck, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavigationItems = [
  { name: "Profil Saya", href: "/pengaturan/profil", icon: User },
  {
    name: "Perangkat & Aplikasi",
    href: "/pengaturan/perangkat",
    icon: Smartphone,
  },
  { name: "Pengingat", href: "/pengaturan/notifikasi", icon: Bell },
  { name: "Privasi & Data", href: "/pengaturan/privasi", icon: ShieldCheck },
];

export default function PengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 font-poppins flex-1 flex flex-col items-center">
      {/* Header Container */}
      <div className="w-full max-w-4xl self-center">
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Kelola profil diri, koneksi gawai, parameter waktu produktif, dan
          preferensi pengingat.
        </p>
      </div>

      {/* Settings Tab Bar Layout Container */}
      <div className="flex flex-col gap-6 items-center flex-1 w-full">
        {/* Top Tab Bar Navigation */}
        <div className="bg-card border border-border rounded-3xl p-1.5 flex gap-1.5 overflow-x-auto scrollbar-none w-full max-w-4xl select-none shadow-xs">
          {subNavigationItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:text-primary hover:bg-muted-light/35"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? "text-accent" : "text-muted"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Content Section Container */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs min-h-[450px] flex flex-col w-full max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
}
