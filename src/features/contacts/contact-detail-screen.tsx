"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-message";
import { isNotFound } from "@/lib/api/errors";
import { daysQuiet, needsFollowUp } from "@/lib/contacts/follow-up";
import { PRACTICE_AREA_LABELS, REFERRAL_SOURCE_LABELS, UNASSIGNED_LABEL } from "@/lib/contacts/labels";
import { useContactDetail } from "@/lib/contacts/queries";
import type { Contact } from "@/lib/contacts/types";
import { formatDate, formatRelative } from "@/lib/format";
import { useDocumentTitle } from "@/lib/use-document-title";
import { ActivityTimeline } from "./activity-timeline";
import { ContactNotFound } from "./contact-not-found";
import { NotesPanel } from "./notes-panel";
import { StatusSelect } from "./status-select";

const BACK_LINK = { href: "/contacts", label: "All contacts" };
const DETAIL_GRID = "grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10";
const CARD = "rounded-lg border border-rule bg-card p-5 shadow-card";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-rule py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <dt className="shrink-0 text-sm text-ink-faint">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

const MISSING = <span className="text-ink-faint">Not provided</span>;
const contactLinkClasses = "rounded-sm text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand";

function ContactFacts({ contact }: { contact: Contact }) {
  return (
    <aside aria-label="Contact details" className={CARD}>
      <dl>
        <DetailRow label="Phone">
          {contact.phone ? (
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={contactLinkClasses}>
              {contact.phone}
            </a>
          ) : (
            MISSING
          )}
        </DetailRow>
        <DetailRow label="Email">
          {contact.email ? (
            <a href={`mailto:${contact.email}`} className={contactLinkClasses}>
              {contact.email}
            </a>
          ) : (
            MISSING
          )}
        </DetailRow>
        <DetailRow label="Practice area">{PRACTICE_AREA_LABELS[contact.practiceArea]}</DetailRow>
        <DetailRow label="Attorney">
          {contact.assignedTo || <span className="text-ink-faint">{UNASSIGNED_LABEL}</span>}
        </DetailRow>
        <DetailRow label="Reached us via">{REFERRAL_SOURCE_LABELS[contact.referralSource]}</DetailRow>
        <DetailRow label="Enquired">
          <time dateTime={contact.createdAt}>{formatDate(contact.createdAt)}</time>
        </DetailRow>
        <DetailRow label="Last updated">
          <time dateTime={contact.updatedAt}>{formatRelative(contact.updatedAt)}</time>
        </DetailRow>
      </dl>
    </aside>
  );
}

export function ContactDetailSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className={DETAIL_GRID}>
        <div className="space-y-8">
          <Skeleton className="h-28 w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </>
  );
}

export function ContactDetailScreen({ id }: { id: string }) {
  const detailQuery = useContactDetail(id);
  useDocumentTitle(detailQuery.data?.contact.fullName);

  if (detailQuery.isPending) {
    return (
      <LoadingRegion label="Loading contact">
        <ContactDetailSkeleton />
      </LoadingRegion>
    );
  }

  if (detailQuery.data === undefined || isNotFound(detailQuery.error)) {
    return (
      <>
        <PageHeader title="Contact" backLink={BACK_LINK} />
        {isNotFound(detailQuery.error) ? (
          <ContactNotFound />
        ) : (
          <ErrorState
            title="We couldn't load this contact"
            error={detailQuery.error}
            onRetry={() => void detailQuery.refetch()}
            isRetrying={detailQuery.isFetching}
          />
        )}
      </>
    );
  }

  const { contact, notes, activities } = detailQuery.data;

  return (
    <>
      <PageHeader
        title={contact.fullName}
        description={`${PRACTICE_AREA_LABELS[contact.practiceArea]} enquiry · ${formatDate(contact.createdAt)}`}
        backLink={BACK_LINK}
        actions={
          <>
            <StatusSelect contact={contact} />
            <Link href={`/contacts/${contact.id}/edit`} className={buttonStyles({ variant: "secondary" })}>
              Edit details
            </Link>
          </>
        }
      />

      {needsFollowUp(contact) ? (
        <p className="mb-6 rounded-md border border-lead/30 bg-lead-tint/50 px-4 py-3 text-sm text-ink">
          <strong className="font-semibold">Quiet for {daysQuiet(contact)} days.</strong> Add a note once someone has
          followed up, or change the status if this has moved on.
        </p>
      ) : null}

      <div className={DETAIL_GRID}>
        <div className="space-y-10">
          <section aria-labelledby="matter-heading" className={CARD}>
            <h2 id="matter-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Matter summary
            </h2>
            {contact.matterSummary ? (
              <p className="mt-2 font-serif text-lg leading-relaxed text-ink">{contact.matterSummary}</p>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                No summary yet.{" "}
                <Link href={`/contacts/${contact.id}/edit`} className={contactLinkClasses}>
                  Add one
                </Link>{" "}
                so an attorney can skim it before calling back.
              </p>
            )}
          </section>

          <NotesPanel contactId={contact.id} notes={notes} />
          <ActivityTimeline activities={activities} />
        </div>

        <div className="order-first lg:order-none">
          <ContactFacts contact={contact} />
        </div>
      </div>
    </>
  );
}
