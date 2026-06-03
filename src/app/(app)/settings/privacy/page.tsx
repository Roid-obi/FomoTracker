"use client";

import { Download, Eye, EyeOff, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { settingsDummy } from "@/lib/data/initialData";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportJSON = () => {
    const exportData = settingsDummy.privacyExportData;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "fomotracker_ekspor_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = () => {
    alert("Akun Anda dan semua data pelacakan terkait telah dihapus secara permanen.");
    router.push("/");
  };

  return (
    <div className="space-y-6 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data yang Dikumpulkan Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-primary">Data yang Kami Kumpulkan</h3>
          </div>
          <p className="text-xs text-muted font-light leading-relaxed">
            FomoTracker berkomitmen penuh terhadap keterbukaan data. Kami hanya mengumpulkan data telemetri penggunaan dasar untuk menyusun skor perilaku Anda:
          </p>
          <ul className="space-y-2 text-xs text-muted font-light pl-4 list-disc">
            <li>Identitas akun dasar (Nama, email, password terenkripsi).</li>
            <li>Metadata penggunaan aplikasi (Durasi screen time per aplikasi per jam).</li>
            <li>Frekuensi pembukaan aplikasi (Berapa kali ikon aplikasi diklik).</li>
            <li>Konfigurasi personal (Jadwal jam produktif, jam malam, preferensi notifikasi).</li>
          </ul>
        </div>

        {/* Data yang TIDAK Dikumpulkan Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-primary">Data yang TIDAK Kami Kumpulkan</h3>
          </div>
          <p className="text-xs text-muted font-light leading-relaxed">Privasi Anda adalah hak mutlak. FomoTracker tidak pernah menyentuh atau merekam konten sensitif pribadi Anda:</p>
          <ul className="space-y-2 text-xs text-muted font-light pl-4 list-disc">
            <li>Isi pesan percakapan chat (WhatsApp, Telegram, DM Instagram, dll.).</li>
            <li>Password akun media sosial Anda.</li>
            <li>Foto, video, file dokumen, atau riwayat galeri lokal di ponsel Anda.</li>
            <li>Ketikan keyboard (keystrokes) atau data kamera/mikrofon.</li>
          </ul>
        </div>
      </div>

      {/* Ekspor Data Panel */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="font-bold text-sm text-primary">Ekspor Data Saya</h3>
          <p className="text-xs text-muted font-light leading-relaxed">Unduh seluruh riwayat penggunaan screen time, skor perilaku, dan preferensi pengaturan akun Anda dalam berkas berformat JSON.</p>
        </div>
        <button
          type="button"
          onClick={handleExportJSON}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Data (JSON)</span>
        </button>
      </div>

      {/* Hapus Akun Panel */}
      <div className="bg-red-50/20 border border-red-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-primary">Zona Bahaya: Hapus Akun & Semua Data</h3>
            <p className="text-xs text-muted font-light leading-relaxed">
              Tindakan ini akan menghapus akun FomoTracker Anda secara permanen beserta semua data riwayat screen time, analisis perilaku mingguan, dan konfigurasi pelacakan. Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Akun Saya</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-red-100 animate-page-enter">
            <span className="text-xs font-bold text-red-700">Apakah Anda yakin ingin menghapus akun?</span>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 sm:flex-initial px-4 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-muted-light/30 transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
