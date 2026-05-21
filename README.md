# FomoTracker

FomoTracker — AI-Powered Digital Wellbeing Platform for behavioral analytics and smart notifications.

"Understand Your Digital Habits Before They Control You."

## Ringkasan Proyek
FomoTracker adalah platform digital wellbeing berbasis AI untuk memantau penggunaan media sosial, menganalisis pola perilaku digital, mendeteksi risiko penggunaan berlebihan, dan memberikan notifikasi cerdas serta rekomendasi berbasis perilaku.

## Fitur Utama
- Mobile activity tracking (durasi, frekuensi, midnight usage)
- Behavioral analytics engine (behavioral score, usage patterns)
- AI insight & recommendation system
- Risk level analysis (Low / Moderate / High)
- Smart notification system (behavioral triggers)
- Digital wellbeing dashboard (visualisasi, trend, timeline)

## Teknologi
- Framework: Next.js (app router)
- Bahasa: TypeScript
- Paket & runtime: Bun (direkomendasikan) atau npm/yarn/pnpm
- Linter & formatter: Biome
- Styling: Tailwind CSS
- State & data: TanStack Query, React Hook Form, Zod
- Visualisasi: Recharts
- Backend: Supabase (Postgres)
- ORM: Drizzle
- AI: OpenRouter API / LLM API

## Persiapan Lokal (Windows)
1. Instalasi runtime & tool (pilih salah satu paket manager):

	 - Bun (direkomendasikan)
		 - Install dari https://bun.sh

	 - Alternatif: Node.js + npm/yarn/pnpm

2. Clone repository dan masuk ke folder proyek:

```powershell
git clone <repo-url> .
cd "e:/Lomba OLIVIA 2026/fomotracker"
```

3. Salin file env contoh dan isi variabel lingkungan:

```powershell
copy .env.example .env.local
```

Atau edit `.env.local` dan isi nilai-nilai berikut (contoh):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (jika diperlukan di server)
- `DATABASE_URL` (untuk Drizzle / migrations)
- `OPENROUTER_API_KEY` atau `OPENAI_API_KEY`

4. Install dependensi

Dengan Bun:

```powershell
bun install
```

Dengan npm:

```powershell
npm install
```

5. Jalankan server development

```powershell
bun dev
# atau
npm run dev
```

6. Lint & format

```powershell
npm run lint
npm run format
```

## Supabase & Database
1. Buat project Supabase dan catat `URL` dan `ANON KEY`.
2. Buat schema Postgres jika perlu dan isi `DATABASE_URL` pada `.env.local`.
3. Jalankan migration (jika menggunakan Drizzle):

```powershell
# contoh dengan bun
bun run drizzle-kit generate --schema src/db/schema
bun run drizzle-kit push
```

Sesuaikan perintah di atas tergantung pada konfigurasi `drizzle-kit` dalam `package.json`.

## Integrasi AI
1. Daftarkan API key pada penyedia LLM (OpenRouter / OpenAI) dan simpan di `OPENROUTER_API_KEY` atau `OPENAI_API_KEY`.
2. Pastikan panggilan AI dilakukan dari server-side untuk menjaga kunci tetap privat.

## Struktur Proyek (ringkas)
- `src/app` — entry Next.js dan halaman
- `src/components` — komponen UI
- `src/lib` — helpers, integrasi Supabase / AI
- `src/server` — API routes, worker, notifications
- `src/db` — schema/drizzle

## Deployment
- Recommended: deploy ke Vercel / Supabase Edge Functions + Supabase Postgres untuk backend.
- Pastikan meng-set environment variables pada platform deploy.

## Kontribusi
- Ikuti `biome format` sebelum PR.
- Gunakan branch per fitur dan buat PR dengan deskripsi singkat fitur dan langkah pengujian.

---

Jika Anda ingin, saya bisa: membuat file `AGENTS.md`, `.env.example`, atau menambahkan template migration Drizzle. Mau saya buat sekarang? 
