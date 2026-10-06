# Konsep UI/UX — XPanel

Master Admin Panel untuk platform Fablerace CMS. Dokumen ini adalah keputusan desain yang MENGIKAT scaffold; perubahan konsep diubah di sini dulu, baru di kode.

## 1. Prinsip

1. **Panel kerja, bukan brosur** — kepadatan informasi sedang, hierarki tipografi tegas, tanpa dekorasi yang tidak membawa informasi.
2. **Identitas visual konstan**: sidebar selalu **biru tua** di kedua mode; area konten yang berganti terang/gelap. Pengguna selalu tahu "ini XPanel".
3. **Komposisi warna** (permintaan produk): **biru tua** memegang identitas & aksi utama, **putih** permukaan kerja, **silver** garis/teks sekunder.
4. **Token semantik, bukan hex di komponen** — seluruh komponen memakai `bg/surface/line/ink/brand/accent/...`; dark mode otomatis konsisten.

## 2. Token Warna (`src/styles/index.css`)

| Token | Light | Dark | Peran |
|---|---|---|---|
| `bg` | `#f2f5f9` | `#0a1120` | latar aplikasi |
| `surface` | `#ffffff` | `#101b30` | kartu/panel |
| `surface2` | `#e9eef5` | `#172440` | hover, thead, fill lembut |
| `line` | `#d7dde8` | `#243355` | border (silver) |
| `ink` / `ink2` / `ink3` | navy → silver | putih → silver | teks utama/sekunder/muted |
| `brand` | `#14305a` | `#2f5fbe` | tombol utama (biru tua) |
| `accent` | `#3b6fd4` | `#5b8ae0` | link, fokus, nav aktif |
| `chart` | `#3b6fd4` | `#5b8ae0` | seri data — **tervalidasi** validator dataviz (band lightness, kontras ≥3:1 thd surface masing-masing mode) |
| `side*` | navy `#0b1f3b` dkk. | navy `#0a1526` dkk. | sidebar (identik di dua mode) |
| `ok/warn/danger` + `*-soft` | hijau/amber/merah | versi dark | status — **selalu berpasangan dengan label teks**, tidak pernah warna saja |

Mode gelap: kelas `.dark` di `<html>` (bootstrap anti-FOUC di `index.html`, lanjut `ThemeProvider`, persist `localStorage`).

## 3. Arsitektur Navigasi

```
Topbar:  [☰] Breadcrumb(Grup / Laman) | Cari konten | 🌙/☀️ | Profil ▾
Sidebar (navy, w-64):
  Dashboard
  Konten ▾        → Semua Konten · Tambah Baru · Taxonomy · Media
  SEO ▾           → Keywords
  Pengguna ▾      → Anggota
  Lisensi
  Pengaturan ▾    → Umum · API Keys · Webhooks
```

- **Satu sumber kebenaran**: `src/app/nav.ts` membangun sidebar DAN breadcrumb.
- Submenu expand/collapse; grup otomatis terbuka saat rute anaknya aktif; item aktif diberi fill `side2` + garis aksen kiri.
- Mobile: sidebar menjadi overlay (tombol ☰ di topbar).
- Pencarian topbar mengarah ke `/contents?search=…` — satu perilaku yang bisa diingat.

## 4. Peta Laman ↔ Modul Backend

| Laman panel | Modul Fablerace | Catatan |
|---|---|---|
| `/auth/*` (login, register, forgot) | `auth` | register sekaligus membuat tenant + trial |
| `/` Dashboard | agregat | stat tile + grafik publikasi + konten terbaru |
| `/contents`, `/contents/:id` | `content` | daftar berfilter; editor WYSIWYG + panel status/slug/SEO |
| `/taxonomy` | `taxonomy` | daftar taxonomy + pohon term berjenjang |
| `/media` | `media` | grid; upload presigned menyusul backend |
| `/keywords` | `keyword` | daftar + coverage (deteksi kanibalisasi) |
| `/members` | `user` | anggota + undang via modal |
| `/license` | `license` | status paket + meter kuota |
| `/settings[/tab]` | `tenant` + `license` | Umum / API Keys / Webhooks |

## 5. Pola Interaksi

- **Dialog keputusan = sweet-alert kustom** (`DialogProvider`): ikon lingkaran bertona, judul, teks, Batal/Konfirmasi; `tone: "danger"` untuk destruktif. Semua aksi destruktif WAJIB lewat `dialog.confirm`.
- **Toast** untuk kabar pasca-aksi (sukses simpan/hapus), auto-dismiss, maksimal 4 tumpukan.
- **Modal** primitif yang sama dipakai form (undang anggota, tambah term).
- **Tabel**: aksi per-baris muncul saat hover; pagination seragam dari envelope `meta`.
- **Status loading** per-laman (`PageLoader`), empty-state dengan ajakan aksi.

## 6. Keputusan Dependensi (prinsip: minimal)

| Kebutuhan | Keputusan | Alasan |
|---|---|---|
| Framework | Vite + React 19 + TS strict | SPA admin; ekosistem luas; build cepat |
| Styling | Tailwind v4 (`@theme` token) | token-first, tanpa config JS |
| Routing | react-router v7 | standar de-facto |
| **WYSIWYG** | **TipTap (starter-kit)** | satu-satunya dep UI eksternal; headless → toolbar kustom senada token; alternatif lebih ringan tidak memadai untuk kebutuhan WYSIWYG nyata |
| Modal + sweet alert + toast | **buatan sendiri** (0 dep) | ~200 baris total; sweetalert2 dkk. membawa styling sendiri yang melawan token. Migrasi ke sweetalert2 = tukar isi `DialogProvider`, pemanggil tidak berubah |
| Ikon | inline SVG (`icons.tsx`) | hindari paket ikon |
| State/data | React context + fetch wrapper | React Query dipertimbangkan NANTI saat koneksi backend nyata menambah kebutuhan cache/retry (`NEXT:` di client.ts) |

## 7. Aksesibilitas & Dataviz

- Fokus keyboard terlihat (outline aksen global); tombol ikon selalu ber-`aria-label`; dialog ber-`role="dialog"`.
- Chart mengikuti metode dataviz: seri tunggal satu hue tervalidasi per mode, mark tipis ujung membulat anchored baseline, grid resesif, tooltip hover, **toggle "Lihat tabel"** sebagai alternatif non-visual, label sumbu selektif.
- Status tidak pernah dikomunikasikan warna saja (badge selalu berteks).
