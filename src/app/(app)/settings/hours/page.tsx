"use client";

import { Briefcase, Check, Moon, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function HoursSettingsPage() {
  const [productiveStart, setProductiveStart] = useState("08:00");
  const [productiveEnd, setProductiveEnd] = useState("17:00");
  const [bedtimeStart, setBedtimeStart] = useState("22:00");
  const [bedtimeEnd, setBedtimeEnd] = useState("06:00");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jam Produktif Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted-light/60 text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary">Jam Produktif</h3>
              <p className="text-[10px] text-muted font-light">
                Waktu fokus bekerja atau belajar Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prod-start"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
                Mulai Jam
              </label>
              <input
                id="prod-start"
                type="time"
                value={productiveStart}
                onChange={(e) => setProductiveStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="prod-end"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
                Selesai Jam
              </label>
              <input
                id="prod-end"
                type="time"
                value={productiveEnd}
                onChange={(e) => setProductiveEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-muted font-light leading-relaxed">
            Selama periode ini, FomoTracker akan mengawasi pembukaan aplikasi
            media sosial dan mengirimkan **Focus Reminder** untuk menjaga Anda
            tetap berada di jalur produktivitas.
          </p>
        </div>

        {/* Jam Malam Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted-light/60 text-primary">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary">
                Jam Malam (Tidur)
              </h3>
              <p className="text-[10px] text-muted font-light">
                Jadwal istirahat reguler Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bed-start"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
                Mulai Jam
              </label>
              <input
                id="bed-start"
                type="time"
                value={bedtimeStart}
                onChange={(e) => setBedtimeStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="bed-end"
                className="block text-[10px] font-semibold text-muted mb-1.5"
              >
                Selesai Jam
              </label>
              <input
                id="bed-end"
                type="time"
                value={bedtimeEnd}
                onChange={(e) => setBedtimeEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-primary focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-muted font-light leading-relaxed">
            Jika Anda dideteksi membuka aplikasi layar yang dipantau selama
            periode ini, sistem akan memicu **Midnight Alert** dan menaikkan
            tingkat risiko perilaku Anda.
          </p>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-xs">
        {saved ? (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" /> Pengaturan jam berhasil disimpan!
          </span>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-muted">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Perubahan jam berlaku segera pada sesi berikutnya</span>
          </div>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-secondary transition-all cursor-pointer shadow-xs"
        >
          Simpan Jam
        </button>
      </div>
    </form>
  );
}
