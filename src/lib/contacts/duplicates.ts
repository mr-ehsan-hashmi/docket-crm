import type { Contact } from "./types";

export type DuplicateReason = "email" | "phone" | "name";

export interface DuplicateMatch {
  contact: Contact;
  reasons: DuplicateReason[];
}

export interface DuplicateCandidate {
  fullName: string;
  email: string;
  phone: string;
}

const MIN_PHONE_DIGITS = 7;

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,'’-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// leading zeros go so that "0300 1234567" and "+92 300 1234567" still line up
function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0+/, "");
}

function samePhone(a: string, b: string): boolean {
  const first = phoneDigits(a);
  const second = phoneDigits(b);
  if (first.length < MIN_PHONE_DIGITS || second.length < MIN_PHONE_DIGITS) return false;
  return first.endsWith(second) || second.endsWith(first);
}

function sameEmail(a: string, b: string): boolean {
  const first = a.trim().toLowerCase();
  return first !== "" && first === b.trim().toLowerCase();
}

function sameName(a: string, b: string): boolean {
  const first = normalizeName(a);
  return first !== "" && first === normalizeName(b);
}

export function findPossibleDuplicates(
  contacts: Contact[],
  candidate: DuplicateCandidate,
  excludeId?: string,
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const contact of contacts) {
    if (contact.id === excludeId) continue;

    const reasons: DuplicateReason[] = [];
    if (sameEmail(candidate.email, contact.email)) reasons.push("email");
    if (samePhone(candidate.phone, contact.phone)) reasons.push("phone");
    if (sameName(candidate.fullName, contact.fullName)) reasons.push("name");

    if (reasons.length > 0) matches.push({ contact, reasons });
  }

  return matches.sort((a, b) => b.reasons.length - a.reasons.length);
}
