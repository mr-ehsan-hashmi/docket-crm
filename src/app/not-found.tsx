import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

export default function NotFound() {
  return (
    <StateMessage
      title="There's nothing at this address"
      description="The link may be old or mistyped."
      actions={
        <Link href="/contacts" className={buttonStyles({ variant: "primary" })}>
          Go to contacts
        </Link>
      }
    />
  );
}
