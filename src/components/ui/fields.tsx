// Field form seragam: Label + Input/Textarea/Select memakai token yang sama.
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink " +
  "placeholder:text-ink3 focus:border-accent focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-55";

export function Label({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-ink2", className)} {...rest}>
      {children}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "h-9.5", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-20 py-2", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(base, "h-9.5 appearance-none pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function FieldHint({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <p className={cn("mt-1 text-xs", error ? "text-danger" : "text-ink3")}>{children}</p>;
}
