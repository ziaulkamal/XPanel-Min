// Stat tile mengikuti kontrak dataviz: label (sentence case) · value (semibold,
// auto-compact, angka proporsional — bukan tabular) · delta opsional (bertanda,
// vs periode bernama; warna = arah × apakah naik itu baik).
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icons";

export function StatTile({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: { value: number; vs: string; upIsGood?: boolean };
  icon: IconName;
}) {
  const up = (delta?.value ?? 0) >= 0;
  const good = delta ? (delta.upIsGood ?? true) === up : true;
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink3">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {delta && (
        <p className={cn("mt-2 text-xs", good ? "text-ok" : "text-danger")}>
          {up ? "+" : ""}
          {delta.value}% <span className="text-ink3">vs {delta.vs}</span>
        </p>
      )}
    </div>
  );
}
