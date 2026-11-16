import { describe, expect, it } from "vitest";
import { findPossibleDuplicates, type DuplicateCandidate } from "./duplicates";
import type { Contact } from "./types";

function makeContact(overrides: Partial<Contact>): Contact {
  return {
    id: overrides.fullName ?? "id",
    fullName: "Someone Else",
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

const onFile: Contact[] = [
  makeContact({ id: "tomas", fullName: "Tomás Villareal", email: "tvillareal@outlook.com", phone: "+1 (510) 555-0178" }),
  makeContact({ id: "ayesha", fullName: "Ayesha Khan", email: "", phone: "+92 300 1234567" }),
  makeContact({ id: "li", fullName: "李娜", email: "li.na@example.com" }),
  makeContact({ id: "wang", fullName: "王芳", email: "wang.fang@example.com" }),
];

const blank: DuplicateCandidate = { fullName: "", email: "", phone: "" };

function find(candidate: Partial<DuplicateCandidate>, excludeId?: string) {
  return findPossibleDuplicates(onFile, { ...blank, ...candidate }, excludeId).map(
    (match) => `${match.contact.id}:${match.reasons.join("+")}`,
  );
}

describe("findPossibleDuplicates", () => {
  it("finds nothing for an empty form", () => {
    expect(find({})).toEqual([]);
  });

  it("matches email regardless of case and padding", () => {
    expect(find({ email: "  TVillareal@Outlook.com " })).toEqual(["tomas:email"]);
  });

  it("matches a phone number written in a different format", () => {
    expect(find({ phone: "510.555.0178" })).toEqual(["tomas:phone"]);
    expect(find({ phone: "15105550178" })).toEqual(["tomas:phone"]);
  });

  it("matches a local number against one saved with a country code", () => {
    expect(find({ phone: "0300 1234567" })).toEqual(["ayesha:phone"]);
  });

  it("ignores phone fragments that are too short to mean anything", () => {
    expect(find({ phone: "0178" })).toEqual([]);
  });

  it("matches names without caring about accents, case or spacing", () => {
    expect(find({ fullName: "tomas  villareal" })).toEqual(["tomas:name"]);
  });

  it("does not match a name that is only half typed", () => {
    expect(find({ fullName: "Tomás" })).toEqual([]);
  });

  it("handles short names in other scripts without mixing them up", () => {
    expect(find({ fullName: "李娜" })).toEqual(["li:name"]);
    expect(find({ fullName: "王芳" })).toEqual(["wang:name"]);
  });

  it("lists the strongest match first", () => {
    const result = find({ fullName: "Ayesha Khan", email: "tvillareal@outlook.com", phone: "+1 510 555 0178" });
    expect(result).toEqual(["tomas:email+phone", "ayesha:name"]);
  });

  it("leaves out the contact being edited", () => {
    expect(find({ email: "tvillareal@outlook.com" }, "tomas")).toEqual([]);
  });
});
