import type { ReactNode } from "react";
import { describeError } from "@/lib/api/errors";
import { cn } from "@/lib/format";
import { Button } from "./button";

interface StateMessageProps {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}

export function StateMessage({ title, description, actions, tone = "neutral", className }: StateMessageProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={cn(
        "rounded-lg border border-dashed px-6 py-12 text-center",
        tone === "danger" ? "border-danger/40 bg-danger-tint/50" : "border-rule-strong bg-card/60",
        className,
      )}
    >
      <h2 className="font-serif text-xl font-medium text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({ title, error, onRetry, isRetrying = false, className }: ErrorStateProps) {
  return (
    <StateMessage
      tone="danger"
      title={title}
      description={`${describeError(error)} Nothing has been lost.`}
      className={className}
      actions={
        <Button variant="secondary" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Trying again…" : "Try again"}
        </Button>
      }
    />
  );
}
