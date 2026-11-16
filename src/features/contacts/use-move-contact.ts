"use client";

import { useToast } from "@/components/toast";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import { useChangeStatus } from "@/lib/contacts/queries";
import type { Contact, ContactStatus } from "@/lib/contacts/types";

export function useMoveContact() {
  const changeStatus = useChangeStatus();
  const { showToast } = useToast();

  function moveContact(contact: Contact, to: ContactStatus, isUndo = false) {
    const from = contact.status;
    if (from === to) return;

    // mutateAsync, not mutate: mutate's callbacks only fire for the latest call,
    // so moving two cards quickly would swallow the first confirmation
    changeStatus.mutateAsync({ id: contact.id, status: to }).then(
      () => {
        if (isUndo) {
          showToast(`${contact.fullName} moved back to ${STATUS_LABELS[to]}.`);
          return;
        }
        showToast(`${contact.fullName} moved to ${STATUS_LABELS[to]}.`, {
          action: { label: "Undo", onClick: () => moveContact({ ...contact, status: to }, from, true) },
        });
      },
      () => {
        showToast(`Couldn't move ${contact.fullName}, so they're still in ${STATUS_LABELS[from]}.`, {
          tone: "error",
        });
      },
    );
  }

  return moveContact;
}
