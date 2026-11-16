import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactDetailScreen, ContactDetailSkeleton } from "@/features/contacts/contact-detail-screen";

export const metadata: Metadata = { title: "Contact" };

export default function ContactDetailPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <Suspense fallback={<ContactDetailSkeleton />}>
      {params.then(({ id }) => (
        <ContactDetailScreen id={id} />
      ))}
    </Suspense>
  );
}
