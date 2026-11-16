import { PRACTICE_AREA_LABELS } from "./labels";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "./types";

export const CONTACT_SORTS = ["updated", "name", "newest"] as const;
export type ContactSort = (typeof CONTACT_SORTS)[number];

export const SORT_LABELS: Record<ContactSort, string> = {
  updated: "Recently updated",
  name: "Name, A to Z",
  newest: "Newest enquiry",
};

export type StatusFilter = ContactStatus | "all";

export interface ContactFilters {
  query: string;
  status: StatusFilter;
  sort: ContactSort;
}

export const DEFAULT_FILTERS: ContactFilters = {
  query: "",
  status: "all",
  sort: "updated",
};

function isOneOf<T extends string>(options: readonly T[], value: string | null): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}

export function parseFilters(params: URLSearchParams): ContactFilters {
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    query: params.get("q") ?? DEFAULT_FILTERS.query,
    status: isOneOf(CONTACT_STATUSES, status) ? status : DEFAULT_FILTERS.status,
    sort: isOneOf(CONTACT_SORTS, sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

export function serializeFilters(filters: ContactFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim() !== "") params.set("q", filters.query);
  if (filters.status !== DEFAULT_FILTERS.status) params.set("status", filters.status);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  return params.toString();
}

export function hasActiveFilters(filters: ContactFilters): boolean {
  return filters.query.trim() !== "" || filters.status !== "all";
}

function matchesQuery(contact: Contact, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === "") return true;

  const haystack = [
    contact.fullName,
    contact.email,
    contact.assignedTo,
    PRACTICE_AREA_LABELS[contact.practiceArea],
  ]
    .join(" ")
    .toLowerCase();
  if (haystack.includes(needle)) return true;

  const needleDigits = needle.replace(/\D/g, "");
  return needleDigits.length >= 3 && contact.phone.replace(/\D/g, "").includes(needleDigits);
}

const comparators: Record<ContactSort, (a: Contact, b: Contact) => number> = {
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  name: (a, b) => a.fullName.localeCompare(b.fullName, "en", { sensitivity: "base" }),
};

export function filterContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  return contacts
    .filter(
      (contact) =>
        (filters.status === "all" || contact.status === filters.status) &&
        matchesQuery(contact, filters.query),
    )
    .sort(comparators[filters.sort]);
}

export function countByStatus(contacts: Contact[], query: string): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = { all: 0, lead: 0, active: 0, closed: 0 };
  for (const contact of contacts) {
    if (!matchesQuery(contact, query)) continue;
    counts.all += 1;
    counts[contact.status] += 1;
  }
  return counts;
}

export function groupByStatus(contacts: Contact[]): Record<ContactStatus, Contact[]> {
  const groups: Record<ContactStatus, Contact[]> = { lead: [], active: [], closed: [] };
  for (const contact of [...contacts].sort(comparators.updated)) {
    groups[contact.status].push(contact);
  }
  return groups;
}
