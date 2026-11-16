import type { ContactStatus, PracticeArea, ReferralSource } from "./types";

export const STATUS_LABELS: Record<ContactStatus, string> = {
  lead: "Lead",
  active: "Active",
  closed: "Closed",
};

export const STATUS_HINTS: Record<ContactStatus, string> = {
  lead: "Enquired, not yet engaged",
  active: "Engaged, matter open",
  closed: "Matter finished or declined",
};

export const PRACTICE_AREA_LABELS: Record<PracticeArea, string> = {
  family: "Family",
  immigration: "Immigration",
  property: "Property",
  employment: "Employment",
  criminal: "Criminal defence",
  corporate: "Corporate",
};

export const REFERRAL_SOURCE_LABELS: Record<ReferralSource, string> = {
  website: "Website form",
  phone: "Phone call",
  walk_in: "Walk-in",
  client_referral: "Referred by a client",
  bar_association: "Bar association",
};

export const ATTORNEYS = [
  "Farah Qureshi",
  "Daniel Okafor",
  "Imogen Hale",
  "Rafael Mendes",
] as const;

export const UNASSIGNED_LABEL = "Unassigned";
