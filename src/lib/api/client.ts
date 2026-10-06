// Klien API tunggal: semua modul memanggil lewat sini, tidak pernah fetch
// langsung. Mode ditentukan env (mock in-memory vs backend Fablerace nyata) —
// inilah titik "hubungkan ke backend" di tahap berikutnya: cukup set
// VITE_USE_MOCK=false + VITE_API_BASE_URL (docs/integrasi-backend.md).
//
// RELASI: Fablerace internal/shared/response — envelope {success,data,meta,error}
// yang di-unwrap di sini; internal/platform/middleware — header Authorization
// Bearer + X-Tenant-ID yang dilampirkan di setiap request.

import { CONFIG, STORAGE_KEYS } from "@/lib/config";
import { mockFetch } from "./mock";
import type { Envelope, ListMeta } from "./types";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function getToken(): string | null {
  try { return localStorage.getItem(STORAGE_KEYS.token); } catch { return null; }
}
function getTenantId(): string | null {
  try { return localStorage.getItem(STORAGE_KEYS.tenant); } catch { return null; }
}

export interface ApiResult<T> {
  data: T;
  meta?: ListMeta;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  let envelope: Envelope<unknown>;

  if (CONFIG.useMock) {
    envelope = await mockFetch(method, path, body);
  } else {
    const res = await fetch(`${CONFIG.apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(getTenantId() ? { "X-Tenant-ID": getTenantId()! } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    // NEXT: saat backend auth hidup — tangkap 401 di sini, coba POST /auth/refresh
    // sekali (rotasi refresh token), ulangi request, baru lempar error.
    if (res.status === 204) return { data: undefined as T };
    envelope = (await res.json()) as Envelope<unknown>;
    if (!envelope.success) {
      throw new ApiError(envelope.error?.code ?? "unknown", envelope.error?.message ?? "Terjadi kesalahan.", res.status);
    }
    return { data: envelope.data as T, meta: envelope.meta };
  }

  if (!envelope.success) {
    throw new ApiError(envelope.error?.code ?? "unknown", envelope.error?.message ?? "Terjadi kesalahan.");
  }
  return { data: envelope.data as T, meta: envelope.meta };
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
