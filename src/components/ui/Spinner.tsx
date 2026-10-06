import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-ink3">
      <Spinner className="size-6" />
      <p className="text-xs">{label}</p>
    </div>
  );
}
