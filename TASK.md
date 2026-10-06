# TASK.md — Catatan Pengerjaan XPanel-Min

> Log pengerjaan per modul/file + tujuannya. Status: ✅ selesai · ⏳ antrian (lihat juga marker `NEXT:` di kode).

## Fondasi & Konfigurasi

| Status | File | Tujuan |
|---|---|---|
| ✅ | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | Vite + React 19 + TS strict + alias `@/`; bootstrap tema anti-FOUC di index.html; dependensi runtime hanya react, react-router, TipTap |
| ✅ | `src/styles/index.css` | SELURUH token desain (biru tua/putih/silver, semantik bg/surface/line/ink/brand/accent/status/chart/sidebar) untuk light & dark via `@theme` Tailwind v4 + kelas `.dark`; tipografi konten WYSIWYG (`.prose-x`) |
| ✅ | `.env.example`, `src/lib/config.ts` | Konfigurasi runtime: `VITE_API_BASE_URL` + `VITE_USE_MOCK` — sakelar koneksi backend tahap berikutnya |
| ✅ | `src/lib/utils.ts` | Util murni: `cn`, format tanggal/byte/angka kompak, `slugify` (selaras slugutil backend), `uid` |

## Lapisan API (persiapan koneksi backend)

| Status | File | Tujuan |
|---|---|---|
| ✅ | `src/lib/api/types.ts` | DTO TypeScript yang mencerminkan kontrak backend Fablerace — satu-satunya sumber tipe API |
| ✅ | `src/lib/api/client.ts` | Klien tunggal: unwrap envelope `{success,data,meta,error}`, header Bearer + X-Tenant-ID otomatis, `ApiError` berkode; mode mock/real dari env; titik `NEXT:` untuk auto-refresh 401 |
| ✅ | `src/lib/api/mock.ts` | Mock in-memory seluruh endpoint (auth, dashboard, contents CRUD+publish, taxonomies+terms, media, keywords+coverage, members+invite, license, apikeys, webhooks) dengan path & bentuk respons sama persis dengan backend — panel teruji penuh tanpa server |

## Providers (app-level)

| Status | File | Tujuan |
|---|---|---|
| ✅ | `app/providers/ThemeProvider.tsx` | Dark/light: kelas `.dark` + persist localStorage |
| ✅ | `app/providers/AuthProvider.tsx` | Sesi login/register/logout; simpan token+profil; dipakai guard rute |
| ✅ | `app/providers/ToastProvider.tsx` | Toast sukses/error/info kanan-atas, auto-dismiss, tanpa dependensi |
| ✅ | `app/providers/DialogProvider.tsx` | **Sweet-alert kustom** (`dialog.confirm` / `dialog.alert` berbasis Promise, ikon bertona, mode danger) di atas primitif Modal — zero-dep, bisa ditukar sweetalert2 tanpa mengubah pemanggil |

## Komponen UI (buatan sendiri, zero-dep)

| Status | File | Tujuan |
|---|---|---|
| ✅ | `components/ui/icons.tsx` | ±40 ikon inline SVG (nav, aksi, toolbar editor) — pengganti paket ikon |
| ✅ | `components/ui/Button.tsx`, `fields.tsx`, `Card.tsx`, `Badge.tsx` | Kit dasar: varian tombol, Input/Textarea/Select/Label seragam token, kartu ber-header, badge status (selalu berteks, tak pernah warna saja) |
| ✅ | `components/ui/Table.tsx`, `Dropdown.tsx`, `Tabs.tsx`, `Spinner.tsx` | Tabel + Pagination (envelope meta), dropdown headless, tab, loader/empty-state |
| ✅ | `components/ui/StatTile.tsx` | Stat tile sesuai kontrak dataviz (label, nilai kompak, delta bertanda vs periode bernama) |
| ✅ | `components/ui/BarChart.tsx` | Bar chart SVG seri-tunggal: hue chart tervalidasi per mode, ujung membulat 4px anchored baseline, grid resesif, tooltip hover, **toggle tampilan tabel** |
| ✅ | `components/modal/Modal.tsx` | Primitif modal (portal, backdrop, Esc, ukuran sm/md/lg, mode locked) — **basis modal** seluruh panel |
| ✅ | `components/editor/RichTextEditor.tsx` | **WYSIWYG TipTap** + toolbar kustom (H2/H3, bold/italic/strike, list, quote, code, undo/redo); `NEXT:` sisip gambar dari Media Library |
| ✅ | `components/layout/Sidebar.tsx`, `Topbar.tsx`, `Shell.tsx` | Sidebar navy **bersubmenu** (expand/auto-open saat rute aktif, overlay mobile), topbar (breadcrumb dari nav.ts, cari global, toggle tema, profil), kerangka laman |

## Modul Laman (1 folder = 1 modul)

| Status | Modul | Tujuan |
|---|---|---|
| ✅ | `modules/auth` | AuthLayout split navy + Login (kredensial demo tampil saat mock) + Register (trial) + Forgot (konfirmasi generik, `NEXT:` endpoint reset) |
| ✅ | `modules/dashboard` | 4 stat tile, grafik publikasi 30 hari, keyword teratas (meter), konten terbaru |
| ✅ | `modules/content` | Daftar: filter status+cari (sinkron URL), pagination, aksi publish/hapus dgn konfirmasi; **Editor**: judul + WYSIWYG + panel Penerbitan/Slug/Excerpt/SEO, lazy-loaded (code-split) |
| ✅ | `modules/taxonomy` | Daftar taxonomy + **pohon term berjenjang** + tambah term via modal (induk hanya utk taxonomy hierarkis) |
| ✅ | `modules/media` | Grid thumbnail + hapus berkonfirmasi; upload = placeholder sadar-diri (`NEXT:` presign→MinIO→confirm bersama backend) |
| ✅ | `modules/keyword` | Daftar keyword + tambah; panel **coverage** per keyword (deteksi kanibalisasi, tanda Primary) |
| ✅ | `modules/users` | Tabel anggota ber-role + modal undangan (role selain owner) |
| ✅ | `modules/license` | Kartu paket+status langganan; meter kuota storage/seat dengan ambang warn/danger |
| ✅ | `modules/settings` | Tab Umum / API Keys / Webhooks — submenu sidebar menaut langsung ke tiap tab |
| ✅ | `app/router.tsx`, `app/nav.ts`, `app/App.tsx`, `main.tsx` | Rute + guard auth + lazy editor; satu sumber menu; komposisi provider |

## Dokumen

| Status | File | Tujuan |
|---|---|---|
| ✅ | `docs/konsep-ui-ux.md` | Konsep desain mengikat: prinsip, tabel token warna 2 mode, arsitektur navigasi, peta laman↔modul backend, pola interaksi, keputusan dependensi, aksesibilitas |
| ✅ | `docs/integrasi-backend.md` | Diagram alur mock vs real, langkah koneksi backend (ganti env), kontrak yang dipegang panel, catatan frontend publik kelak |
| ✅ | `README.md` | Ringkasan, cara jalan, struktur, tautan dokumen |

## Verifikasi (hasil)

| Status | Langkah | Hasil |
|---|---|---|
| ✅ | `npm run build` (tsc strict + vite) | Lulus; bundle utama 387 KB (gzip 121 KB), editor ter-code-split 406 KB dimuat saat dibutuhkan |
| ✅ | Validasi warna chart (validator dataviz) | `#3b6fd4` (light/putih) & `#5b8ae0` (dark/#0b1526) — ALL CHECKS PASS |
| ✅ | Smoke test browser nyata (Chromium headless) | Alur login → dashboard → toggle dark → daftar konten → editor WYSIWYG → dialog konfirmasi: semua berjalan; 6 screenshot terkirim |

## Antrian berikutnya (juga ter-grep via `NEXT:`)

| Status | Item |
|---|---|
| ⏳ | Koneksi backend nyata: `VITE_USE_MOCK=false` + auto-refresh 401 di client |
| ⏳ | Upload media alur presign→MinIO→confirm + sisip gambar dari editor |
| ⏳ | Blok SEO tersimpan ke backend (content_seo) + skor keyword on-save |
| ⏳ | Pemilih tenant multi-workspace di topbar |
| ⏳ | Kelola role anggota per baris + guard owner terakhir |
