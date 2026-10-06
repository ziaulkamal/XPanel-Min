// Top menu: toggle sidebar, breadcrumb (dari app/nav.ts), pencarian global
// (mengarah ke daftar konten), toggle tema, dan menu profil.
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pageTitle } from "@/app/nav";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/icons";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");

  const crumb = pageTitle(pathname);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/contents?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-ink2 hover:bg-surface2 lg:hidden"
        aria-label="Buka menu navigasi"
      >
        <Icon name="menu" className="size-5" />
      </button>

      {/* Breadcrumb */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          {crumb.group && <span className="text-ink3">{crumb.group} / </span>}
          <span className="font-semibold">{crumb.title}</span>
        </p>
      </div>

      {/* Pencarian global */}
      <form onSubmit={onSearch} className="relative hidden md:block">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari konten…  "
          className="h-9 w-64 rounded-lg border border-line bg-bg pl-9 pr-3 text-sm placeholder:text-ink3 focus:border-accent focus:outline-none"
        />
      </form>

      {/* Toggle tema */}
      <button
        onClick={toggle}
        className="rounded-lg p-2 text-ink2 hover:bg-surface2"
        aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} className="size-4.5" />
      </button>

      <div className="h-6 w-px bg-line" />

      {/* Profil */}
      <Dropdown
        trigger={() => (
          <span className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-surface2">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              {(user?.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-32 truncate text-xs font-semibold">{user?.name}</span>
              <span className="block text-[10px] text-ink3">Owner</span>
            </span>
            <Icon name="chevron-down" className="hidden size-3.5 text-ink3 sm:block" />
          </span>
        )}
      >
        <DropdownItem onClick={() => navigate("/settings")}>
          <Icon name="settings" className="size-4" /> Pengaturan
        </DropdownItem>
        <DropdownItem tone="danger" onClick={logout}>
          <Icon name="log-out" className="size-4" /> Keluar
        </DropdownItem>
      </Dropdown>
    </header>
  );
}
