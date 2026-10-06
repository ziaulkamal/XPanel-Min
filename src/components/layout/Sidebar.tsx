// Sidebar navy (identitas panel — tetap biru tua di light & dark) dengan
// grup bersubmenu yang bisa dibuka/tutup. Struktur menu dari app/nav.ts.
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV, type NavItem } from "@/app/nav";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* overlay mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-side/50 backdrop-blur-[1px] lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-side text-side-ink transition-transform",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-side-line px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent font-bold text-white">
            X
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">XPanel</p>
            <p className="text-[10px] text-side-ink2">Master Admin · Fablerace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <NavEntry key={item.label} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-side-line px-5 py-3">
          <p className="text-[10px] text-side-ink2">v0.1.0 — scaffold</p>
        </div>
      </aside>
    </>
  );
}

function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const childActive = item.children?.some(
    (c) => pathname === c.to || (c.to !== "/" && c.to !== "/settings" && pathname.startsWith(c.to)),
  );
  const [expanded, setExpanded] = useState(Boolean(childActive));

  // Grup ikut terbuka saat rute anaknya aktif (mis. navigasi via topbar/search).
  useEffect(() => {
    if (childActive) setExpanded(true);
  }, [childActive]);

  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        end={item.to === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
            isActive
              ? "bg-side2 text-white shadow-[inset_2px_0_0_0_var(--c-accent)]"
              : "text-side-ink hover:bg-side2/70 hover:text-white",
          )
        }
      >
        <Icon name={item.icon} className="size-4.5 shrink-0" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
          childActive ? "text-white" : "text-side-ink hover:bg-side2/70 hover:text-white",
        )}
      >
        <Icon name={item.icon} className="size-4.5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <Icon
          name="chevron-down"
          className={cn("size-3.5 text-side-ink2 transition-transform", expanded && "rotate-180")}
        />
      </button>
      {expanded && (
        <div className="ml-[22px] mt-0.5 space-y-0.5 border-l border-side-line pl-3">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                  isActive
                    ? "bg-side2 font-medium text-white"
                    : "text-side-ink2 hover:bg-side2/60 hover:text-side-ink",
                )
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
