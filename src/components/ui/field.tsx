import type { ReactNode } from "react";
import { cn } from "@/lib/format";

const controlClasses = cn(
  "w-full rounded-md border border-field bg-card text-base text-ink placeholder:text-ink-faint sm:text-sm",
  "aria-invalid:border-danger aria-invalid:bg-danger-tint/40",
);

export const inputClasses = cn(controlClasses, "px-3");
// select-chevron draws our own arrow, the native one sits flush against the right edge
export const selectClasses = cn(controlClasses, "select-chevron h-11 pl-3");

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const fieldHintId = (id: string) => `${id}-hint`;
export const fieldErrorId = (id: string) => `${id}-error`;

export function describedBy(id: string, options: { hint?: boolean; error?: boolean }) {
  const ids = [options.error && fieldErrorId(id), options.hint && fieldHintId(id)].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function Field({ id, label, optional = false, hint, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-ink-faint">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={fieldErrorId(id)} role="alert" className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={fieldHintId(id)} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
