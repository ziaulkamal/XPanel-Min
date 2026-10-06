// Tabel rute + guard auth. Struktur menu sidebar hidup di app/nav.ts —
// keduanya dijaga sinkron saat menambah modul baru.
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";
import { Shell } from "@/components/layout/Shell";
import { PageLoader } from "@/components/ui/Spinner";
import { AuthLayout } from "@/modules/auth/AuthLayout";
import { LoginPage } from "@/modules/auth/LoginPage";
import { RegisterPage } from "@/modules/auth/RegisterPage";
import { ForgotPage } from "@/modules/auth/ForgotPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { ContentListPage } from "@/modules/content/ContentListPage";

// Editor dimuat lazy: TipTap (chunk terbesar) hanya diunduh saat menyunting.
const ContentEditorPage = lazy(() =>
  import("@/modules/content/ContentEditorPage").then((m) => ({ default: m.ContentEditorPage })),
);

function LazyEditor() {
  return (
    <Suspense fallback={<PageLoader label="Memuat editor…" />}>
      <ContentEditorPage />
    </Suspense>
  );
}
import { TaxonomyPage } from "@/modules/taxonomy/TaxonomyPage";
import { MediaPage } from "@/modules/media/MediaPage";
import { KeywordPage } from "@/modules/keyword/KeywordPage";
import { MembersPage } from "@/modules/users/MembersPage";
import { LicensePage } from "@/modules/license/LicensePage";
import { SettingsPage } from "@/modules/settings/SettingsPage";

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <p className="text-5xl font-bold text-ink3">404</p>
      <p className="text-sm text-ink2">Laman tidak ditemukan.</p>
      <a href="/" className="mt-2 text-sm font-medium text-accent hover:underline">← Kembali ke Dashboard</a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot", element: <ForgotPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/contents", element: <ContentListPage /> },
          { path: "/contents/new", element: <LazyEditor /> },
          { path: "/contents/:id", element: <LazyEditor /> },
          { path: "/taxonomy", element: <TaxonomyPage /> },
          { path: "/media", element: <MediaPage /> },
          { path: "/keywords", element: <KeywordPage /> },
          { path: "/members", element: <MembersPage /> },
          { path: "/license", element: <LicensePage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/settings/:tab", element: <SettingsPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
