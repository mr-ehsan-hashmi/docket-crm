"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-message";
import { useToast } from "@/components/toast";
import { isNotFound } from "@/lib/api/errors";
import { useContactDetail, useUpdateContact } from "@/lib/contacts/queries";
import { ContactForm, toFormInput } from "./contact-form";
import { ContactNotFound } from "./contact-not-found";

export function ContactFormSkeleton() {
  return (
    <div className="rounded-lg border border-rule bg-card p-5 shadow-card sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-6 w-32 sm:col-span-2" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={index === 0 ? "space-y-2 sm:col-span-2" : "space-y-2"}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EditContactScreen({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const detailQuery = useContactDetail(id);
  const updateContact = useUpdateContact(id);
  const detailHref = `/contacts/${id}`;

  function renderBody() {
    if (detailQuery.isPending) {
      return (
        <LoadingRegion label="Loading contact">
          <ContactFormSkeleton />
        </LoadingRegion>
      );
    }
    if (detailQuery.isError) {
      return isNotFound(detailQuery.error) ? (
        <ContactNotFound />
      ) : (
        <ErrorState
          title="We couldn't load this contact"
          error={detailQuery.error}
          onRetry={() => void detailQuery.refetch()}
          isRetrying={detailQuery.isFetching}
        />
      );
    }

    return (
      <ContactForm
        defaultValues={toFormInput(detailQuery.data.contact)}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        cancelHref={detailHref}
        isSubmitting={updateContact.isPending}
        submitError={updateContact.error}
        onSubmit={(values) =>
          updateContact.mutate(values, {
            onSuccess: (contact) => {
              showToast(`Changes to ${contact.fullName} saved.`);
              router.push(detailHref);
            },
          })
        }
      />
    );
  }

  const name = detailQuery.data?.contact.fullName;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={name ? `Edit ${name}` : "Edit contact"}
        backLink={{ href: detailHref, label: name ? `Back to ${name}` : "Back to contact" }}
      />
      {renderBody()}
    </div>
  );
}
