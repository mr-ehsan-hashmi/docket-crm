import { daysQuiet, needsFollowUp } from "@/lib/contacts/follow-up";
import type { Contact } from "@/lib/contacts/types";
import { formatRelative } from "@/lib/format";

export function LastActivity({ contact }: { contact: Contact }) {
  if (needsFollowUp(contact)) {
    return <span className="font-medium text-lead">Quiet for {daysQuiet(contact)} days</span>;
  }
  return <>{formatRelative(contact.updatedAt)}</>;
}
