# FomoTracker

FomoTracker adalah aplikasi web berbasis Next.js untuk membantu pelacakan kebiasaan, aktivitas, dan insight penggunaan dengan pendekatan server-side rendering (SSR).

## Tech Stack

### Architecture & Toolchain
- Server-Side Rendering (SSR)
- TypeScript
- Node.js runtime
- Bun package manager
- Biome untuk linting dan formatting

### Frontend
- Next.js
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Recharts

### Backend & Database
- PostgreSQL
- Supabase
- Drizzle ORM
- OpenRouter API / LLM API

### Tracking System
- Android Usage Stats API untuk tracking aktivitas mobile

## Project Goals

- Menyediakan dashboard tracking yang cepat dan mudah dibaca.
- Menampilkan data historis dan insight dalam bentuk visual.
- Mendukung form input yang tervalidasi dengan baik.
- Siap dihubungkan ke backend Supabase dan database PostgreSQL.

## Getting Started

1. Install dependency:

```bash
bun install
```

2. Jalankan development server:

```bash
bun run dev
```

3. Buka aplikasi di:

```text
http://localhost:3000
```

## Available Scripts

- `bun run dev` - menjalankan aplikasi dalam mode development.
- `bun run build` - build production.
- `bun run start` - menjalankan build production.
- `bun run lint` - menjalankan Biome check.
- `bun run format` - formatting kode dengan Biome.

## Suggested Environment Variables

Buat file `.env.local` dan isi sesuai kebutuhan integrasi:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENROUTER_API_KEY=
```

## Repository Structure

- `src/app` - route dan layout utama Next.js App Router.
- `public` - aset statis.
- `biome.json` - konfigurasi Biome.
- `tsconfig.json` - konfigurasi TypeScript.

## Notes

Implementasi integrasi database, tracking Android, dan AI masih perlu ditambahkan sesuai kebutuhan produk. README ini sudah disusun agar selaras dengan arsitektur dan toolchain yang kamu tentukan.
