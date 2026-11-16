import { describe, expect, it } from "vitest";
import { daysQuiet, needsFollowUp } from "./follow-up";
import type { Contact, ContactStatus } from "./types";

const NOW = new Date("2026-03-10T12:00:00.000Z").getTime();
const HOUR = 60 * 60 * 1000;

function touchedHoursAgo(hours: number, status: ContactStatus = "lead"): Contact {
  return {
    id: "c1",
    fullName: "Test Person",
    email: "",
    phone: "",
    practiceArea: "family",
    referralSource: "website",
    status,
    assignedTo: "",
    matterSummary: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date(NOW - hours * HOUR).toISOString(),
  };
}

describe("daysQuiet", () => {
  it("counts whole days only", () => {
    expect(daysQuiet(touchedHoursAgo(23), NOW)).toBe(0);
    expect(daysQuiet(touchedHoursAgo(24), NOW)).toBe(1);
    expect(daysQuiet(touchedHoursAgo(24 * 4 + 5), NOW)).toBe(4);
  });

  it("never goes negative if a clock is slightly off", () => {
    expect(daysQuiet(touchedHoursAgo(-2), NOW)).toBe(0);
  });
});

describe("needsFollowUp", () => {
  it("flags a lead after three quiet days", () => {
    expect(needsFollowUp(touchedHoursAgo(24 * 3 - 1), NOW)).toBe(false);
    expect(needsFollowUp(touchedHoursAgo(24 * 3), NOW)).toBe(true);
  });

  it("leaves active and closed contacts alone however old they are", () => {
    expect(needsFollowUp(touchedHoursAgo(24 * 30, "active"), NOW)).toBe(false);
    expect(needsFollowUp(touchedHoursAgo(24 * 30, "closed"), NOW)).toBe(false);
  });
});
