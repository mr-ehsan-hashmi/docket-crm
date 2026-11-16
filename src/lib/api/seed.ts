import type {
  Activity,
  Contact,
  ContactStatus,
  Note,
  PracticeArea,
  ReferralSource,
} from "@/lib/contacts/types";
import { excerptOf } from "@/lib/format";
import type { Database } from "./storage";

interface SeedContact {
  fullName: string;
  email: string;
  phone: string;
  practiceArea: PracticeArea;
  referralSource: ReferralSource;
  status: ContactStatus;
  assignedTo: string;
  matterSummary: string;
  enquiredDaysAgo: number;
  notes?: string[];
  declinedAtIntake?: boolean;
}

const SEED_CONTACTS: SeedContact[] = [
  {
    fullName: "Amara Osei",
    email: "amara.osei@fastmail.com",
    phone: "+1 (415) 555-0132",
    practiceArea: "immigration",
    referralSource: "website",
    status: "lead",
    assignedTo: "",
    matterSummary:
      "H-1B expires in March. Employer has gone quiet on the green card sponsorship and she wants to know her options.",
    enquiredDaysAgo: 1,
  },
  {
    fullName: "Tomás Villareal",
    email: "tvillareal@outlook.com",
    phone: "+1 (510) 555-0178",
    practiceArea: "employment",
    referralSource: "phone",
    status: "lead",
    assignedTo: "Daniel Okafor",
    matterSummary:
      "Let go two weeks after filing a safety complaint. Has the termination letter and the original complaint email.",
    enquiredDaysAgo: 3,
    notes: [
      "Called back at 4pm. He can come in Thursday. Asked him to bring the severance offer, unsigned.",
    ],
  },
  {
    fullName: "Priya Raghunathan",
    email: "priya.r@gmail.com",
    phone: "",
    practiceArea: "family",
    referralSource: "client_referral",
    status: "lead",
    assignedTo: "",
    matterSummary: "Wants to revisit a custody schedule now that she is relocating for work. Email only, do not call.",
    enquiredDaysAgo: 4,
  },
  {
    fullName: "Henrik Lindqvist",
    email: "henrik@lindqvistdesign.se",
    phone: "+46 70 555 01 44",
    practiceArea: "corporate",
    referralSource: "bar_association",
    status: "lead",
    assignedTo: "Imogen Hale",
    matterSummary: "Setting up a US subsidiary for a Stockholm design studio. Needs entity advice before a January lease.",
    enquiredDaysAgo: 6,
  },
  {
    fullName: "Grace Whitlock",
    email: "grace.whitlock@icloud.com",
    phone: "+1 (628) 555-0109",
    practiceArea: "property",
    referralSource: "walk_in",
    status: "active",
    assignedTo: "Rafael Mendes",
    matterSummary:
      "Boundary dispute with a neighbour over a shared driveway. Survey from 1998 contradicts the county record.",
    enquiredDaysAgo: 18,
    notes: [
      "Engagement letter signed. Retainer received.",
      "Ordered a fresh survey. Surveyor expects two weeks.",
    ],
  },
  {
    fullName: "Khalid Mansour",
    email: "k.mansour@proton.me",
    phone: "+1 (415) 555-0166",
    practiceArea: "immigration",
    referralSource: "client_referral",
    status: "active",
    assignedTo: "Farah Qureshi",
    matterSummary: "Family-based petition for his mother. Priority date is current, documents mostly gathered.",
    enquiredDaysAgo: 25,
    notes: ["Missing a certified translation of the birth certificate. He is arranging it."],
  },
  {
    fullName: "Bea Castellanos",
    email: "bea@castellanosbakery.com",
    phone: "+1 (510) 555-0121",
    practiceArea: "employment",
    referralSource: "website",
    status: "active",
    assignedTo: "Daniel Okafor",
    matterSummary: "Bakery owner responding to a wage claim from a former employee. Hearing date not yet set.",
    enquiredDaysAgo: 31,
  },
  {
    fullName: "Jun Takahashi",
    email: "jun.takahashi@gmail.com",
    phone: "+1 (650) 555-0190",
    practiceArea: "family",
    referralSource: "phone",
    status: "active",
    assignedTo: "Farah Qureshi",
    matterSummary: "Uncontested divorce, no children. Both parties agree on the property split.",
    enquiredDaysAgo: 40,
    notes: ["Spouse's attorney confirmed they will accept service by email."],
  },
  {
    fullName: "Marguerite Dubois",
    email: "m.dubois@orange.fr",
    phone: "+33 6 55 50 12 34",
    practiceArea: "property",
    referralSource: "bar_association",
    status: "closed",
    assignedTo: "Rafael Mendes",
    matterSummary: "Purchase of a second home in Sonoma. Closed escrow without issues.",
    enquiredDaysAgo: 95,
    notes: ["Final invoice paid. File archived."],
  },
  {
    fullName: "Desmond Achebe",
    email: "",
    phone: "+1 (415) 555-0155",
    practiceArea: "criminal",
    referralSource: "walk_in",
    status: "closed",
    assignedTo: "",
    matterSummary: "Asked about a traffic misdemeanour. Outside what we take on, referred to the public defender's office.",
    enquiredDaysAgo: 52,
    notes: ["Declined. Gave him the number for the county public defender."],
    declinedAtIntake: true,
  },
  {
    fullName: "Sofia Bianchi",
    email: "sofia.bianchi@hey.com",
    phone: "+1 (628) 555-0147",
    practiceArea: "corporate",
    referralSource: "client_referral",
    status: "closed",
    assignedTo: "Imogen Hale",
    matterSummary: "Founder agreement and IP assignment for a two-person startup.",
    enquiredDaysAgo: 120,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function buildSeedDatabase(now: number, createId: () => string): Database {
  const contacts: Contact[] = [];
  const notes: Note[] = [];
  const activities: Activity[] = [];

  for (const seed of SEED_CONTACTS) {
    const contactId = createId();
    const enquiredAt = now - seed.enquiredDaysAgo * DAY_MS;
    const step = (now - enquiredAt) / 5;
    const at = (index: number) => new Date(enquiredAt + step * index - HOUR_MS * 0.5).toISOString();
    let lastTouched = new Date(enquiredAt).toISOString();

    activities.push({ id: createId(), contactId, type: "created", createdAt: lastTouched });

    if (seed.status !== "lead") {
      lastTouched = at(1);
      activities.push({
        id: createId(),
        contactId,
        type: "status_changed",
        from: "lead",
        to: seed.declinedAtIntake ? "closed" : "active",
        createdAt: lastTouched,
      });
    }

    (seed.notes ?? []).forEach((body, index) => {
      lastTouched = at(2 + index);
      notes.push({ id: createId(), contactId, body, createdAt: lastTouched });
      activities.push({
        id: createId(),
        contactId,
        type: "note_added",
        excerpt: excerptOf(body),
        createdAt: lastTouched,
      });
    });

    if (seed.status === "closed" && !seed.declinedAtIntake) {
      lastTouched = at(4);
      activities.push({
        id: createId(),
        contactId,
        type: "status_changed",
        from: "active",
        to: "closed",
        createdAt: lastTouched,
      });
    }

    contacts.push({
      id: contactId,
      fullName: seed.fullName,
      email: seed.email,
      phone: seed.phone,
      practiceArea: seed.practiceArea,
      referralSource: seed.referralSource,
      status: seed.status,
      assignedTo: seed.assignedTo,
      matterSummary: seed.matterSummary,
      createdAt: new Date(enquiredAt).toISOString(),
      updatedAt: lastTouched,
    });
  }

  return { contacts, notes, activities };
}
