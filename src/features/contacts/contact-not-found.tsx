import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

export function ContactNotFound() {
  return (
    <StateMessage
      title="This contact isn't on file"
      description="They may have been removed, or the link was copied from a different browser. Contacts here are stored per browser."
      actions={
        <Link href="/contacts" className={buttonStyles({ variant: "primary" })}>
          Back to all contacts
        </Link>
      }
    />
  );
}
