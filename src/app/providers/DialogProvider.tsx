// Dialog gaya sweet-alert TANPA dependensi (keputusan di docs/konsep-ui-ux.md §6):
//   const dialog = useDialog();
//   if (await dialog.confirm({ title, text, tone: "danger" })) { … }
//   await dialog.alert({ tone: "success", title, text });
// Dibangun di atas primitif components/modal/Modal — satu basis untuk semua
// dialog. Ingin pindah ke paket sweetalert2? Cukup tukar isi provider ini,
// seluruh pemanggil tidak berubah.
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "error" | "info" | "warning";

interface ConfirmOptions {
  title: string;
  text?: string;
  tone?: "default" | "danger";
  confirmText?: string;
  cancelText?: string;
}
interface AlertOptions {
  title: string;
  text?: string;
  tone?: AlertTone;
}

interface DialogApi {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogApi>({
  confirm: async () => false,
  alert: async () => {},
});

type Pending =
  | { kind: "confirm"; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: "alert"; opts: AlertOptions; resolve: () => void };

const toneIcon: Record<AlertTone | "danger" | "default", { icon: Parameters<typeof Icon>[0]["name"]; cls: string }> = {
  success: { icon: "check-circle", cls: "bg-ok-soft text-ok" },
  error: { icon: "alert-triangle", cls: "bg-danger-soft text-danger" },
  warning: { icon: "alert-triangle", cls: "bg-warn-soft text-warn" },
  info: { icon: "info", cls: "bg-accent-soft text-accent" },
  danger: { icon: "alert-triangle", cls: "bg-danger-soft text-danger" },
  default: { icon: "help-circle", cls: "bg-accent-soft text-accent" },
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const busyRef = useRef(false);

  const close = useCallback(() => setPending(null), []);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ kind: "confirm", opts, resolve })),
    [],
  );
  const alert = useCallback(
    (opts: AlertOptions) =>
      new Promise<void>((resolve) => setPending({ kind: "alert", opts, resolve })),
    [],
  );

  const settle = (value: boolean) => {
    if (!pending || busyRef.current) return;
    busyRef.current = true;
    if (pending.kind === "confirm") pending.resolve(value);
    else pending.resolve();
    close();
    busyRef.current = false;
  };

  const tone =
    pending?.kind === "confirm"
      ? (pending.opts.tone ?? "default")
      : (pending?.opts.tone ?? "info");
  const visual = toneIcon[tone];

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <Modal open={pending !== null} onClose={() => settle(false)} size="sm" locked>
        {pending && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className={cn("flex size-14 items-center justify-center rounded-full", visual.cls)}>
              <Icon name={visual.icon} className="size-7" />
            </span>
            <h3 className="text-base font-semibold">{pending.opts.title}</h3>
            {pending.opts.text && <p className="text-sm text-ink2">{pending.opts.text}</p>}

            <div className="mt-3 flex w-full justify-center gap-2">
              {pending.kind === "confirm" ? (
                <>
                  <Button variant="outline" onClick={() => settle(false)}>
                    {pending.opts.cancelText ?? "Batal"}
                  </Button>
                  <Button
                    variant={pending.opts.tone === "danger" ? "danger" : "primary"}
                    onClick={() => settle(true)}
                  >
                    {pending.opts.confirmText ?? "Ya, lanjutkan"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => settle(true)}>Oke</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
