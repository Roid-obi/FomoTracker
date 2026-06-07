"use client";

import {
  AlertTriangle,
  Database,
  Download,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { initialDatabaseData } from "@/lib/data/databaseInitialData";

export default function PrivasiSettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isExporting, setIsExporting] = useState<"json" | "csv" | null>(null);

  const handleExportJSON = () => {
    setIsExporting("json");
    setTimeout(() => {
      // Create and download a mock JSON file from initialDatabaseData
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(initialDatabaseData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "fomotracker_data_export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(null);
    }, 1500);
  };

  const handleExportCSV = () => {
    setIsExporting("csv");
    setTimeout(() => {
      // Create and download a simple CSV string representing daily stats
      const csvHeader = "ID,Stat Date,App Name,Total Seconds,Open Count\n";
      const csvRows = initialDatabaseData.daily_stats
        .map((row) => {
          const appName =
            initialDatabaseData.apps.find((a) => a.id === row.app_id)?.name ||
            "Unknown";
          return `${row.id},${row.stat_date},${appName},${row.total_duration_seconds},${row.open_frequency}`;
        })
        .join("\n");

      const csvStr =
        "data:text/csv;charset=utf-8," +
        encodeURIComponent(csvHeader + csvRows);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", csvStr);
      downloadAnchor.setAttribute("download", "fomotracker_daily_stats.csv");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(null);
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (confirmDeleteText.toLowerCase() === "hapus akun saya") {
      alert("Akun Anda berhasil dihapus (simulasi).");
      window.location.href = "/";
    } else {
      alert("Teks konfirmasi tidak cocok!");
    }
  };

  return (
    <div className="space-y-8 font-poppins relative flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-primary">
            Privasi & Data
          </h2>
          <p className="text-[11px] text-muted font-light mt-0.5">
            Kelola data pelacakan aktivitas gawai Anda dan transparansi
            pengolahan data pribadi.
          </p>
        </div>

        {/* Tables of Collected and Ignored Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data yang Dikumpulkan */}
          <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/[0.15] space-y-3.5">
            <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span>Data yang Kami Kumpulkan</span>
            </h3>
            <ul className="space-y-2 text-xs font-light text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Nama Aplikasi:</strong> Identifikasi media sosial yang
                  sedang dibuka.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Durasi Screen Time:</strong> Total detik layar aktif
                  pada aplikasi.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Frekuensi Membuka:</strong> Berapa kali aplikasi
                  dibuka per hari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Waktu Aktivitas:</strong> Detik/menit mulai dan
                  selesai online.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Domain Website:</strong> Domain utama web medsos yang
                  dilacak (misal: <code>instagram.com</code>).
                </span>
              </li>
            </ul>
          </div>

          {/* Data yang TIDAK Dikumpulkan */}
          <div className="p-5 rounded-2xl border border-red-100 bg-red-50/[0.15] space-y-3.5">
            <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
              <span>Data yang Tidak Kami Kumpulkan</span>
            </h3>
            <ul className="space-y-2 text-xs font-light text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Isi Percakapan:</strong> Kami tidak pernah membaca isi
                  chat atau pesan privat Anda.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Kata Sandi / Kredensial:</strong> Pengisian form sandi
                  diabaikan pelacak.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Berkas Pribadi:</strong> Foto, video, audio, dan
                  dokumen tidak akan pernah diakses.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>
                  <strong>URL Lengkap:</strong> Hanya merekam domain utama,
                  mengabaikan URL detail.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Konten yang Dibaca:</strong> Isi postingan, teks
                  berita, atau video yang ditonton tidak dilacak.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ekspor Data */}
        <section className="space-y-3 border-t border-border/40 pt-5">
          <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Database className="w-4 h-4 text-muted" />
            <span>Ekspor Salinan Data</span>
          </h3>
          <p className="text-[11px] text-muted font-light leading-relaxed">
            Anda dapat mengunduh seluruh salinan data statistik aktivitas
            digital yang tersimpan pada server FomoTracker kapan saja.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted-light font-bold text-xs text-primary transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-muted" />
              <span>
                {isExporting === "json"
                  ? "Mengekspor JSON..."
                  : "Ekspor Salinan (JSON)"}
              </span>
            </button>
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted-light font-bold text-xs text-primary transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-muted" />
              <span>
                {isExporting === "csv"
                  ? "Mengekspor CSV..."
                  : "Ekspor Statistik (CSV)"}
              </span>
            </button>
          </div>
        </section>

        {/* Danger Zone: Hapus Akun */}
        <section className="space-y-3 border-t border-red-100 bg-red-50/[0.05] p-5 rounded-2xl border">
          <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            <span>Zona Bahaya — Hapus Akun</span>
          </h3>
          <p className="text-[11px] text-muted font-light leading-relaxed">
            Menghapus akun Anda akan menghapus seluruh data statistik screen
            time, preferensi pengingat, dan kredensial login secara permanen
            dari basis data FomoTracker. Tindakan ini tidak dapat dibatalkan.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Hapus Akun Permanen
          </button>
        </section>
      </div>

      {/* Delete Account Modal Dialog Simulation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-primary/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-primary">
                Apakah Anda Yakin?
              </h3>
              <p className="text-[11px] text-muted font-light leading-relaxed">
                Tindakan ini permanen. Silakan ketik{" "}
                <strong className="font-bold text-primary">
                  "hapus akun saya"
                </strong>{" "}
                di bawah untuk mengonfirmasi.
              </p>
            </div>

            <input
              type="text"
              placeholder='Ketik "hapus akun saya"'
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:border-red-600 text-xs text-primary font-semibold text-center font-poppins"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDeleteText("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted-light/30 text-xs font-bold text-muted transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
