"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_DOT_CLASSES } from "@/components/ui/status-badge";
import { STATUS_HINTS, STATUS_LABELS } from "@/lib/contacts/labels";
import type { Contact, ContactStatus } from "@/lib/contacts/types";
import { cn } from "@/lib/format";
import { PipelineCard } from "./pipeline-card";

const COLUMN_FRAME = "flex w-[85%] shrink-0 snap-center flex-col rounded-lg border border-rule bg-rule/35 md:w-auto md:shrink";

function ColumnHeader({ status, count }: { status: ContactStatus; count: ReactNode }) {
  return (
    <div className="border-b border-rule px-4 py-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={cn("size-2 rounded-full", STATUS_DOT_CLASSES[status])} />
        <h2 className="font-serif text-lg font-medium">{STATUS_LABELS[status]}</h2>
        <span className="ml-auto text-sm tabular-nums text-ink-faint">{count}</span>
      </div>
      <p className="mt-0.5 text-xs text-ink-faint">{STATUS_HINTS[status]}</p>
    </div>
  );
}

interface PipelineColumnProps {
  status: ContactStatus;
  contacts: Contact[];
  onMove: (contact: Contact, status: ContactStatus) => void;
}

export function PipelineColumn({ status, contacts, onMove }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${STATUS_LABELS[status]}, ${contacts.length} ${contacts.length === 1 ? "contact" : "contacts"}`}
      className={cn(COLUMN_FRAME, "transition-colors", isOver && "border-brand bg-brand-tint")}
    >
      <ColumnHeader status={status} count={contacts.length} />
      {contacts.length === 0 ? (
        <p className="m-3 rounded-md border border-dashed border-rule-strong px-3 py-8 text-center text-sm text-ink-soft">
          No one is {STATUS_LABELS[status].toLowerCase()} right now.
          <span className="hidden md:inline"> Drag a card here to change that.</span>
        </p>
      ) : (
        <ul className="flex min-h-24 flex-1 flex-col gap-2.5 p-3">
          {contacts.map((contact) => (
            <PipelineCard key={contact.id} contact={contact} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function PipelineColumnSkeleton({ status, cards }: { status: ContactStatus; cards: number }) {
  return (
    <div className={COLUMN_FRAME}>
      <ColumnHeader status={status} count="–" />
      <div className="flex flex-col gap-2.5 p-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="space-y-2 rounded-md border border-rule bg-card p-3.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
