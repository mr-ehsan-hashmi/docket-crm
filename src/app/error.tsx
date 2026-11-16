"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StateMessage
      tone="danger"
      title="This screen ran into a problem"
      description="Your saved contacts are untouched. Reloading the screen usually clears it."
      actions={
        <Button variant="secondary" onClick={retry}>
          Reload this screen
        </Button>
      }
    />
  );
}
