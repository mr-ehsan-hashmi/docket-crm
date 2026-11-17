"use client";

import { STATUS_DOT_CLASSES } from "@/components/ui/status-badge";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/lib/contacts/types";
import { cn } from "@/lib/format";
import { useMoveContact } from "./use-move-contact";

export function StatusSelect({ contact }: { contact: Contact }) {
  const moveContact = useMoveContact();

  return (
    <div className="relative flex items-center">
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-3 size-2 rounded-full", STATUS_DOT_CLASSES[contact.status])}
      />
      <select
        aria-label="Status"
        value={contact.status}
        onChange={(event) => moveContact(contact, event.target.value as ContactStatus)}
        className="select-chevron h-11 rounded-md border border-field bg-card pl-7 text-base font-medium text-ink sm:text-sm"
      >
        {CONTACT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
