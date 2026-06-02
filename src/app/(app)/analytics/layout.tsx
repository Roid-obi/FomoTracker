"use client";

import { AlertTriangle, BarChart2, Brain } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/analytics/overview", icon: BarChart2 },
    { name: "Behavioral Analysis", href: "/analytics/behavior", icon: Brain },
    { name: "Risk Analysis", href: "/analytics/risk", icon: AlertTriangle },
  ] as const;

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Analisis Penggunaan
        </h1>
        <p className="text-sm text-muted font-light mt-1">
          Laporan terperinci mengenai durasi, kebiasaan, tingkat risiko, dan perkembangan perilaku digital Anda
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="overflow-x-auto scrollbar-none select-none">
        <div className="inline-flex min-w-max items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-muted-light hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
