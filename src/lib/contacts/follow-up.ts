import type { Contact } from "./types";

export const FOLLOW_UP_AFTER_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysQuiet(contact: Contact, now: number = Date.now()): number {
  const elapsed = now - new Date(contact.updatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / DAY_MS));
}

// only leads: an active matter has an attorney on it, and closed ones are done
export function needsFollowUp(contact: Contact, now: number = Date.now()): boolean {
  return contact.status === "lead" && daysQuiet(contact, now) >= FOLLOW_UP_AFTER_DAYS;
}
