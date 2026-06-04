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
    <div className="space-y-6 font-poppins flex-1 flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Kelola profil diri, koneksi gawai, parameter waktu produktif, dan
          preferensi pengingat.
        </p>
      </div>

      {/* Settings Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start flex-1">
        {/* Left Sub-nav (Desktop) / Top Sub-nav (Mobile) */}
        <aside className="lg:col-span-1 bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-xs shrink-0 select-none">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            {subNavigationItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap lg:w-full ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted hover:text-primary hover:bg-muted-light/40"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? "text-accent" : "text-muted"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Right Settings Content Section */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs min-h-[400px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
