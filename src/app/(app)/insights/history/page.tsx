"use client";

import {
  Calendar,
  Search,
  Filter,
  ShieldAlert,
  ArrowLeft,
  Brain,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { insightDummy } from "@/lib/data/initialData";

export default function InsightHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const pastInsights = insightDummy.pastInsights;

  // Filter insights based on month selection and search query
  const filteredInsights = pastInsights.filter((report) => {
    const matchesSearch =
      report.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth =
      selectedMonth === "all" ||
      (selectedMonth === "Mei" && report.period.includes("Mei")) ||
      (selectedMonth === "April" &&
        (report.period.includes("Apr") || report.period.includes("April")));

    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 font-poppins relative">
      {/* Back button link */}
      <div className="flex items-center">
        <Link
          href="/insights/latest"
          className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-primary transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Insight Terbaru</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Riwayat AI Insight
        </h1>
        <p className="text-sm text-muted font-light mt-1">
          Daftar laporan mingguan dan evaluasi perilaku digital Anda dari
          minggu-minggu sebelumnya
        </p>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci atau periode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-border bg-card text-xs font-medium text-primary placeholder-muted focus:outline-hidden focus:border-primary transition-all"
          />
        </div>

        {/* Filter Month */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-card border border-border text-muted">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-border bg-card text-xs font-bold text-muted focus:outline-hidden focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            <option value="Mei">Mei 2026</option>
            <option value="April">April 2026</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      {filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((report) => (
            <Link
              key={report.id}
              href={`/insights/${report.id}`}
              className="block bg-card border border-border hover:border-primary/30 rounded-3xl overflow-hidden transition-all shadow-xs group hover:shadow-md"
            >
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-muted shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {report.period}
                    </span>
                    <span
                      className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${report.riskColor}`}
                    >
                      {report.risk} Risk
                    </span>
                  </div>
                  <p className="text-xs text-muted font-light leading-relaxed max-w-2xl">
                    {report.summary}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end border-t border-border pt-4 sm:border-none sm:pt-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[10px] text-muted font-light">
                      Skor Perilaku
                    </span>
                    <span className="text-sm font-black text-primary flex items-baseline gap-0.5">
                      {report.score}
                      <span className="text-[10px] font-medium text-muted">
                        /100
                      </span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-muted-light/40 text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 border border-dashed border-border rounded-3xl bg-card/30 text-center">
          <Brain className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-primary">
            Tidak Ada Laporan Ditemukan
          </h3>
          <p className="text-xs text-muted font-light mt-1 max-w-xs mx-auto">
            Coba sesuaikan kata kunci pencarian atau ganti filter bulan Anda.
          </p>
        </div>
      )}
    </div>
  );
}
