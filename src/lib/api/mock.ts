// Mock API in-memory: melayani SELURUH endpoint yang dipakai panel sehingga
// UI bisa dijelajah & diuji tanpa backend. Aktif selama VITE_USE_MOCK !== "false".
// Path & bentuk respons SAMA PERSIS dengan backend Fablerace
// (docs/integrasi-backend.md) — mematikan mock tidak mengubah kode modul.
//
// RELASI: src/lib/api/client.ts — pemanggil tunggal mockFetch.

import { sleep, uid, slugify } from "@/lib/utils";
import type {
  AuthUser, Content, ContentStatus, ContentType, CoverageItem, DashboardSummary,
  Envelope, Keyword, LicenseUsage, MediaItem, Member, Taxonomy, Term, TokenResponse,
  ApiKey, Webhook,
} from "./types";

const LATENCY_MS = 220;

// ===== Kredensial demo (ditampilkan di laman login) =====
export const DEMO_EMAIL = "admin@xpanel.dev";
export const DEMO_PASSWORD = "xpanel123";

const demoUser: AuthUser = { id: uid(), name: "Admin Demo", email: DEMO_EMAIL };

// ===== Dataset contoh =====
const now = Date.now();
const day = 86_400_000;
const iso = (t: number) => new Date(t).toISOString();

const types: ContentType[] = [
  { id: uid(), slug: "post", name: "Post", is_hierarchical: false },
  { id: uid(), slug: "page", name: "Page", is_hierarchical: true },
];

const titles = [
  "Panduan Lengkap SEO untuk Pemula", "Mengenal Arsitektur Multi-Tenant",
  "10 Tips Menulis Konten Evergreen", "Studi Kasus: Migrasi dari WordPress",
  "Checklist Peluncuran Website", "Strategi Internal Linking 2026",
  "Optimasi Core Web Vitals", "Cara Kerja Taxonomy Berjenjang",
  "Roadmap Konten Kuartal Ini", "Tentang Kami", "Layanan", "Kontak",
];

const contents: Content[] = titles.map((title, i) => {
  const isPage = i >= 9;
  const status: ContentStatus =
    i % 5 === 0 ? "draft" : i % 7 === 0 ? "review" : i % 11 === 0 ? "scheduled" : "published";
  const created = now - (titles.length - i) * 2.3 * day;
  return {
    id: uid(),
    content_type_id: (isPage ? types[1] : types[0]).id,
    parent_id: null,
    author_id: demoUser.id,
    author_name: demoUser.name,
    title,
    slug: slugify(title),
    excerpt: `Ringkasan singkat untuk “${title}” — dua kalimat pertama yang menarik pembaca.`,
    body: `<h2>${title}</h2><p>Ini adalah isi contoh dari mock API. Sunting lewat editor WYSIWYG untuk mencoba toolbar, lalu simpan — perubahan bertahan selama tab terbuka.</p><ul><li>Poin pertama</li><li>Poin kedua</li></ul>`,
    status,
    published_at: status === "published" ? iso(created + day) : null,
    scheduled_at: status === "scheduled" ? iso(now + 3 * day) : null,
    created_at: iso(created),
    updated_at: iso(created + day / 2),
  };
});

const taxonomies: Taxonomy[] = [
  { id: uid(), slug: "category", name: "Kategori", is_hierarchical: true },
  { id: uid(), slug: "tag", name: "Tag", is_hierarchical: false },
];
const terms: Term[] = (() => {
  const catId = taxonomies[0].id;
  const tagId = taxonomies[1].id;
  const tutorial: Term = { id: uid(), taxonomy_id: catId, parent_id: null, name: "Tutorial", slug: "tutorial" };
  return [
    tutorial,
    { id: uid(), taxonomy_id: catId, parent_id: tutorial.id, name: "SEO", slug: "seo" },
    { id: uid(), taxonomy_id: catId, parent_id: tutorial.id, name: "Teknis", slug: "teknis" },
    { id: uid(), taxonomy_id: catId, parent_id: null, name: "Berita", slug: "berita" },
    { id: uid(), taxonomy_id: tagId, parent_id: null, name: "golang", slug: "golang" },
    { id: uid(), taxonomy_id: tagId, parent_id: null, name: "cms", slug: "cms" },
  ];
})();

const media: MediaItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: uid(),
  file_name: `ilustrasi-${i + 1}.webp`,
  mime_type: "image/webp",
  size_bytes: 180_000 + i * 42_000,
  width: 1280,
  height: 720,
  alt_text: `Ilustrasi artikel ${i + 1}`,
  // SVG placeholder bergradasi navy–silver agar grid media tampak hidup tanpa aset.
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14305a"/><stop offset="1" stop-color="#8ea2c4"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><text x="16" y="160" font-family="sans-serif" font-size="14" fill="#e7ebf3">ilustrasi-${i + 1}.webp</text></svg>`,
  )}`,
  created_at: iso(now - i * 4 * day),
}));

const keywords: Keyword[] = [
  { id: uid(), phrase: "cms indonesia", usage_count: 4, created_at: iso(now - 30 * day) },
  { id: uid(), phrase: "seo pemula", usage_count: 3, created_at: iso(now - 24 * day) },
  { id: uid(), phrase: "multi tenant", usage_count: 2, created_at: iso(now - 18 * day) },
  { id: uid(), phrase: "core web vitals", usage_count: 1, created_at: iso(now - 9 * day) },
];

const members: Member[] = [
  { user_id: demoUser.id, email: DEMO_EMAIL, name: "Admin Demo", role_slug: "owner", joined_at: iso(now - 90 * day) },
  { user_id: uid(), email: "editor@xpanel.dev", name: "Eka Editor", role_slug: "editor", joined_at: iso(now - 60 * day) },
  { user_id: uid(), email: "penulis@xpanel.dev", name: "Putri Penulis", role_slug: "author", joined_at: iso(now - 30 * day) },
];

const license: LicenseUsage = {
  plan: "pro",
  status: "active",
  seats: 15,
  seats_used: members.length,
  storage_bytes: media.reduce((a, m) => a + m.size_bytes, 0) + 9_600_000_000,
  storage_quota: 50 * 1024 ** 3,
  content_count: contents.length,
  current_period_end: iso(now + 17 * day),
};

const apiKeys: ApiKey[] = [
  { id: uid(), name: "Frontend Produksi", prefix: "fbr_live_9f3k…", scopes: ["content.view"], created_at: iso(now - 40 * day), last_used_at: iso(now - day / 6) },
];
const webhooks: Webhook[] = [
  { id: uid(), url: "https://api.vercel.com/v1/integrations/deploy/prj_demo", events: ["content.published"], is_active: true },
];

// ===== Router mock =====
type Json = Record<string, unknown>;

function ok<T>(data: T, meta?: Envelope<T>["meta"]): Envelope<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}
function fail(code: string, message: string): Envelope<never> {
  return { success: false, error: { code, message } };
}

export async function mockFetch(
  method: string,
  path: string,
  body?: unknown,
): Promise<Envelope<unknown>> {
  await sleep(LATENCY_MS);
  const [pathname, queryStr] = path.split("?");
  const q = new URLSearchParams(queryStr ?? "");
  const seg = pathname.split("/").filter(Boolean); // mis. ["contents", ":id", "publish"]
  const b = (body ?? {}) as Json;
  const key = `${method} /${seg[0] ?? ""}`;

  switch (key) {
    // ---- auth ----
    case "POST /auth": {
      const action = seg[1];
      if (action === "login") {
        if (b.email === DEMO_EMAIL && b.password === DEMO_PASSWORD) {
          const tok: TokenResponse = {
            access_token: `mock.${uid()}`, refresh_token: `mockr.${uid()}`,
            expires_in: 900, user: demoUser,
          };
          return ok(tok);
        }
        return fail("invalid_credentials", "Email atau kata sandi salah.");
      }
      if (action === "register") {
        const tok: TokenResponse = {
          access_token: `mock.${uid()}`, refresh_token: `mockr.${uid()}`,
          expires_in: 900,
          user: { id: uid(), name: String(b.name ?? "Pengguna Baru"), email: String(b.email ?? "") },
        };
        return ok(tok);
      }
      if (action === "logout" || action === "refresh") return ok({});
      break;
    }

    // ---- dashboard ----
    case "GET /dashboard": {
      const publish30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now - (29 - i) * day);
        return {
          date: d.toISOString().slice(0, 10),
          count: Math.max(0, Math.round(2 + 2.2 * Math.sin(i / 3.4) + ((i * 7) % 5) - 2)),
        };
      });
      const summary: DashboardSummary = {
        total_content: contents.length,
        published: contents.filter((c) => c.status === "published").length,
        draft: contents.filter((c) => c.status === "draft").length,
        storage_bytes: license.storage_bytes,
        storage_quota: license.storage_quota,
        publish_last_30d: publish30,
        recent_contents: [...contents].sort((a, z) => z.updated_at.localeCompare(a.updated_at)).slice(0, 6),
        top_keywords: keywords.map((k) => ({ phrase: k.phrase, usage_count: k.usage_count ?? 0 })),
      };
      return ok(summary);
    }

    // ---- content-types ----
    case "GET /content-types":
      return ok(types);

    // ---- contents ----
    case "GET /contents": {
      if (seg[1]) {
        const c = contents.find((x) => x.id === seg[1]);
        return c ? ok(c) : fail("content_not_found", "Konten tidak ditemukan.");
      }
      let list = [...contents];
      const status = q.get("status");
      const search = q.get("search")?.toLowerCase();
      if (status) list = list.filter((c) => c.status === status);
      if (search) list = list.filter((c) => c.title.toLowerCase().includes(search));
      list.sort((a, z) => z.created_at.localeCompare(a.created_at));
      const page = Math.max(1, Number(q.get("page") ?? 1));
      const per = Math.min(100, Math.max(1, Number(q.get("per_page") ?? 10)));
      return ok(list.slice((page - 1) * per, page * per), { page, per_page: per, total: list.length });
    }
    case "POST /contents": {
      if (seg[2] === "publish") {
        const c = contents.find((x) => x.id === seg[1]);
        if (!c) return fail("content_not_found", "Konten tidak ditemukan.");
        c.status = "published";
        c.published_at = iso(Date.now());
        c.updated_at = iso(Date.now());
        return ok(c);
      }
      const c: Content = {
        id: uid(),
        content_type_id: String(b.content_type_id ?? types[0].id),
        parent_id: (b.parent_id as string | null) ?? null,
        author_id: demoUser.id,
        author_name: demoUser.name,
        title: String(b.title ?? "Tanpa Judul"),
        slug: String(b.slug ?? "") || slugify(String(b.title ?? "untitled")),
        excerpt: String(b.excerpt ?? ""),
        body: String(b.body ?? ""),
        status: (b.status as ContentStatus) ?? "draft",
        published_at: null,
        scheduled_at: (b.scheduled_at as string | null) ?? null,
        created_at: iso(Date.now()),
        updated_at: iso(Date.now()),
      };
      contents.unshift(c);
      return ok(c);
    }
    case "PATCH /contents": {
      const c = contents.find((x) => x.id === seg[1]);
      if (!c) return fail("content_not_found", "Konten tidak ditemukan.");
      Object.assign(c, {
        ...(b.title !== undefined && { title: String(b.title) }),
        ...(b.slug !== undefined && { slug: String(b.slug) }),
        ...(b.excerpt !== undefined && { excerpt: String(b.excerpt) }),
        ...(b.body !== undefined && { body: String(b.body) }),
        ...(b.status !== undefined && { status: b.status as ContentStatus }),
        ...(b.parent_id !== undefined && { parent_id: b.parent_id as string | null }),
        updated_at: iso(Date.now()),
      });
      if (c.status === "published" && !c.published_at) c.published_at = iso(Date.now());
      return ok(c);
    }
    case "DELETE /contents": {
      const i = contents.findIndex((x) => x.id === seg[1]);
      if (i < 0) return fail("content_not_found", "Konten tidak ditemukan.");
      contents.splice(i, 1);
      return ok({});
    }

    // ---- taxonomies ----
    case "GET /taxonomies":
      if (seg[1] && seg[2] === "terms") return ok(terms.filter((t) => t.taxonomy_id === seg[1]));
      return ok(taxonomies);
    case "POST /taxonomies": {
      if (seg[1] && seg[2] === "terms") {
        const t: Term = {
          id: uid(), taxonomy_id: seg[1],
          parent_id: (b.parent_id as string | null) ?? null,
          name: String(b.name ?? ""), slug: slugify(String(b.name ?? "")),
        };
        terms.push(t);
        return ok(t);
      }
      const t: Taxonomy = {
        id: uid(), slug: slugify(String(b.name ?? "")),
        name: String(b.name ?? ""), is_hierarchical: Boolean(b.is_hierarchical),
      };
      taxonomies.push(t);
      return ok(t);
    }

    // ---- media ----
    case "GET /media": {
      const page = Math.max(1, Number(q.get("page") ?? 1));
      const per = Math.min(100, Math.max(1, Number(q.get("per_page") ?? 12)));
      return ok(media.slice((page - 1) * per, page * per), { page, per_page: per, total: media.length });
    }
    case "POST /media": // presign/confirm — mock langsung "jadi"
      return ok({ media_id: uid(), upload_url: "about:blank", expires_in: 900 });
    case "DELETE /media": {
      const i = media.findIndex((m) => m.id === seg[1]);
      if (i < 0) return fail("media_not_found", "Media tidak ditemukan.");
      media.splice(i, 1);
      return ok({});
    }

    // ---- keywords ----
    case "GET /keywords": {
      if (seg[1] && seg[2] === "coverage") {
        const cov: CoverageItem[] = contents.slice(0, 3).map((c, idx) => ({
          content_id: c.id, title: c.title, status: c.status, is_primary: idx === 0,
        }));
        return ok(cov);
      }
      return ok(keywords);
    }
    case "POST /keywords": {
      const k: Keyword = {
        id: uid(), phrase: String(b.phrase ?? "").toLowerCase().trim(),
        usage_count: 0, created_at: iso(Date.now()),
      };
      if (!k.phrase) return fail("phrase_invalid", "Keyword tidak boleh kosong.");
      if (keywords.some((x) => x.phrase === k.phrase)) return fail("phrase_exists", "Keyword sudah ada.");
      keywords.unshift(k);
      return ok(k);
    }

    // ---- users/members ----
    case "GET /users":
      return ok(members);
    case "POST /users": {
      // /users/invites
      const m: Member = {
        user_id: uid(), email: String(b.email ?? ""), name: String(b.email ?? "").split("@")[0],
        role_slug: (b.role_slug as Member["role_slug"]) ?? "viewer", joined_at: iso(Date.now()),
      };
      members.push(m);
      license.seats_used = members.length;
      return ok(m);
    }

    // ---- license ----
    case "GET /license":
      return ok(license);

    // ---- settings ----
    case "GET /apikeys":
      return ok(apiKeys);
    case "GET /webhooks":
      return ok(webhooks);
  }

  return fail("not_implemented", `Mock belum melayani ${method} ${pathname} — tambahkan di src/lib/api/mock.ts.`);
}
