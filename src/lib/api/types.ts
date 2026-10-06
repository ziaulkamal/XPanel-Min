// DTO yang MENCERMINKAN kontrak backend Fablerace (docs/integrasi-backend.md).
// RELASI: Fablerace internal/modules/*/dto.go — perubahan kontrak di backend
// wajib dicerminkan di file ini, satu-satunya sumber tipe API di panel.

export interface ListMeta {
  page: number;
  per_page: number;
  total: number;
}

/** Envelope respons backend: {success,data,meta} | {success:false,error}. */
export interface Envelope<T> {
  success: boolean;
  data?: T;
  meta?: ListMeta;
  error?: { code: string; message: string };
}

// ===== auth =====
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

// ===== content =====
export type ContentStatus = "draft" | "review" | "scheduled" | "published" | "archived";

export interface Content {
  id: string;
  content_type_id: string;
  parent_id?: string | null;
  author_id: string;
  author_name?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentStatus;
  published_at?: string | null;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentType {
  id: string;
  slug: string;
  name: string;
  is_hierarchical: boolean;
}

// ===== taxonomy =====
export interface Taxonomy {
  id: string;
  slug: string;
  name: string;
  is_hierarchical: boolean;
}
export interface Term {
  id: string;
  taxonomy_id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
}

// ===== media =====
export interface MediaItem {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  alt_text: string;
  url?: string;
  created_at: string;
}

// ===== keyword/SEO =====
export interface Keyword {
  id: string;
  phrase: string;
  usage_count?: number;
  created_at: string;
}
export interface CoverageItem {
  content_id: string;
  title: string;
  status: ContentStatus;
  is_primary: boolean;
}

// ===== users/members =====
export type RoleSlug = "owner" | "admin" | "editor" | "author" | "contributor" | "viewer";
export interface Member {
  user_id: string;
  email: string;
  name: string;
  role_slug: RoleSlug;
  joined_at?: string;
}

// ===== license =====
export interface LicenseUsage {
  plan: "starter" | "pro" | "agency";
  status: "trialing" | "active" | "past_due" | "grace" | "suspended" | "cancelled";
  seats: number;
  seats_used: number;
  storage_bytes: number;
  storage_quota: number;
  content_count: number;
  current_period_end?: string | null;
}

// ===== settings =====
export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // "fbr_live_xxxx…" — plaintext penuh hanya tampil sekali saat dibuat
  scopes: string[];
  created_at: string;
  last_used_at?: string | null;
}
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
}

// ===== dashboard (agregat; disajikan mock — NEXT: endpoint ringkasan backend) =====
export interface DashboardSummary {
  total_content: number;
  published: number;
  draft: number;
  storage_bytes: number;
  storage_quota: number;
  publish_last_30d: Array<{ date: string; count: number }>;
  recent_contents: Content[];
  top_keywords: Array<{ phrase: string; usage_count: number }>;
}
