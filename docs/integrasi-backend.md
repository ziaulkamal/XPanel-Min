# Integrasi Backend & Rencana Koneksi

Panel ini **API-first dan backend-agnostic by config**: seluruh data lewat satu
klien (`src/lib/api/client.ts`). Hari ini mock in-memory melayani semuanya;
tahap "hubungkan ke backend/FrontEnd" nanti adalah PERGANTIAN KONFIGURASI,
bukan penulisan ulang.

## 1. Cara kerja hari ini (mock)

```
Komponen → api.get/post/patch/del → client.ts ──(VITE_USE_MOCK≠false)──▶ mock.ts (in-memory)
                                            └──(VITE_USE_MOCK=false)──▶ fetch → Fablerace API
```

- Mock meniru path + envelope backend persis: `{success,data,meta}` / `{success:false,error:{code,message}}`.
- Kredensial demo: `admin@xpanel.dev` / `xpanel123` (tertera di laman login saat mock aktif).

## 2. Langkah koneksi ke backend Fablerace (saat tiba waktunya)

1. `.env`: `VITE_USE_MOCK=false` + `VITE_API_BASE_URL=https://api.domain.tld/api/v1`.
2. Header otomatis sudah terpasang di client: `Authorization: Bearer <token>` + `X-Tenant-ID`.
3. Aktifkan refresh-token: tangkap 401 di `client.ts` → `POST /auth/refresh` sekali → ulangi request (marker `NEXT:` sudah di tempatnya).
4. Pemetaan endpoint sudah 1:1 dengan lampiran API Fablerace; perbedaan kontrak yang ditemukan saat integrasi dicatat & diselaraskan di `src/lib/api/types.ts` (satu-satunya sumber tipe).
5. Media: ganti alert placeholder dengan alur nyata presign → PUT MinIO → confirm (marker `NEXT:` di `MediaPage` & backend docs/07).

## 3. Kontrak yang dipegang panel

| Area | Kontrak |
|---|---|
| Envelope | `{success,data,meta{page,per_page,total}}` · error `{code,message}` — kode mesin stabil dipakai utk pesan UI |
| Auth | `POST /auth/login|register|refresh|logout`; JWT pendek + refresh rotasi |
| Tenant context | header `X-Tenant-ID` (multi-tenant; pemilih tenant di UI menyusul — `NEXT:` saat akun multi-workspace aktif) |
| Pagination | `?page=&per_page=` (maks 100) |
| Status konten | `draft|review|scheduled|published|archived` |

## 4. Catatan "FrontEnd publik" (belum direncanakan)

Saat frontend situs publik tenant dibangun kelak, ia TIDAK memakai panel ini —
ia mengonsumsi API publik Fablerace ber-API-key (`/public/contents`,
`/sitemap.xml`, `/feed.xml`). Yang sudah disiapkan dari sisi panel: manajemen
API key & webhook build-hook ada di Pengaturan, sehingga menghubungkan
frontend kelak = buat API key di panel → pasang di frontend.

## 5. Menjalankan

```bash
cp .env.example .env     # opsional; default sudah mock
npm install
npm run dev              # http://localhost:5173
npm run build            # typecheck + build produksi (dist/)
```
