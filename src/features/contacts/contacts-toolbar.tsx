"use client";

import { SearchIcon } from "@/components/icons";
import {
  CONTACT_SORTS,
  SORT_LABELS,
  type ContactFilters,
  type ContactSort,
  type StatusFilter,
} from "@/lib/contacts/filter";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import { CONTACT_STATUSES } from "@/lib/contacts/types";
import { cn } from "@/lib/format";

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  ...CONTACT_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

const FILTER_BUTTON = "flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors";
const FILTER_BUTTON_IDLE = "text-ink-soft hover:bg-rule/60 hover:text-ink";

interface ContactsToolbarProps {
  filters: ContactFilters;
  counts: Record<StatusFilter, number> | undefined;
  followUpCount: number | undefined;
  onChange: (changes: Partial<ContactFilters>) => void;
}

export function ContactsToolbar({ filters, counts, followUpCount, onChange }: ContactsToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative lg:w-72">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Name, email, phone or attorney"
          aria-label="Search contacts"
          className="h-11 w-full rounded-md border border-field bg-card pl-9 pr-3 text-base placeholder:text-ink-faint sm:text-sm"
        />
      </div>

      {/* the vertical padding is only there so focus rings aren't clipped by the scroll container */}
      <div className="-mx-4 -my-1 flex items-center gap-1 overflow-x-auto px-4 py-1 sm:-mx-1 sm:px-1 lg:flex-1">
        <div role="group" aria-label="Filter by status" className="flex gap-1">
          {STATUS_TABS.map((tab) => {
            const isSelected = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ status: tab.value })}
                className={cn(FILTER_BUTTON, isSelected ? "bg-ink text-paper" : FILTER_BUTTON_IDLE)}
              >
                {tab.label}
                <span className={cn("text-xs tabular-nums", isSelected ? "text-paper/70" : "text-ink-faint")}>
                  {counts ? counts[tab.value] : "–"}
                </span>
              </button>
            );
          })}
        </div>

        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-rule-strong" />

        <button
          type="button"
          aria-pressed={filters.followUp}
          onClick={() => onChange({ followUp: !filters.followUp })}
          className={cn(
            FILTER_BUTTON,
            filters.followUp ? "bg-lead-tint text-lead ring-1 ring-inset ring-lead/40" : FILTER_BUTTON_IDLE,
          )}
        >
          Needs follow-up
          <span className={cn("text-xs tabular-nums", filters.followUp ? "text-lead" : "text-ink-faint")}>
            {followUpCount ?? "–"}
          </span>
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <span className="shrink-0">Sort by</span>
        <select
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as ContactSort })}
          className="h-11 flex-1 rounded-md border border-field bg-card px-3 text-base text-ink sm:text-sm lg:flex-none"
        >
          {CONTACT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
