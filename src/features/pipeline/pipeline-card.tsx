"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { PRACTICE_AREA_LABELS, STATUS_LABELS, UNASSIGNED_LABEL } from "@/lib/contacts/labels";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/lib/contacts/types";
import { cn, formatRelative } from "@/lib/format";

interface CardBodyProps {
  contact: Contact;
  onMove?: (contact: Contact, status: ContactStatus) => void;
}

function CardBody({ contact, onMove }: CardBodyProps) {
  return (
    <>
      <Link
        href={`/contacts/${contact.id}`}
        className="rounded-sm font-medium text-ink hover:text-brand"
        draggable={false}
      >
        {contact.fullName}
      </Link>
      <p className="mt-0.5 text-sm text-ink-soft">{PRACTICE_AREA_LABELS[contact.practiceArea]}</p>
      <p className="mt-2 text-xs text-ink-faint">
        {contact.assignedTo || UNASSIGNED_LABEL} · {formatRelative(contact.updatedAt)}
      </p>

      {onMove ? (
        <label className="mt-3 flex items-center gap-2 border-t border-rule pt-2.5 text-xs text-ink-soft">
          <span className="shrink-0">Move to</span>
          <span className="sr-only">another status: {contact.fullName}</span>
          <select
            value=""
            onChange={(event) => onMove(contact, event.target.value as ContactStatus)}
            className="h-8 flex-1 rounded border border-rule-strong bg-card px-2 text-xs text-ink"
          >
            <option value="" disabled>
              Choose…
            </option>
            {CONTACT_STATUSES.filter((status) => status !== contact.status).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}

const CARD_CLASSES = "rounded-md border border-rule bg-card p-3.5 shadow-card";

export function PipelineCard({ contact, onMove }: Required<CardBodyProps>) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: contact.id });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      className={cn(CARD_CLASSES, "cursor-grab select-none", isDragging && "opacity-40")}
    >
      <CardBody contact={contact} onMove={onMove} />
    </li>
  );
}

export function PipelineCardPreview({ contact }: { contact: Contact }) {
  return (
    <div className={cn(CARD_CLASSES, "rotate-2 cursor-grabbing shadow-lift")}>
      <CardBody contact={contact} />
    </div>
  );
}
