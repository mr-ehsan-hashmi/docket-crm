import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactFormSkeleton } from "@/features/contacts/edit-contact-screen";
import { NewContactScreen } from "@/features/contacts/new-contact-screen";

export const metadata: Metadata = { title: "New contact" };

export default function NewContactPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl">
          <ContactFormSkeleton />
        </div>
      }
    >
      <NewContactScreen />
    </Suspense>
  );
}
