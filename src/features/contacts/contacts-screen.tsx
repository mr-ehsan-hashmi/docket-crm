"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRegion } from "@/components/ui/skeleton";
import { ErrorState, StateMessage } from "@/components/ui/state-message";
import {
  countByStatus,
  countFollowUps,
  filterContacts,
  hasActiveFilters,
  type ContactFilters,
} from "@/lib/contacts/filter";
import { FOLLOW_UP_AFTER_DAYS } from "@/lib/contacts/follow-up";
import { useContacts } from "@/lib/contacts/queries";
import { ContactList, ContactListSkeleton } from "./contact-list";
import { ContactsToolbar } from "./contacts-toolbar";
import { useContactFilters } from "./use-contact-filters";

function describeTotal(total: number | undefined) {
  if (total === undefined) return "Everyone who has enquired with the firm.";
  if (total === 0) return "Nobody on file yet.";
  return total === 1 ? "1 person on file." : `${total} people on file.`;
}

function describeNoMatches(filters: ContactFilters): { title: string; description: string } {
  const query = filters.query.trim();
  if (query) {
    const narrowed = filters.status !== "all" || filters.followUp;
    return {
      title: "No contacts match",
      description: `Nothing found for "${query}"${narrowed ? " with these filters" : ""}. Check the spelling or widen the filter.`,
    };
  }
  if (filters.followUp) {
    return {
      title: "Nobody is waiting on a follow-up",
      description: `Leads show up here once they've gone ${FOLLOW_UP_AFTER_DAYS} days without a note or a status change.`,
    };
  }
  return { title: "No contacts match", description: "There's nobody in this status right now." };
}

export function ContactsScreen() {
  const { filters, setFilters, clearFilters } = useContactFilters();
  const contactsQuery = useContacts();
  const contacts = contactsQuery.data;

  const visibleContacts = useMemo(() => (contacts ? filterContacts(contacts, filters) : []), [contacts, filters]);
  const counts = useMemo(() => (contacts ? countByStatus(contacts, filters) : undefined), [contacts, filters]);
  const followUpCount = useMemo(
    () => (contacts ? countFollowUps(contacts, filters.query) : undefined),
    [contacts, filters.query],
  );

  function renderBody() {
    if (contactsQuery.isPending) {
      return (
        <LoadingRegion label="Loading contacts">
          <ContactListSkeleton />
        </LoadingRegion>
      );
    }

    // a failed background refetch keeps whatever is already on screen
    if (contacts === undefined) {
      return (
        <ErrorState
          title="We couldn't load your contacts"
          error={contactsQuery.error}
          onRetry={() => void contactsQuery.refetch()}
          isRetrying={contactsQuery.isFetching}
        />
      );
    }

    if (contacts.length === 0) {
      return (
        <StateMessage
          title="No one on file yet"
          description="When someone calls, emails or walks in, add them here so the enquiry doesn't get lost between shifts."
          actions={
            <Link href="/contacts/new" className={buttonStyles({ variant: "primary" })}>
              Add the first contact
            </Link>
          }
        />
      );
    }

    if (visibleContacts.length === 0) {
      return (
        <StateMessage
          {...describeNoMatches(filters)}
          actions={
            hasActiveFilters(filters) ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear search and filters
              </Button>
            ) : null
          }
        />
      );
    }

    return <ContactList contacts={visibleContacts} />;
  }

  const hasContacts = contacts === undefined || contacts.length > 0;

  return (
    <>
      <PageHeader title="Contacts" description={describeTotal(contacts?.length)} />
      {hasContacts ? (
        <ContactsToolbar filters={filters} counts={counts} followUpCount={followUpCount} onChange={setFilters} />
      ) : null}
      {renderBody()}
    </>
  );
}
