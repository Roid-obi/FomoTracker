import {
  Brain,
  FileText,
  GraduationCap,
  Info,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Tentang() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border bg-card">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-border mb-4 font-poppins">
            <Info className="w-3.5 h-3.5" /> Profil Platform
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-poppins tracking-tight mb-4">
            Tentang FomoTracker
          </h1>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto font-poppins font-light leading-relaxed">
            Menyelami visi, misi, landasan ilmiah, dan tim di balik pengembangan
            platform digital wellbeing FomoTracker.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-4xl py-16 space-y-20">
        {/* Section 1: Apa itu FomoTracker? */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-secondary" /> Apa itu FomoTracker?
            </h2>
            <div className="space-y-4 text-muted text-sm leading-relaxed font-poppins font-light">
              <p>
                <strong>FomoTracker</strong> adalah sebuah platform inovatif
                nirlaba yang didesain khusus untuk membantu masyarakat
                mengidentifikasi, memantau, dan mengendalikan kebiasaan digital
                mereka secara sadar.
              </p>
              <p>
                Lahir dari keprihatinan atas tingginya tingkat kecanduan media
                sosial dan fenomena FOMO (*Fear of Missing Out*), FomoTracker
                hadir untuk menjembatani kesenjangan antara teknologi digital
                dan kesejahteraan mental manusia modern.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-center items-center text-center">
            <span className="font-yellowtail text-5xl font-normal text-primary mb-3">
              Fomo
            </span>
            <span className="font-poppins text-xs font-bold tracking-widest text-muted uppercase mb-4">
              Digital Wellbeing Platform
            </span>
            <p className="text-xs text-muted font-poppins font-light">
              "Sebuah ikhtiar sosial untuk melahirkan generasi yang bijak
              berteknologi dan produktif berkarya."
            </p>
          </div>
        </section>

        {/* Section 2: Misi Kami */}
        <section className="p-8 md:p-10 rounded-3xl border border-border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-bl-full pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-poppins mb-2">Misi Kami</h2>
              <p className="text-primary text-base md:text-lg font-poppins font-semibold leading-relaxed mb-4">
                "Membantu masyarakat membangun kebiasaan digital yang lebih
                sehat, sadar, dan produktif."
              </p>
              <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light">
                Kami percaya teknologi seharusnya menjadi alat bantu yang
                memberdayakan manusia, bukan rantai tak kasat mata yang mendikte
                fokus, waktu, dan kebahagiaan hidup kita sehari-hari.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Landasan Ilmiah */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-poppins mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" /> Landasan Ilmiah
          </h2>
          <p className="text-muted text-sm font-poppins font-light mb-6">
            FomoTracker tidak dibangun atas dasar asumsi belaka, melainkan
            dirancang berdasarkan studi akademis dan metodologi ilmiah digital
            wellbeing:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-accent/25 text-primary flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-poppins mb-2">
                BSMAS Scale
              </h3>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Mengintegrasikan indikator *Bergen Social Media Addiction Scale*
                (BSMAS) untuk menilai tingkat risiko ketergantungan secara
                klinis.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-accent/25 text-primary flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-poppins mb-2">
                Behavioral Analytics
              </h3>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Penerapan teori psikologi perilaku (*behavioral psychology*)
                untuk memetakan pemicu (*triggers*) refleks membuka media
                sosial.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-accent/25 text-primary flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-poppins mb-2">
                Wellbeing Research
              </h3>
              <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                Merujuk pada riset terbaru seputar kesejahteraan digital untuk
                menyusun rekomendasi personalisasi asisten AI.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Kontribusi SDGs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-poppins mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" /> Kontribusi SDGs
            PBB
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5 font-bold font-poppins text-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold font-poppins mb-1">
                  SDG 3 — Kesehatan & Kesejahteraan
                </h3>
                <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                  Mendukung kesehatan mental masyarakat dengan menekan stres,
                  cemas (*anxiety*), dan depresi yang dipicu oleh adiksi dunia
                  maya serta insomnia akibat layar HP.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 font-bold font-poppins text-xs">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold font-poppins mb-1">
                  SDG 4 — Pendidikan Berkualitas
                </h3>
                <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                  Membantu proses belajar generasi muda agar lebih efisien dan
                  fokus dengan merancang batasan waktu sehat agar terhindar dari
                  siklus kecanduan gim/media sosial.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold font-poppins text-xs">
                8
              </div>
              <div>
                <h3 className="text-sm font-bold font-poppins mb-1">
                  SDG 8 — Pekerjaan & Pertumbuhan Ekonomi
                </h3>
                <p className="text-muted text-xs leading-relaxed font-poppins font-light">
                  Menjaga dan mendongkrak performa produktivitas para pekerja
                  industri kreatif maupun formal dari tuntutan notifikasi tanpa
                  henti sepanjang jam produktif.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Komitmen Privasi */}
        <section className="p-8 rounded-3xl border border-border bg-card flex gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-poppins mb-2">
              Komitmen Privasi Kami
            </h2>
            <p className="text-muted text-xs sm:text-sm leading-relaxed font-poppins font-light mb-4">
              Privasi Anda adalah prioritas mutlak kami. FomoTracker didesain
              dengan prinsip keamanan data yang ketat:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-xs text-muted font-poppins font-light">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Tidak membaca isi chat & pesan privat.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Tidak melacak password atau kredensial.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Hanya membaca statistik durasi aplikasi.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Data terenkripsi di PostgreSQL & Supabase.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6: Tim Pengembang */}
        <section className="space-y-6 text-center">
          <h2 className="text-2xl font-bold font-poppins mb-2 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-secondary" /> Tim Pengembang
          </h2>
          <p className="text-muted text-sm font-poppins font-light max-w-xl mx-auto mb-8">
            FomoTracker dirancang oleh tim akademisi dan developer berdedikasi
            untuk kontribusi nyata dalam Lomba OLIVIA 2026.
          </p>
          <div className="flex flex-col items-center justify-center">
            <div className="p-6 rounded-2xl border border-border bg-card max-w-sm w-full">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 text-secondary font-yellowtail text-3xl select-none">
                F
              </div>
              <h3 className="text-base font-bold font-poppins">
                Tim Developer FomoTracker
              </h3>
              <p className="text-secondary text-xs font-semibold font-poppins mb-2">
                Olivia 2026 Innovation Team
              </p>
              <p className="text-muted text-xs font-poppins font-light leading-relaxed">
                Berkolaborasi menciptakan solusi digital wellbeing berbasis
                riset akademis dan inovasi teknologi terkini.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
