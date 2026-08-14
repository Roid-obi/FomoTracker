# Daftar Library dan Lisensi FomoTracker

Dokumen ini disusun untuk memenuhi salah satu syarat "Deliverables" pada Babak Penyisihan **Gemastik 2026**. Berikut adalah rincian dari pustaka pihak ketiga (_third-party libraries_) yang digunakan di dalam pengembangan perangkat lunak FomoTracker, beserta adopsi lisensi untuk proyek FomoTracker.

## 1. Daftar Library dan Lisensinya

Proyek FomoTracker dibangun menggunakan ekosistem JavaScript/TypeScript. Semua pustaka yang digunakan berlisensi _open-source_ dengan ketentuan yang memperbolehkan penggunaan untuk kepentingan pengembangan aplikasi.

### Dependensi Utama (Production)

| Nama Library                       | Versi     | Lisensi      | Fungsionalitas / Deskripsi                                              |
| ---------------------------------- | --------- | ------------ | ----------------------------------------------------------------------- |
| `@capacitor/android`               | ^8.3.4    | MIT          | Modul Capacitor untuk membangun aplikasi di platform Android.           |
| `@capacitor/app`                   | ^8.1.0    | MIT          | Capacitor API untuk state aplikasi dan pengelolaan _lifecycle_.         |
| `@capacitor/browser`               | ^8.0.3    | MIT          | Plugin Capacitor untuk in-app browser.                                  |
| `@capacitor/cli`                   | ^8.3.4    | MIT          | Command Line Interface untuk Capacitor framework.                       |
| `@capacitor/core`                  | ^8.3.4    | MIT          | Library _core_ Capacitor penghubung web dan _native code_.              |
| `@google/genai`                    | ^2.8.0    | Apache 2.0   | SDK resmi Google untuk integrasi Generative AI (LLM).                   |
| `@hookform/resolvers`              | ^5.4.0    | MIT          | _Resolver_ skema validasi (termasuk Zod) untuk React Hook Form.         |
| `@supabase/ssr`                    | ^0.10.3   | MIT          | Helper library Supabase untuk Next.js (Server-Side Rendering).          |
| `@supabase/supabase-js`            | ^2.106.1  | MIT          | Client library Supabase untuk autentikasi dan database _realtime_.      |
| `@tanstack/react-query`            | ^5.100.11 | MIT          | Library untuk _data fetching_, caching, dan manajemen _server state_.   |
| `@tanstack/query-sync-storage...`  | ^5.101.0  | MIT          | _Storage persister_ (sinkronisasi penyimpanan lokal) untuk React Query. |
| `@tanstack/react-query-persist...` | ^5.101.0  | MIT          | Komponen penyimpan client state untuk React Query.                      |
| `axios`                            | ^1.17.0   | MIT          | Promise-based HTTP client untuk request API ke eksternal.               |
| `dotenv`                           | ^17.4.2   | BSD-2-Clause | Memuat konfigurasi variabel lingkungan (_environment variables_).       |
| `drizzle-orm`                      | ^0.45.2   | Apache 2.0   | TypeScript Object Relational Mapper (ORM) _headless_.                   |
| `drizzle-seed`                     | ^0.3.1    | Apache 2.0   | Utilitas untuk pengisian awal data (seeding) di database.               |
| `drizzle-zod`                      | ^0.8.3    | Apache 2.0   | Plugin Drizzle untuk menghasilkan skema validasi Zod otomatis.          |
| `framer-motion`                    | ^12.40.0  | MIT          | Library animasi dan transisi modern untuk React.                        |
| `goey-toast`                       | ^0.4.0    | MIT          | Library untuk menampilkan notifikasi _toast_ interaktif.                |
| `jimp`                             | ^1.6.1    | MIT          | Alat pemrosesan gambar berbasis Node.js.                                |
| `lucide-react`                     | ^1.17.0   | ISC          | Paket ikon vektor SVG open-source dengan desain konsisten.              |
| `next`                             | 16.2.6    | MIT          | Framework Next.js (berbasis React) untuk full-stack dan _App Router_.   |
| `postgres`                         | ^3.4.9    | Unlicense    | Klien PostgreSQL yang berfokus pada kecepatan di Node.js.               |
| `react` & `react-dom`              | 19.2.4    | MIT          | Library inti (UI library) dari antarmuka JavaScript.                    |
| `react-hook-form`                  | ^7.76.0   | MIT          | Form handling dan manajemen state form berperforma tinggi.              |
| `recharts`                         | ^3.8.1    | MIT          | Library _chart_ (grafik) untuk visualisasi data analitik di React.      |
| `sharp`                            | ^0.35.1   | Apache 2.0   | Pengolahan modul gambar berkecepatan tinggi.                            |
| `zod`                              | ^4.4.3    | MIT          | Sistem deklarasi tipe dan validasi skema form berbasis TypeScript.      |

### Dependensi Pengembangan (Development / Build Tools)

| Nama Library                  | Versi    | Lisensi    | Fungsionalitas / Deskripsi                                           |
| ----------------------------- | -------- | ---------- | -------------------------------------------------------------------- |
| `@biomejs/biome`              | 2.2.0    | MIT        | _Linter_ dan _Formatter_ modern penjamin standar kualitas kode.      |
| `@tailwindcss/postcss`        | ^4       | MIT        | Modul integrasi Tailwind CSS ke pipeline PostCSS.                    |
| `babel-plugin-react-compiler` | 1.0.0    | MIT        | Plugin React Compiler pengoptimal re-render secara otomatis.         |
| `drizzle-kit`                 | ^0.31.10 | MIT        | CLI Drizzle untuk manajemen skema dan migrasi database.              |
| `tailwindcss`                 | ^4       | MIT        | Utility-first CSS framework untuk styling antarmuka (UI).            |
| `tsx`                         | ^4.22.3  | MIT        | Eksekutor Node.js untuk script ber-ekstensi TypeScript (build/seed). |
| `typescript`                  | ^5       | Apache 2.0 | _Typed Superset_ JavaScript yang memastikan keamanan _type-check_.   |

---

## 2. Adopsi Lisensi (License Adoption)

Berdasarkan kumpulan pustaka (_dependencies_) di atas yang seluruhnya menggunakan Lisensi Open Source permisif (mayoritas **MIT** dan **Apache 2.0**), maka Proyek Perangkat Lunak **FomoTracker** memiliki kebebasan penuh dalam mengadopsi bentuk lisensi apa pun yang sesuai.

Untuk menjaga keseimbangan antara fleksibilitas pengembangan lebih lanjut di masa depan (potensi komersialisasi/startup), keterbukaan proyek, serta persyaratan perlombaan terkait pendaftaran HKI (Hak Kekayaan Intelektual), kami tim pengembang sepakat untuk mengadopsi **MIT License** sebagai lisensi utama dari keseluruhan kode aplikasi (source code) proyek FomoTracker ini.

Lisensi MIT dipilih karena tingkat kompatibilitasnya yang paling maksimal dengan ekosistem perangkat lunak yang kami buat (Next.js, Tailwind, Capacitor, React) dan melindungi tim dari liabilitas (_no warranty_) tanpa membatasi hak guna siapapun di kemudian hari, terutama pihak penyelenggara lomba dan investor.

### Teks Lisensi (Tercantum pada `LICENSE` proyek)

```text
MIT License

Copyright (c) 2026 Tim Pengembang FomoTracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
