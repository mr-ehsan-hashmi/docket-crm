"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRegion } from "@/components/ui/skeleton";
import { ErrorState, StateMessage } from "@/components/ui/state-message";
import { countByStatus, filterContacts, hasActiveFilters } from "@/lib/contacts/filter";
import { useContacts } from "@/lib/contacts/queries";
import { ContactList, ContactListSkeleton } from "./contact-list";
import { ContactsToolbar } from "./contacts-toolbar";
import { useContactFilters } from "./use-contact-filters";

function describeTotal(total: number | undefined) {
  if (total === undefined) return "Everyone who has enquired with the firm.";
  if (total === 0) return "Nobody on file yet.";
  return total === 1 ? "1 person on file." : `${total} people on file.`;
}

export function ContactsScreen() {
  const { filters, setFilters, clearFilters } = useContactFilters();
  const contactsQuery = useContacts();
  const contacts = contactsQuery.data;

  const visibleContacts = useMemo(() => (contacts ? filterContacts(contacts, filters) : []), [contacts, filters]);
  const counts = useMemo(
    () => (contacts ? countByStatus(contacts, filters.query) : undefined),
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

    if (contactsQuery.isError) {
      return (
        <ErrorState
          title="We couldn't load your contacts"
          error={contactsQuery.error}
          onRetry={() => void contactsQuery.refetch()}
          isRetrying={contactsQuery.isFetching}
        />
      );
    }

    if (contactsQuery.data.length === 0) {
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
          title="No contacts match"
          description={
            filters.query.trim()
              ? `Nothing found for "${filters.query.trim()}"${filters.status === "all" ? "" : " in this status"}. Check the spelling or widen the filter.`
              : "There's nobody in this status right now."
          }
          actions={
            hasActiveFilters(filters) ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear search and filter
              </Button>
            ) : null
          }
        />
      );
    }

    return <ContactList contacts={visibleContacts} />;
  }

  return (
    <>
      <PageHeader title="Contacts" description={describeTotal(contacts?.length)} />
      <ContactsToolbar filters={filters} counts={counts} onChange={setFilters} />
      {renderBody()}
    </>
  );
}
