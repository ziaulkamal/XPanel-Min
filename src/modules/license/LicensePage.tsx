// Lisensi & pemakaian: kartu plan + meter kuota (fill = severity, track =
// langkah lebih muda dari hue yang sama — spesifikasi meter dataviz).
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { LicenseUsage } from "@/lib/api/types";
import { cn, compactNumber, formatBytes, formatDate } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";

const STATUS_META: Record<LicenseUsage["status"], { label: string; tone: "ok" | "info" | "warn" | "danger" | "neutral" }> = {
  active: { label: "Aktif", tone: "ok" },
  trialing: { label: "Trial", tone: "info" },
  past_due: { label: "Menunggak", tone: "warn" },
  grace: { label: "Masa tenggang", tone: "warn" },
  suspended: { label: "Ditangguhkan (read-only)", tone: "danger" },
  cancelled: { label: "Berhenti", tone: "neutral" },
};

const PLAN_LABEL = { starter: "Starter — $9/bln", pro: "Pro — $25/bln", agency: "Agency — $20/bln/lisensi" } as const;

export function LicensePage() {
  const [lic, setLic] = useState<LicenseUsage | null>(null);

  useEffect(() => {
    void api.get<LicenseUsage>("/license").then((r) => setLic(r.data));
  }, []);

  if (!lic) return <PageLoader />;

  const meters = [
    {
      label: "Storage",
      used: lic.storage_bytes,
      quota: lic.storage_quota,
      fmt: formatBytes,
    },
    {
      label: "Anggota (seat)",
      used: lic.seats_used,
      quota: lic.seats,
      fmt: (n: number) => compactNumber(n),
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Paket langganan" />
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent-soft px-5 py-4">
            <div>
              <p className="text-base font-semibold">{PLAN_LABEL[lic.plan]}</p>
              <p className="mt-0.5 text-xs text-ink2">
                Periode berjalan s/d <b>{formatDate(lic.current_period_end)}</b>
              </p>
            </div>
            <Badge tone={STATUS_META[lic.status].tone}>{STATUS_META[lic.status].label}</Badge>
          </div>
          <p className="text-xs text-ink3">
            Jumlah konten saat ini: <b className="text-ink">{lic.content_count}</b> (tak terbatas pada paket Pro, fair-use).
          </p>
          {/* NEXT: tombol upgrade/kelola pembayaran → portal Paddle/Midtrans
              (RELASI: backend modul license + billing webhook). */}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pemakaian kuota" description="Diukur harian oleh metering platform" />
        <CardBody className="space-y-5">
          {meters.map((m) => {
            const pct = Math.min(100, Math.round((m.used / m.quota) * 100));
            const level = pct >= 95 ? "danger" : pct >= 80 ? "warn" : "ok";
            return (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">{m.label}</span>
                  <span className="text-ink3">
                    {m.fmt(m.used)} / {m.fmt(m.quota)} ({pct}%)
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 rounded-full",
                    level === "danger" ? "bg-danger-soft" : level === "warn" ? "bg-warn-soft" : "bg-accent-soft",
                  )}
                >
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      level === "danger" ? "bg-danger" : level === "warn" ? "bg-warn" : "bg-chart",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {level !== "ok" && (
                  <p className={cn("mt-1 text-[11px]", level === "danger" ? "text-danger" : "text-warn")}>
                    {level === "danger"
                      ? "Kuota hampir habis — upgrade paket atau kurangi pemakaian (masa tenggang 7 hari berlaku)."
                      : "Mendekati batas kuota."}
                  </p>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
