import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactFormSkeleton, EditContactScreen } from "@/features/contacts/edit-contact-screen";

export const metadata: Metadata = { title: "Edit contact" };

export default function EditContactPage({ params }: PageProps<"/contacts/[id]/edit">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl">
          <ContactFormSkeleton />
        </div>
      }
    >
      {params.then(({ id }) => (
        <EditContactScreen id={id} />
      ))}
    </Suspense>
  );
}
