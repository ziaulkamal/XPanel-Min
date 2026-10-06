// Primitif Modal (portal + backdrop + Esc) — basis SEMUA dialog panel:
// sweet-alert DialogProvider, form undangan, dsb. Tanpa dependensi.
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** sm=400px (sweet alert), md=560px (form), lg=760px */
  size?: "sm" | "md" | "lg";
  /** Sembunyikan tombol X & cegah tutup via backdrop (dialog keputusan). */
  locked?: boolean;
}

const sizeCls = { sm: "max-w-sm", md: "max-w-xl", lg: "max-w-3xl" } as const;

export function Modal({ open, onClose, title, children, size = "md", locked = false }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, locked, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-side/60 backdrop-blur-[2px]"
        onClick={locked ? undefined : onClose}
      />
      <div
        className={cn(
          "xp-pop relative w-full rounded-xl border border-line bg-surface shadow-2xl shadow-black/25",
          sizeCls[size],
        )}
      >
        {(title || !locked) && (
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold">{title}</h2>
            {!locked && (
              <button
                onClick={onClose}
                className="rounded-md p-1 text-ink3 hover:bg-surface2 hover:text-ink"
                aria-label="Tutup dialog"
              >
                <Icon name="x" className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
