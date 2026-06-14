<h1 align="center">FomoTracker — Web Extension</h1>

<p align="center">
  <strong>Modul Ekstensi Browser Real-time untuk FomoTracker Platform</strong>
</p>

---

## 📖 Tentang FomoTracker Web Extension

Bagian dari ekosistem **FomoTracker** (Platform Digital Wellbeing Berbasis AI), ekstensi peramban (browser extension) ini dirancang khusus untuk membatasi waktu penelusuran (browsing) desktop secara langsung (*real-time*). 

Dengan menggunakan **Manifest V3**, ekstensi ini secara otomatis menghitung waktu penggunaan di situs-situs yang membuat candu (*doomscrolling*), dan akan menampilkan layar penutup (*break overlay*) yang memaksa pengguna mengambil jeda istirahat ketika batas waktu harian tercapai.

---

## ✨ Fitur Utama

- ⏱ **Time Limits (Batas Waktu)** — Atur batas durasi harian (dalam menit).
- 🔔 **Smart Overlay Alert** — Menampilkan *overlay* menutupi seluruh layar yang tidak bisa dihindari saat waktu mencapai batas.
- 🎛 **Toggle Rules** — Aktifkan atau nonaktifkan aturan pembatasan dengan mudah tanpa harus menghapusnya.
- 📊 **Active Sessions** — Pantau durasi sesi yang sedang berjalan secara langsung lewat antarmuka (UI) *popup*.
- 🌐 **SPA Support** — Berjalan lancar di aplikasi *Single-Page Applications* modern seperti YouTube, X (Twitter), React, dll.

---

## 🛠️ Tech Stack & Ekosistem

- **Next.js 16** (App Router, ekspor statis / *static export*)
- **TypeScript**
- **Tailwind CSS v4**
- **Chrome Extension Manifest V3**
- **Bun** (Manajemen package & alat build)

---

## 📊 Arsitektur Sistem Ekstensi

```text
public/
  manifest.json        ← Konfigurasi utama ekstensi (Manifest V3)
  background.js        ← Service worker: manajemen timer, state sesi, sync API
  content.js           ← Disuntikkan (injected) di setiap halaman web: untuk merender overlay & loop detik
  icons/               ← Aset ikon ekstensi (16, 48, 128px)
app/
  page.tsx             ← Antarmuka UI (Popup) dibuat dengan Next.js
  layout.tsx           ← Layout dasar & jenis font
  globals.css          ← Sistem desain CSS (Tailwind)
out/                   ← Hasil build statis (Folder ini yang di-load ke Chrome)
```

### ⚙️ Cara Kerja Ekstensi

1. Antarmuka **Popup** (dibangun dengan Next.js) digunakan untuk menambahkan aturan batas situs web (URL).
2. Aturan disimpan dengan aman di `chrome.storage.local` melalui **background service worker**.
3. Saat pengguna mengunjungi URL yang telah dipantau, **content script** akan menjalankan iterasi (tick loop) setiap 1 detik.
4. Worker di *background* akan melacak durasi yang telah digunakan dan status jeda per situs web.
5. Ketika batas durasi tercapai, **content script** menyuntikkan (inject) *overlay* penutup penuh (*full-screen break overlay*).
6. Pengguna dipaksa mengambil jeda istirahat, lalu sesi akan di-reset saat waktu jeda telah lewat.

---

## ⚡ Memulai Pengembangan

### 📋 Prasyarat

- Terinstal **Bun** runtime ([bun.sh](https://bun.sh/))
- Browser berbasis Chromium (Google Chrome, Microsoft Edge, Brave, dll)

### 1. Kloning & Instalasi Dependensi

Masuk ke dalam direktori `web_extension` dan instal dependensi menggunakan Bun:

```bash
bun install
```

### 2. Build Ekstensi (Produksi)

Jalankan perintah ini untuk melakukan kompilasi proyek:

```bash
bun run build
```

Perintah di atas akan menghasilkan berkas statis (*static output*) di dalam folder `out/`.

### 3. Memuat Ekstensi ke Chrome

1. Buka Chrome lalu ketik `chrome://extensions/` di kolom pencarian.
2. Aktifkan fitur **Developer mode** (Mode Pengembang) di pojok kanan atas layar.
3. Klik tombol **Load unpacked** (Muat yang belum dikemas).
4. Pilih folder `out/` yang baru saja dihasilkan dari proses build.

### 4. Menjalankan Server Development (Khusus Pengembangan UI Popup)

Untuk mendesain UI *popup* secara terpisah di luar konteks ekstensi:

```bash
bun run dev
```

> **Catatan Penting:** API ekstensi Chrome (seperti `chrome.storage`) tidak akan bekerja pada mode *development* biasa di browser. Namun, UI telah dirancang sedemikian rupa agar mundur otomatis secara elegan menggunakan `localStorage` (*graceful fallback*) untuk keperluan uji coba UI.

---

## 🔒 Izin Ekstensi (Permissions)

Untuk dapat berfungsi penuh, FomoTracker Web Extension membutuhkan izin (*permissions*) sebagai berikut pada file `manifest.json`:

| Izin (Permission) | Kegunaan |
| :--- | :--- |
| `storage` | Menyimpan preferensi aturan dan mencatat data durasi sesi |
| `tabs` | Mendeteksi jika URL tab aktif telah berubah |
| `alarms` | Mengaktifkan pengingat waktu (timer) di latar belakang |
| `activeTab` | Membaca URL tab yang saat ini sedang dibuka |
| `host_permissions: <all_urls>` | Menyuntikkan script overlay pelindung di berbagai situs web terdaftar |
