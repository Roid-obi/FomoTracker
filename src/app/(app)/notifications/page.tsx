"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import {
  Activity,
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { NotificationModel } from "@/lib/models/notification.model";
import { api } from "@/lib/utils/api";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<"semua" | "belum-dibaca">(
    "semua",
  );

  // Fetch notifications from backend
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: NotificationModel.getNotificationResponse[];
      }>("/api/notification");
      return res.data.data;
    },
  });

  // Mutation to toggle read/unread status
  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const res = await api.put("/api/notification", { id, isRead });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      gooeyToast.error("Gagal memperbarui status baca.");
    },
  });

  // Mutation to mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put("/api/notification", { markAllRead: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      gooeyToast.success("Semua notifikasi ditandai sudah dibaca.");
    },
    onError: () => {
      gooeyToast.error("Gagal memperbarui semua status baca.");
    },
  });

  const toggleReadStatus = (id: string, currentReadStatus: boolean | null) => {
    toggleReadMutation.mutate({ id, isRead: !currentReadStatus });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === "belum-dibaca") return !notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifConfig = (type: string) => {
    switch (type) {
      case "midnight":
        return {
          icon: Moon,
          color: "text-indigo-600 bg-indigo-50 border-indigo-100",
          label: "Midnight Usage",
        };
      case "screen_time":
        return {
          icon: Clock,
          color: "text-amber-600 bg-amber-50 border-amber-100",
          label: "Batas Pemakaian",
        };
      case "productive_hour":
        return {
          icon: Briefcase,
          color: "text-primary bg-muted-light/60 border-border",
          label: "Peringatan Fokus",
        };
      case "continuous":
        return {
          icon: Activity,
          color: "text-orange-600 bg-orange-50 border-orange-100",
          label: "Sesi Nonstop",
        };
      default:
        return {
          icon: Bell,
          color: "text-primary bg-muted-light/60 border-border",
          label: "Pemberitahuan",
        };
    }
  };

  // Helper to format date
  const formatTimeAgo = (dateStr: string | Date | null) => {
    if (!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    // Fallback format DD MMM
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  if (error) {
    return (
      <div className="bg-card border border-red-200 rounded-3xl p-12 text-center text-red-800 shadow-xs font-poppins">
        <p className="text-xs font-bold">Gagal memuat notifikasi.</p>
        <p className="text-[10px] opacity-75 mt-1">
          Silakan periksa koneksi Anda dan coba beberapa saat lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Tombol Kembali */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-primary transition-all rounded-xl bg-card border border-border hover:border-primary/20 shadow-2xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
            Pesan Masuk
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-primary hover:bg-muted-light transition-all cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tandai Semua Sudah Dibaca</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-1 select-none">
        <button
          type="button"
          onClick={() => setFilterType("semua")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            filterType === "semua"
              ? "bg-primary border-primary text-white"
              : "border-border bg-card text-muted hover:text-primary hover:bg-muted-light"
          }`}
        >
          Semua ({isLoading ? "—" : notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("belum-dibaca")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            filterType === "belum-dibaca"
              ? "bg-primary border-primary text-white"
              : "border-border bg-card text-muted hover:text-primary hover:bg-muted-light"
          }`}
        >
          Belum Dibaca ({isLoading ? "—" : unreadCount})
        </button>
      </div>

      {/* List items */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full p-4 rounded-2xl border border-border bg-card flex gap-4 animate-pulse"
            >
              <div className="p-3 rounded-xl bg-muted-light/60 border border-border/40 w-11 h-11 shrink-0" />
              <div className="space-y-2 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 bg-muted-light rounded w-24" />
                  <div className="h-3 bg-muted-light rounded w-16" />
                </div>
                <div className="h-4 bg-muted-light rounded w-3/4" />
              </div>
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted font-light shadow-xs">
            <Bell className="w-8 h-8 text-muted/30 mx-auto mb-3" />
            <p className="text-xs">Tidak ada notifikasi dalam filter ini.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = getNotifConfig(notif.type);
            const Icon = config.icon;
            return (
              <button
                type="button"
                key={notif.id}
                onClick={() => toggleReadStatus(notif.id, notif.isRead)}
                disabled={toggleReadMutation.isPending}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 select-none relative group bg-transparent focus:outline-none disabled:opacity-80 ${
                  notif.isRead
                    ? "bg-card border-border opacity-70 hover:opacity-100"
                    : "bg-primary/[0.01] border-primary/20 shadow-xs hover:bg-primary/[0.03]"
                }`}
              >
                {/* Titik biru jika belum dibaca */}
                {!notif.isRead && (
                  <span className="absolute top-5 right-5 w-2 h-2 bg-secondary rounded-full animate-pulse" />
                )}

                {/* Left Side Icon */}
                <div
                  className={`p-3 rounded-xl border shrink-0 self-start ${config.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="space-y-1 pr-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted font-light">
                      • {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-primary font-normal leading-relaxed leading-normal">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-muted font-light hidden group-hover:block pt-1 transition-all">
                    {notif.isRead
                      ? "Klik untuk tandai belum dibaca"
                      : "Klik untuk tandai sudah dibaca"}
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
