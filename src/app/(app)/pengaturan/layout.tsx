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
    <div className="space-y-6 font-poppins flex-1 flex flex-col w-full">
      {/* Header Container (Full Width) */}
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          Kelola profil diri, koneksi gawai, parameter waktu produktif, dan
          preferensi pengingat.
        </p>
      </div>

      {/* Single Settings Card Container (Full Width) */}
      <div className="w-full bg-card border border-border rounded-3xl shadow-xs min-h-[500px] flex flex-col md:flex-row overflow-hidden flex-1">
        {/* Left Side: Vertical Menu Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 sm:p-5 select-none shrink-0 bg-background/5">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none">
            {subNavigationItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap md:w-full ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted hover:text-primary hover:bg-muted-light/30"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-accent" : "text-muted"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Right Side: Active Settings Content Section */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
