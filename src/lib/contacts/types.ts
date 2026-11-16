export const CONTACT_STATUSES = ["lead", "active", "closed"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const PRACTICE_AREAS = [
  "family",
  "immigration",
  "property",
  "employment",
  "criminal",
  "corporate",
] as const;
export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export const REFERRAL_SOURCES = [
  "website",
  "phone",
  "walk_in",
  "client_referral",
  "bar_association",
] as const;
export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  practiceArea: PracticeArea;
  referralSource: ReferralSource;
  status: ContactStatus;
  assignedTo: string;
  matterSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  contactId: string;
  body: string;
  createdAt: string;
}

interface ActivityBase {
  id: string;
  contactId: string;
  createdAt: string;
}

export type Activity = ActivityBase &
  (
    | { type: "created" }
    | { type: "status_changed"; from: ContactStatus; to: ContactStatus }
    | { type: "details_updated"; fields: string[] }
    | { type: "note_added"; excerpt: string }
  );

export interface ContactDetail {
  contact: Contact;
  notes: Note[];
  activities: Activity[];
}
