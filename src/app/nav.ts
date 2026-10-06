// SATU sumber kebenaran navigasi: sidebar (grup + submenu) dan breadcrumb
// topbar dibangun dari struktur ini (RELASI: components/layout/Sidebar.tsx &
// Topbar.tsx). Menambah modul = menambah entri di sini + route di router.tsx.
import type { IconName } from "@/components/ui/icons";

export interface NavChild {
  label: string;
  to: string;
}
export interface NavItem {
  label: string;
  icon: IconName;
  to?: string; // item tunggal
  children?: NavChild[]; // grup bersubmenu
}

export const NAV: NavItem[] = [
  { label: "Dashboard", icon: "layout-grid", to: "/" },
  {
    label: "Konten",
    icon: "file-text",
    children: [
      { label: "Semua Konten", to: "/contents" },
      { label: "Tambah Baru", to: "/contents/new" },
      { label: "Taxonomy", to: "/taxonomy" },
      { label: "Media", to: "/media" },
    ],
  },
  {
    label: "SEO",
    icon: "target",
    children: [{ label: "Keywords", to: "/keywords" }],
  },
  {
    label: "Pengguna",
    icon: "users",
    children: [{ label: "Anggota", to: "/members" }],
  },
  { label: "Lisensi", icon: "credit-card", to: "/license" },
  {
    label: "Pengaturan",
    icon: "settings",
    children: [
      { label: "Umum", to: "/settings" },
      { label: "API Keys", to: "/settings/apikeys" },
      { label: "Webhooks", to: "/settings/webhooks" },
    ],
  },
];

/** Judul laman untuk breadcrumb topbar, dicari dari NAV; fallback per-rute. */
export function pageTitle(pathname: string): { group?: string; title: string } {
  if (pathname.startsWith("/contents/") && pathname !== "/contents/new")
    return { group: "Konten", title: "Sunting Konten" };
  for (const item of NAV) {
    if (item.to === pathname) return { title: item.label };
    for (const c of item.children ?? []) {
      if (c.to === pathname) return { group: item.label, title: c.label };
    }
  }
  return { title: "XPanel" };
}
