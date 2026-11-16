import { STATUS_LABELS } from "@/lib/contacts/labels";
import type { ContactStatus } from "@/lib/contacts/types";
import { cn } from "@/lib/format";

export const STATUS_TONE_CLASSES: Record<ContactStatus, string> = {
  lead: "bg-lead-tint text-lead",
  active: "bg-active-tint text-active",
  closed: "bg-closed-tint text-closed",
};

export const STATUS_DOT_CLASSES: Record<ContactStatus, string> = {
  lead: "bg-lead",
  active: "bg-active",
  closed: "bg-closed",
};

export function StatusBadge({ status, className }: { status: ContactStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_TONE_CLASSES[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT_CLASSES[status])} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
