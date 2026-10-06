# XPanel-Min

**Master Admin Panel** untuk platform [Fablerace CMS](https://github.com/ziaulkamal/fablerace) — Vite + React 19 + TypeScript (strict) + Tailwind CSS v4, dengan dependensi eksternal seminimal mungkin.

| | |
|---|---|
| Identitas visual | Biru tua (brand/sidebar) · Putih (permukaan) · Silver (garis/teks sekunder) |
| Mode tampilan | Dark & light (persist, anti-FOUC) |
| Navigasi | Sidebar navy bersubmenu + topbar (breadcrumb, cari, tema, profil) |
| Auth | Login · Register (+trial) · Lupa sandi |
| WYSIWYG | TipTap headless, toolbar kustom senada token |
| Dialog | Modal primitif + sweet-alert kustom + toast — tanpa paket pihak ketiga |
| Data | Klien API tunggal; **mock in-memory default** → pindah backend nyata cukup ganti env |

## Jalankan

```bash
npm install
npm run dev        # http://localhost:5173 — login: admin@xpanel.dev / xpanel123
npm run build      # typecheck + build produksi
```

## Struktur

```
src/
├── app/            router, nav (sumber menu sidebar+breadcrumb), providers
│                   (Theme, Auth, Toast, Dialog)
├── lib/            config, utils, api/ (client · types · mock)
├── components/
│   ├── ui/         Button, fields, Card, Badge, Table, Dropdown, Tabs,
│   │               StatTile, BarChart, icons (SVG inline), Spinner
│   ├── modal/      primitif Modal (basis sweet-alert & form)
│   ├── editor/     RichTextEditor (TipTap)
│   └── layout/     Shell, Sidebar, Topbar
└── modules/        1 folder = 1 modul laman — pola yang sama dengan backend:
                    auth · dashboard · content · taxonomy · media · keyword ·
                    users · license · settings
```

## Dokumen

- [docs/konsep-ui-ux.md](docs/konsep-ui-ux.md) — konsep desain lengkap: token warna, arsitektur navigasi, pola interaksi, keputusan dependensi
- [docs/integrasi-backend.md](docs/integrasi-backend.md) — kontrak API & langkah koneksi ke backend Fablerace / frontend publik kelak
- [TASK.md](TASK.md) — log pengerjaan per modul/file

## Konvensi

Mengikuti konvensi proyek Fablerace: komentar `NEXT:` (arah pengembangan yang sengaja ditunda) dan `RELASI:` (keterkaitan lintas modul/repo) tersebar di kode dan bisa di-grep:

```bash
grep -rn "NEXT:" src/
grep -rn "RELASI:" src/
```
