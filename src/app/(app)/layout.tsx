"use client";

import {
  BarChart2,
  Bell,
  Brain,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/utils/api";

const navigationItems = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Statistik",
    href: "/statistik",
    icon: BarChart2,
    matchPrefix: "/statistik",
  },
  {
    name: "Insight",
    href: "/insight",
    icon: Brain,
    matchPrefix: "/insight",
  },
  {
    name: "Pengaturan",
    href: "/pengaturan/profil",
    icon: Settings,
    matchPrefix: "/pengaturan",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();
  const [todayStr, setTodayStr] = useState("");


  useEffect(() => {
    const formatIndonesianDate = () => {
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      return `${dayName}, ${date} ${monthName} ${year}`;
    };
    setTodayStr(formatIndonesianDate());
  }, []);

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const mapping: Record<string, string> = {
      dashboard: "Beranda",
      statistik: "Statistik",
      insight: "Insight",
      notifications: "Notifikasi",
      pengaturan: "Pengaturan",
      profil: "Profil",
      perangkat: "Perangkat",
      notifikasi: "Notifikasi",
      privasi: "Privasi",
    };

    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label =
        mapping[part] || part.charAt(0).toUpperCase() + part.slice(1);
      return (
        <div key={part} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted/60" />}
          <span
            className={`text-xs ${isLast ? "font-bold text-primary" : "text-muted font-light"}`}
          >
            {label}
          </span>
        </div>
      );
    });
  };

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  const handleLogout = async () => {
    try {
      const response = await api.post("/api/auth/logout");

      if (response.status === 200) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar (Floating & Sticky) */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] sticky top-4 m-4 rounded-3xl border border-border bg-card shadow-sm p-6 justify-between select-none">
        <div>
          {/* Logo */}
          <div className="flex items-baseline gap-1 select-none px-2 mb-8">
            <span className="font-yellowtail text-4xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-xs font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group font-poppins cursor-pointer ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-primary hover:bg-muted-light/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform ${active ? "text-accent" : "text-muted group-hover:text-primary"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section & logout */}
        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-muted-light flex items-center justify-center font-bold text-primary font-poppins border border-border">
              {user?.name
                ?.trim()
                .split(" ")
                .map((kata) => kata.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase() ?? "?"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate font-poppins text-primary">
                {user?.name ?? "—"}
              </span>
              <span className="text-xs text-muted truncate font-poppins">
                {user?.email ?? "—"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all font-poppins cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-2 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-6 pr-6 pl-6 py-6 overflow-visible md:overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col space-y-6">
          {/* Navbar Atas */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4 bg-background select-none">
            {/* Left Side: Logo on Mobile, Breadcrumbs + Date on Desktop */}
            <div className="flex items-center gap-1.5 md:gap-4">
              {/* Mobile Logo */}
              <div className="md:hidden flex items-baseline gap-0.5">
                <span className="font-yellowtail text-3xl font-normal text-primary">
                  Fomo
                </span>
                <span className="font-poppins text-[10px] font-bold tracking-widest text-primary uppercase">
                  Tracker
                </span>
              </div>

              {/* Desktop Breadcrumbs & Date */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {getBreadcrumbs()}
                </div>
                {todayStr && (
                  <>
                    <span className="text-border h-4 w-[1px] border-r" />
                    <div className="flex items-center gap-1.5 text-xs text-muted font-light">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      <span>{todayStr}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl border border-border bg-card text-primary hover:bg-muted-light transition-all cursor-pointer shadow-xs"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-card rounded-full" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-60 h-16 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-lg flex items-center justify-around px-2">
        {navigationItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all relative ${active ? "text-primary" : "text-muted"}`}
              aria-label={item.name}
            >
              <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
