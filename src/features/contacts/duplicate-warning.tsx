"use client";

import { useDeferredValue, useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { findPossibleDuplicates, type DuplicateReason } from "@/lib/contacts/duplicates";
import { UNASSIGNED_LABEL } from "@/lib/contacts/labels";
import { useContacts } from "@/lib/contacts/queries";
import type { ContactFormInput } from "@/lib/contacts/schema";

const REASON_LABELS: Record<DuplicateReason, string> = {
  email: "same email",
  phone: "same phone",
  name: "same name",
};

const MAX_SHOWN = 3;

interface DuplicateWarningProps {
  control: Control<ContactFormInput>;
  excludeId?: string;
  className?: string;
}

export function DuplicateWarning({ control, excludeId, className }: DuplicateWarningProps) {
  const { data: contacts } = useContacts();
  const [fullName, email, phone] = useWatch({ control, name: ["fullName", "email", "phone"] });
  const candidate = useDeferredValue(useMemo(() => ({ fullName, email, phone }), [fullName, email, phone]));

  const matches = useMemo(
    () => (contacts ? findPossibleDuplicates(contacts, candidate, excludeId) : []),
    [contacts, candidate, excludeId],
  );

  if (matches.length === 0) return null;

  return (
    <div role="status" className={className}>
      <div className="rounded-md border border-lead/30 bg-lead-tint/50 px-4 py-3">
        <p className="text-sm font-semibold text-ink">
          {matches.length === 1 ? "Already on file?" : `${matches.length} possible matches on file`}
        </p>
        <p className="mt-0.5 text-sm text-ink-soft">
          Check before saving, so the same person doesn&apos;t end up with two records.
        </p>
        <ul className="mt-3 space-y-2">
          {matches.slice(0, MAX_SHOWN).map(({ contact, reasons }) => (
            <li key={contact.id} className="wrap-anywhere flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <a
                href={`/contacts/${contact.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
              >
                {contact.fullName}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <StatusBadge status={contact.status} />
              <span className="text-ink-soft">
                {contact.assignedTo || UNASSIGNED_LABEL} · {reasons.map((reason) => REASON_LABELS[reason]).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
