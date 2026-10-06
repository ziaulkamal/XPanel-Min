// Tabel data + pagination seragam (envelope meta {page,per_page,total}).
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";
import { Button } from "./Button";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-surface2/60 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink3",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={cn("border-b border-line px-4 py-3 align-middle", className)} {...rest}>
      {children}
    </td>
  );
}

export function Pagination({
  page,
  perPage,
  total,
  onPage,
}: {
  page: number;
  perPage: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-ink3">
      <span>
        {from}–{to} dari {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Halaman sebelumnya">
          <Icon name="chevron-left" className="size-3.5" />
        </Button>
        <span className="px-2 tabular-nums">
          {page} / {last}
        </span>
        <Button variant="outline" size="sm" disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Halaman berikutnya">
          <Icon name="chevron-right" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
