import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ContactListSkeleton } from "@/features/contacts/contact-list";
import { ContactsScreen } from "@/features/contacts/contacts-screen";

export const metadata: Metadata = { title: "Contacts" };

function ContactsFallback() {
  return (
    <>
      <PageHeader title="Contacts" description="Everyone who has enquired with the firm." />
      <ContactListSkeleton />
    </>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<ContactsFallback />}>
      <ContactsScreen />
    </Suspense>
  );
}
