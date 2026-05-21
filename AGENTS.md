# AGENTS — Peran & Panduan Otomasi untuk FomoTracker

Dokumen ini mendeskripsikan agent (peran otomatis) yang bisa digunakan tim pengembangan, CI, atau asisten AI untuk melakukan tugas berulang terkait proyek FomoTracker.

## Tujuan
- Menstandarkan peran agen otomatis untuk development, testing, deployment, dan data processing.
- Menyediakan perintah dan guideline singkat agar agent dapat bertindak konsisten.

## Daftar Agents

1. frontend-agent
   - Tugas: build dan cek statis frontend Next.js, jalankan linting/format, jalankan storybook (jika ada)
   - Commands contoh:
     - `bun install && bun dev` (dev)
     - `bun build` atau `npm run build` (production build)
     - `npm run lint` (biome check)
   - Checklist sebelum PR: linter bersih, build sukses, snapshot test up-to-date.

2. backend-agent
   - Tugas: migrasi database (Drizzle), cek koneksi Supabase, jalankan test server-side, verifikasi environment variables
   - Commands contoh:
     - `bun run drizzle-kit push` (apply migrations)
     - `node ./scripts/check-supabase.js` (custom check)
   - Hati-hati: jangan mem-push migration ke production tanpa review manual.

3. ai-agent
   - Tugas: generate AI insight templates, sanitasi prompt, menjalankan panggilan LLM di server-side, audit penggunaan token.
   - Requirements: `OPENROUTER_API_KEY` atau `OPENAI_API_KEY` tersedia di secret store.
   - Safety: batasi sample size data yang dikirim ke LLM (gunakan metadata saja).

4. analytics-agent
   - Tugas: proses batch metadata (mis. nightly), hitung behavioral score, simpan hasil ke DB untuk dashboard.
   - Cron / scheduling: disarankan run nightly di worker environment atau Supabase scheduled functions.
   - Output: `behavioral_score`, `risk_level`, `trend_summary`.

5. ci-agent
   - Tugas: pipeline CI yang menjalankan: install, lint, build, unit tests, run migrations di test DB.
   - Perintah umum (CI YAML):
     - `bun install`
     - `npm run lint`
     - `npm run build`
     - jalankan test suite

## Best Practices untuk Agents
- Semua agent harus membaca variabel environment dari `.env` atau secret store.
- Agent yang mengakses data pengguna hanya boleh menggunakan metadata (tidak boleh isi chat atau file pribadi).
- Perubahan schema DB harus melalui review dan backup sebelum apply di production.
- Agent AI wajib melakukan input sanitization dan meminimalisir data sensitif.

## Contoh Workflow: Deploy minor frontend
1. `frontend-agent` menjalankan build dan linter.
2. Jika sukses, buat PR otomatis ke branch `deploy-preview`.
3. `ci-agent` menjalankan test pada PR.
4. Setelah merge, pipeline deploy ke Vercel/Supabase di-trigger.

---

Jika mau, saya bisa menambahkan contoh file pipeline CI (GitHub Actions / GitLab CI) yang sesuai stack Bun + Biome + Next.js.
