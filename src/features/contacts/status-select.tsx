"use client";

import { useToast } from "@/components/toast";
import { STATUS_DOT_CLASSES } from "@/components/ui/status-badge";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import { useChangeStatus } from "@/lib/contacts/queries";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/lib/contacts/types";
import { cn } from "@/lib/format";

export function StatusSelect({ contact }: { contact: Contact }) {
  const { showToast } = useToast();
  const changeStatus = useChangeStatus();

  function handleChange(status: ContactStatus) {
    changeStatus.mutate(
      { id: contact.id, status },
      {
        onSuccess: () => showToast(`${contact.fullName} marked as ${STATUS_LABELS[status]}.`),
        onError: () =>
          showToast(
            `Couldn't update the status, so ${contact.fullName} is still ${STATUS_LABELS[contact.status]}.`,
            "error",
          ),
      },
    );
  }

  return (
    <label className="relative flex items-center">
      <span className="sr-only">Status</span>
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-3 size-2 rounded-full", STATUS_DOT_CLASSES[contact.status])}
      />
      <select
        value={contact.status}
        onChange={(event) => handleChange(event.target.value as ContactStatus)}
        className="h-11 rounded-md border border-field bg-card pl-7 pr-3 text-base font-medium text-ink sm:text-sm"
      >
        {CONTACT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </label>
  );
}
