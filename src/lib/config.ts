// Konfigurasi runtime dari env Vite (.env / .env.example).
// RELASI: src/lib/api/client.ts — satu-satunya konsumen; ganti backend =
// ganti env, tanpa menyentuh kode modul.
export const CONFIG = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api/v1",
  // Default mock AKTIF agar panel bisa dijelajah penuh tanpa backend.
  useMock: (import.meta.env.VITE_USE_MOCK as string | undefined) !== "false",
} as const;

export const STORAGE_KEYS = {
  theme: "xpanel.theme",
  token: "xpanel.token",
  user: "xpanel.user",
  tenant: "xpanel.tenant",
  sidebar: "xpanel.sidebar",
} as const;
