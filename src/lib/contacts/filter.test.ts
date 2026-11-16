import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  countByStatus,
  filterContacts,
  parseFilters,
  serializeFilters,
} from "./filter";
import type { Contact } from "./types";

function makeContact(overrides: Partial<Contact>): Contact {
  return {
    id: overrides.fullName ?? "id",
    fullName: "Test Person",
    email: "",
    phone: "",
    practiceArea: "family",
    referralSource: "website",
    status: "lead",
    assignedTo: "",
    matterSummary: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const contacts: Contact[] = [
  makeContact({
    fullName: "Zara Ali",
    status: "lead",
    phone: "+1 (415) 555-0132",
    updatedAt: "2026-03-03T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  }),
  makeContact({
    fullName: "adam Brooks",
    status: "active",
    email: "adam@brooks.co",
    practiceArea: "immigration",
    updatedAt: "2026-03-01T00:00:00.000Z",
    createdAt: "2026-02-01T00:00:00.000Z",
  }),
  makeContact({
    fullName: "Mina Cho",
    status: "closed",
    assignedTo: "Farah Qureshi",
    updatedAt: "2026-03-02T00:00:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
  }),
];

const names = (list: Contact[]) => list.map((contact) => contact.fullName);

describe("filterContacts", () => {
  it("sorts by most recently updated by default", () => {
    expect(names(filterContacts(contacts, DEFAULT_FILTERS))).toEqual(["Zara Ali", "Mina Cho", "adam Brooks"]);
  });

  it("sorts names without caring about case", () => {
    expect(names(filterContacts(contacts, { ...DEFAULT_FILTERS, sort: "name" }))).toEqual([
      "adam Brooks",
      "Mina Cho",
      "Zara Ali",
    ]);
  });

  it("filters by status", () => {
    expect(names(filterContacts(contacts, { ...DEFAULT_FILTERS, status: "active" }))).toEqual(["adam Brooks"]);
  });

  it("searches name, email, attorney and practice area", () => {
    const search = (query: string) => names(filterContacts(contacts, { ...DEFAULT_FILTERS, query }));
    expect(search("  ZARA ")).toEqual(["Zara Ali"]);
    expect(search("brooks.co")).toEqual(["adam Brooks"]);
    expect(search("qureshi")).toEqual(["Mina Cho"]);
    expect(search("immigration")).toEqual(["adam Brooks"]);
  });

  it("matches phone numbers regardless of formatting", () => {
    expect(names(filterContacts(contacts, { ...DEFAULT_FILTERS, query: "5550132" }))).toEqual(["Zara Ali"]);
  });

  it("does not mutate the list it was given", () => {
    const before = names(contacts);
    filterContacts(contacts, { ...DEFAULT_FILTERS, sort: "name" });
    expect(names(contacts)).toEqual(before);
  });
});

describe("countByStatus", () => {
  it("counts every status within the current search", () => {
    expect(countByStatus(contacts, "")).toEqual({ all: 3, lead: 1, active: 1, closed: 1 });
    expect(countByStatus(contacts, "zara")).toEqual({ all: 1, lead: 1, active: 0, closed: 0 });
  });
});

describe("URL filters", () => {
  it("round-trips non-default filters", () => {
    const filters = { query: "ali", status: "lead", sort: "name" } as const;
    expect(parseFilters(new URLSearchParams(serializeFilters(filters)))).toEqual(filters);
  });

  it("keeps the URL empty for default filters", () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });

  it("ignores values that aren't real options", () => {
    expect(parseFilters(new URLSearchParams("status=archived&sort=random"))).toEqual(DEFAULT_FILTERS);
  });
});
