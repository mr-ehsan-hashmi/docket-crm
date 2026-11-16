import type { ContactFormValues } from "@/lib/contacts/schema";
import type { Activity, Contact, ContactDetail, ContactStatus, Note } from "@/lib/contacts/types";
import { excerptOf } from "@/lib/format";
import { ApiError } from "./errors";
import { isFailureSimulated } from "./failure-switch";
import { createId, readDatabase, writeDatabase, type Database } from "./storage";

const LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 450;

const FIELD_LABELS = {
  fullName: "name",
  email: "email",
  phone: "phone",
  practiceArea: "practice area",
  referralSource: "source",
  assignedTo: "assigned attorney",
  matterSummary: "matter summary",
} as const satisfies Partial<Record<keyof ContactFormValues, string>>;

type TrackedField = keyof typeof FIELD_LABELS;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function settle<T>(run: () => T): { value: T } | { error: unknown } {
  try {
    return { value: run() };
  } catch (error) {
    return { error };
  }
}

// The work happens straight away and only the reply is delayed, the way a server has
// already handled a request while the response is still travelling. Delaying the write
// itself meant a reload right after a change could lose it.
async function request<T>(operation: (database: Database) => T, options?: { write: boolean }): Promise<T> {
  const outcome = settle(() => {
    if (isFailureSimulated()) {
      throw new ApiError("network", "We couldn't reach the server. Check your connection and try again.");
    }
    const database = readDatabase();
    const result = operation(database);
    if (options?.write) writeDatabase(database);
    return result;
  });

  if (LATENCY_MS > 0) await wait(LATENCY_MS);
  if ("error" in outcome) throw outcome.error;
  return outcome.value;
}

function findContact(database: Database, id: string): Contact {
  const contact = database.contacts.find((candidate) => candidate.id === id);
  if (!contact) throw new ApiError("not_found", "That contact is no longer on file.");
  return contact;
}

function logStatusChange(database: Database, contact: Contact, to: ContactStatus, at: string) {
  database.activities.push({
    id: createId(),
    contactId: contact.id,
    type: "status_changed",
    from: contact.status,
    to,
    createdAt: at,
  });
  contact.status = to;
  contact.updatedAt = at;
}

export function listContacts(): Promise<Contact[]> {
  return request((database) => database.contacts);
}

export function getContactDetail(id: string): Promise<ContactDetail> {
  return request((database) => {
    const newestFirst = (a: Note | Activity, b: Note | Activity) => b.createdAt.localeCompare(a.createdAt);
    return {
      contact: findContact(database, id),
      notes: database.notes.filter((note) => note.contactId === id).sort(newestFirst),
      activities: database.activities.filter((activity) => activity.contactId === id).sort(newestFirst),
    };
  });
}

export function createContact(values: ContactFormValues): Promise<Contact> {
  return request(
    (database) => {
      const now = new Date().toISOString();
      const contact: Contact = { ...values, id: createId(), createdAt: now, updatedAt: now };
      database.contacts.push(contact);
      database.activities.push({ id: createId(), contactId: contact.id, type: "created", createdAt: now });
      return contact;
    },
    { write: true },
  );
}

export function updateContact(id: string, values: ContactFormValues): Promise<Contact> {
  return request(
    (database) => {
      const contact = findContact(database, id);
      const now = new Date().toISOString();

      const changedFields = (Object.keys(FIELD_LABELS) as TrackedField[]).filter(
        (field) => contact[field] !== values[field],
      );
      if (changedFields.length > 0) {
        database.activities.push({
          id: createId(),
          contactId: id,
          type: "details_updated",
          fields: changedFields.map((field) => FIELD_LABELS[field]),
          createdAt: now,
        });
      }
      if (contact.status !== values.status) logStatusChange(database, contact, values.status, now);

      Object.assign(contact, values);
      if (changedFields.length > 0) contact.updatedAt = now;
      return contact;
    },
    { write: true },
  );
}

export function changeContactStatus(id: string, status: ContactStatus): Promise<Contact> {
  return request(
    (database) => {
      const contact = findContact(database, id);
      if (contact.status !== status) logStatusChange(database, contact, status, new Date().toISOString());
      return contact;
    },
    { write: true },
  );
}

export function addNote(contactId: string, body: string): Promise<Note> {
  return request(
    (database) => {
      const contact = findContact(database, contactId);
      const now = new Date().toISOString();
      const note: Note = { id: createId(), contactId, body: body.trim(), createdAt: now };
      database.notes.push(note);
      database.activities.push({
        id: createId(),
        contactId,
        type: "note_added",
        excerpt: excerptOf(note.body),
        createdAt: now,
      });
      contact.updatedAt = now;
      return note;
    },
    { write: true },
  );
}
