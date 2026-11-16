import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { LastActivity } from "@/components/ui/last-activity";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PRACTICE_AREA_LABELS, UNASSIGNED_LABEL } from "@/lib/contacts/labels";
import type { Contact } from "@/lib/contacts/types";
import { cn } from "@/lib/format";

const ROW_GRID = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_7rem_minmax(0,1.2fr)_8.5rem_1rem] md:items-center md:gap-4";
const LIST_FRAME = "overflow-hidden rounded-lg border border-rule bg-card shadow-card";

function ListHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        ROW_GRID,
        "hidden border-b border-rule px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-faint",
      )}
    >
      <span>Contact</span>
      <span>Matter</span>
      <span>Status</span>
      <span>Attorney</span>
      <span>Updated</span>
    </div>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <li className="border-b border-rule last:border-b-0">
      <Link
        href={`/contacts/${contact.id}`}
        prefetch={false}
        className={cn(ROW_GRID, "group block px-4 py-3.5 transition-colors hover:bg-paper/70 sm:px-5 -outline-offset-2")}
      >
        <div className="flex items-start justify-between gap-3 md:block">
          <div className="min-w-0">
            <p className="truncate font-medium text-ink group-hover:text-brand">{contact.fullName}</p>
            <p className="truncate text-sm text-ink-soft">{contact.email || contact.phone}</p>
          </div>
          <StatusBadge status={contact.status} className="md:hidden" />
        </div>

        <p className="mt-2 text-sm text-ink-soft md:mt-0">
          {PRACTICE_AREA_LABELS[contact.practiceArea]}
          <span className="md:hidden">
            {" · "}
            {contact.assignedTo || UNASSIGNED_LABEL}
            {" · "}
            <LastActivity contact={contact} />
          </span>
        </p>
        <div className="hidden md:block">
          <StatusBadge status={contact.status} />
        </div>
        <p className={cn("hidden truncate text-sm md:block", contact.assignedTo ? "text-ink-soft" : "text-ink-faint")}>
          {contact.assignedTo || UNASSIGNED_LABEL}
        </p>
        <p className="hidden text-sm text-ink-soft md:block">
          <LastActivity contact={contact} />
        </p>
        <ChevronRightIcon className="hidden text-ink-faint group-hover:text-brand md:block" />
      </Link>
    </li>
  );
}

export function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <div className={LIST_FRAME}>
      <ListHeader />
      <ul>
        {contacts.map((contact) => (
          <ContactRow key={contact.id} contact={contact} />
        ))}
      </ul>
    </div>
  );
}

export function ContactListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={LIST_FRAME}>
      <ListHeader />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={cn(ROW_GRID, "border-b border-rule px-4 py-3.5 last:border-b-0 sm:px-5")}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-52" />
          </div>
          <Skeleton className="mt-3 h-3.5 w-24 md:mt-0" />
          <Skeleton className="hidden h-5 w-16 rounded-full md:block" />
          <Skeleton className="hidden h-3.5 w-28 md:block" />
          <Skeleton className="hidden h-3.5 w-20 md:block" />
        </div>
      ))}
    </div>
  );
}
