"use client";

import { Ban, Bell, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { notificationPageDummy } from "@/lib/databases/dummyData";

const iconByKey = {
  shield: ShieldAlert,
  ban: Ban,
  clock: Clock,
  bell: Bell,
} as const;

const INITIAL_NOTIFICATIONS = notificationPageDummy.initialNotifications.map((item) => ({
  ...item,
  icon: iconByKey[item.iconKey as keyof typeof iconByKey] ?? Bell,
}));

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<"semua" | "belum-dibaca" | "Midnight Alert" | "Usage Warning" | "Focus Reminder">("semua");

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: !notif.read } : notif)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === "belum-dibaca") return !notif.read;
    if (filterType === "semua") return true;
    return notif.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 font-poppins">
      {/* Header and Mark All Read Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Notifikasi Saya</h1>
          <p className="text-sm text-muted font-light mt-1">Pantau peringatan dan laporan perilaku digital Anda secara real-time</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary hover:bg-muted-light/30 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tandai Semua Sudah Dibaca</span>
          </button>
        )}
      </div>

      {/* Filter chips bar */}
      <div className="flex overflow-x-auto gap-2 pb-1 shrink-0 scrollbar-none select-none">
        {[
          { id: "semua", name: "Semua" },
          { id: "belum-dibaca", name: `Belum Dibaca (${unreadCount})` },
          { id: "Midnight Alert", name: "Midnight Alerts" },
          { id: "Usage Warning", name: "Usage Warnings" },
          { id: "Focus Reminder", name: "Focus Reminders" },
        ].map((btn) => {
          const active = filterType === btn.id;
          return (
            <button
              type="button"
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                active ? "bg-primary border-primary text-white" : "border-border bg-card text-muted hover:text-primary hover:bg-muted-light/35"
              }`}
            >
              {btn.name}
            </button>
          );
        })}
      </div>

      {/* Notification items list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted font-light">
            <Bell className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-sm">Tidak ada notifikasi dalam filter ini.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <button
                type="button"
                key={notif.id}
                onClick={() => toggleReadStatus(notif.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 select-none relative group bg-transparent focus:outline-none ${
                  notif.read ? "bg-card border-border opacity-75 hover:opacity-100" : "bg-primary/[0.02] border-primary/20 shadow-xs hover:bg-primary/[0.04]"
                }`}
              >
                {/* Unread dot indicator */}
                {!notif.read && <span className="absolute top-4.5 right-4.5 w-2 h-2 bg-primary rounded-full" />}

                {/* Left side Icon */}
                <div className={`p-3 rounded-xl border shrink-0 ${notif.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content info */}
                <div className="space-y-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary">{notif.type}</span>
                    <span className="text-[10px] text-muted font-light">• {notif.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-primary leading-relaxed font-poppins">{notif.message}</p>
                  <span className="text-[9px] text-muted font-light hidden group-hover:block transition-all pt-1">
                    {notif.read ? "Klik untuk tandai belum dibaca" : "Klik untuk tandai sudah dibaca"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
