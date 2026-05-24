"use client";

import { BarChart2, Bell, Brain, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  {
    name: "AI Insight",
    href: "/insight/latest",
    icon: Brain,
    matchPrefix: "/insight",
  },
  { name: "Notifikasi", href: "/notifications", icon: Bell, badge: 3 },
  {
    name: "Pengaturan",
    href: "/settings/profile",
    icon: Settings,
    matchPrefix: "/settings",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  const handleLogout = () => {
    // Simulation: delete session, redirect to landing or login page
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar (Floating & Sticky) */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] sticky top-4 m-4 rounded-3xl border border-border bg-card shadow-sm p-6 justify-between select-none">
        <div>
          {/* Logo */}
          <div className="flex items-baseline gap-1 select-none px-2 mb-8">
            <span className="font-yellowtail text-4xl font-normal text-primary leading-none">Fomo</span>
            <span className="font-poppins text-xs font-bold tracking-widest text-primary uppercase leading-none">Tracker</span>
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
                    active ? "bg-primary text-white shadow-sm" : "text-muted hover:text-primary hover:bg-muted-light/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform ${active ? "text-accent" : "text-muted group-hover:text-primary"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !active && <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section & logout */}
        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-muted-light flex items-center justify-center font-bold text-primary font-poppins border border-border">R</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate font-poppins text-primary">Roid Obi</span>
              <span className="text-xs text-muted truncate font-poppins">roid@fomotracker.com</span>
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
        <div key={pathname} className="animate-page-enter max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
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
              {item.badge && !active && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-card rounded-full" />}
            </Link>
          );
        })}
        <button type="button" onClick={handleLogout} className="flex items-center justify-center w-12 h-12 rounded-xl text-red-600" aria-label="Keluar">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}
