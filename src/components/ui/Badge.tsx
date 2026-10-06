// Badge status: warna TIDAK pernah sendirian — selalu bersama label teks
// (aturan aksesibilitas status, docs/konsep-ui-ux.md §2).
import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/lib/api/types";

type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

const toneCls: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-accent-soft text-accent",
  neutral: "bg-surface2 text-ink2",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", toneCls[tone], className)}>
      {children}
    </span>
  );
}

const statusMeta: Record<ContentStatus, { label: string; tone: Tone }> = {
  published: { label: "Published", tone: "ok" },
  draft: { label: "Draft", tone: "neutral" },
  review: { label: "Review", tone: "warn" },
  scheduled: { label: "Terjadwal", tone: "info" },
  archived: { label: "Arsip", tone: "neutral" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const m = statusMeta[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
