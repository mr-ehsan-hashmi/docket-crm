"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/toast";
import { useCreateContact } from "@/lib/contacts/queries";
import { ContactForm, EMPTY_CONTACT_FORM } from "./contact-form";

export function NewContactScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const createContact = useCreateContact();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New contact"
        description="Capture the essentials while they're on the line. You can add detail later."
        backLink={{ href: "/contacts", label: "All contacts" }}
      />
      <ContactForm
        defaultValues={EMPTY_CONTACT_FORM}
        submitLabel="Add contact"
        submittingLabel="Adding…"
        cancelHref="/contacts"
        isSubmitting={createContact.isPending}
        isSaved={createContact.isSuccess}
        submitError={createContact.error}
        onSubmit={(values) =>
          createContact.mutate(values, {
            onSuccess: (contact) => {
              showToast(`${contact.fullName} added to contacts.`);
              router.push(`/contacts/${contact.id}`);
            },
          })
        }
      />
    </div>
  );
}
