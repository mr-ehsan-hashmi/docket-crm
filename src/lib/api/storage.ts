import type { Activity, Contact, Note } from "@/lib/contacts/types";
import { ApiError } from "./errors";
import { buildSeedDatabase } from "./seed";

export interface Database {
  contacts: Contact[];
  notes: Note[];
  activities: Activity[];
}

const DATABASE_KEY = "docket:db:v1";

export function createId(): string {
  return crypto.randomUUID();
}

function isDatabase(value: unknown): value is Database {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.contacts) &&
    Array.isArray(candidate.notes) &&
    Array.isArray(candidate.activities)
  );
}

function parseDatabase(raw: string): Database | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDatabase(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDatabase(database: Database): void {
  try {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
  } catch {
    throw new ApiError(
      "storage",
      "This browser wouldn't save the change. Storage may be full or blocked in private mode.",
    );
  }
}

export function readDatabase(): Database {
  let raw: string | null;
  try {
    raw = localStorage.getItem(DATABASE_KEY);
  } catch {
    throw new ApiError("storage", "This browser is blocking local storage, so contacts can't be loaded.");
  }

  const saved = raw === null ? null : parseDatabase(raw);
  if (saved) return saved;

  // first visit, or the saved data is unreadable: start from the sample set
  const seeded = buildSeedDatabase(Date.now(), createId);
  writeDatabase(seeded);
  return seeded;
}

export function resetDatabase(mode: "sample" | "empty"): void {
  writeDatabase(
    mode === "sample"
      ? buildSeedDatabase(Date.now(), createId)
      : { contacts: [], notes: [], activities: [] },
  );
}
