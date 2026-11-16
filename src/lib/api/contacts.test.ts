import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContactFormValues } from "@/lib/contacts/schema";
import {
  addNote,
  changeContactStatus,
  createContact,
  getContactDetail,
  listContacts,
  updateContact,
} from "./contacts";
import { ApiError } from "./errors";
import { setFailureSimulated } from "./failure-switch";
import { resetDatabase } from "./storage";

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => void entries.delete(key),
    setItem: (key, value) => void entries.set(key, value),
  };
}

const newContact: ContactFormValues = {
  fullName: "Nadia Rahman",
  email: "nadia@example.com",
  phone: "",
  practiceArea: "property",
  referralSource: "phone",
  status: "lead",
  assignedTo: "",
  matterSummary: "Lease dispute.",
};

beforeEach(() => {
  vi.stubGlobal("localStorage", createMemoryStorage());
  resetDatabase("empty");
});

describe("contacts API", () => {
  it("seeds sample contacts on a first visit", async () => {
    localStorage.clear();
    expect((await listContacts()).length).toBeGreaterThan(0);
  });

  it("persists a created contact and logs its first timeline entry", async () => {
    const created = await createContact(newContact);

    expect(await listContacts()).toHaveLength(1);
    const detail = await getContactDetail(created.id);
    expect(detail.contact.fullName).toBe("Nadia Rahman");
    expect(detail.activities.map((activity) => activity.type)).toEqual(["created"]);
  });

  it("records a status change with where it came from and went to", async () => {
    const created = await createContact(newContact);
    await changeContactStatus(created.id, "active");

    const { contact, activities } = await getContactDetail(created.id);
    expect(contact.status).toBe("active");
    expect(activities).toContainEqual(
      expect.objectContaining({ type: "status_changed", from: "lead", to: "active" }),
    );
  });

  it("does not log anything when the status is unchanged", async () => {
    const created = await createContact(newContact);
    await changeContactStatus(created.id, "lead");
    expect((await getContactDetail(created.id)).activities).toHaveLength(1);
  });

  it("names the edited fields and keeps a status change as its own entry", async () => {
    const created = await createContact(newContact);
    await updateContact(created.id, { ...newContact, phone: "+1 415 555 0100", status: "closed" });

    const { activities } = await getContactDetail(created.id);
    expect(activities).toContainEqual(expect.objectContaining({ type: "details_updated", fields: ["phone"] }));
    expect(activities).toContainEqual(expect.objectContaining({ type: "status_changed", to: "closed" }));
  });

  it("saves a note and surfaces it on the timeline", async () => {
    const created = await createContact(newContact);
    await addNote(created.id, "  Left a voicemail.  ");

    const { notes, activities } = await getContactDetail(created.id);
    expect(notes.map((note) => note.body)).toEqual(["Left a voicemail."]);
    expect(activities).toContainEqual(expect.objectContaining({ type: "note_added" }));
  });

  it("rejects with not_found for an unknown contact", async () => {
    await expect(getContactDetail("missing")).rejects.toMatchObject({ code: "not_found" });
  });

  it("fails every request while the failure switch is on, and writes nothing", async () => {
    setFailureSimulated(true);
    await expect(createContact(newContact)).rejects.toBeInstanceOf(ApiError);

    setFailureSimulated(false);
    expect(await listContacts()).toHaveLength(0);
  });
});
