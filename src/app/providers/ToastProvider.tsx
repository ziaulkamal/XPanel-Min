// Toast ringan tanpa dependensi: tumpukan kanan-atas, auto-dismiss.
// Untuk konfirmasi yang MEMBLOKIR alur gunakan useDialog (DialogProvider),
// toast hanya untuk kabar singkat pasca-aksi.
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn, uid } from "@/lib/utils";
import { Icon } from "@/components/ui/icons";

type Tone = "success" | "error" | "info";
interface Toast { id: string; tone: Tone; message: string }

const ToastContext = createContext<{ push: (tone: Tone, message: string) => void }>({ push: () => {} });

const toneStyle: Record<Tone, { icon: Parameters<typeof Icon>[0]["name"]; cls: string }> = {
  success: { icon: "check-circle", cls: "border-ok/40 text-ok" },
  error: { icon: "alert-triangle", cls: "border-danger/40 text-danger" },
  info: { icon: "info", cls: "border-accent/40 text-accent" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = uid();
      setItems((xs) => [...xs.slice(-3), { id, tone, message }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), 3800));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-80 flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "xp-pop pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-surface p-3 shadow-lg shadow-black/10",
              toneStyle[t.tone].cls,
            )}
          >
            <Icon name={toneStyle[t.tone].icon} className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-ink3 hover:text-ink"
              aria-label="Tutup notifikasi"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { push } = useContext(ToastContext);
  return {
    success: (m: string) => push("success", m),
    error: (m: string) => push("error", m),
    info: (m: string) => push("info", m),
  };
}
