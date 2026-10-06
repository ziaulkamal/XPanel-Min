// Layout laman auth: panel kiri navy (brand + value proposition), kanan form.
// Mobile: hanya form dengan brand ringkas di atas.
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Icon } from "@/components/ui/icons";

export function AuthLayout() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh">
      {/* Panel brand — biru tua, teks putih/silver */}
      <aside className="relative hidden w-[44%] flex-col justify-between bg-side p-10 text-side-ink lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-lg font-bold text-white">X</span>
          <span className="text-lg font-semibold text-white">XPanel</span>
        </div>

        <div>
          <h1 className="max-w-md text-3xl font-semibold leading-snug text-white">
            Satu panel untuk seluruh konten, SEO, dan tim Anda.
          </h1>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Konten berjenjang ala WordPress dengan editor modern",
              "Keyword & automasi SEO bawaan — tanpa plugin",
              "Multi-role: owner sampai viewer, aman per tenant",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Icon name="check-circle" className="mt-0.5 size-4 shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-side-ink2">© 2026 XPanel · Master Admin untuk Fablerace CMS</p>
      </aside>

      {/* Area form */}
      <main className="relative flex flex-1 items-center justify-center bg-bg p-6">
        <button
          onClick={toggle}
          className="absolute right-4 top-4 rounded-lg border border-line bg-surface p-2 text-ink2 hover:text-ink"
          aria-label={theme === "dark" ? "Mode terang" : "Mode gelap"}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} className="size-4" />
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-lg font-bold text-white">X</span>
            <span className="text-lg font-semibold">XPanel</span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
