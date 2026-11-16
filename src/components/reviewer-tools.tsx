"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  isFailureSimulated,
  setFailureSimulated,
  subscribeToFailureSwitch,
} from "@/lib/api/failure-switch";
import { resetDatabase } from "@/lib/api/storage";
import { useToast } from "./toast";

const linkButtonClasses = "rounded-sm underline underline-offset-2 hover:text-ink";

export function ReviewerTools() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const failureOn = useSyncExternalStore(subscribeToFailureSwitch, isFailureSimulated, () => false);

  function refetchEverything() {
    return queryClient.resetQueries();
  }

  function handleFailureToggle(enabled: boolean) {
    setFailureSimulated(enabled);
    void refetchEverything();
  }

  function handleReset(mode: "sample" | "empty") {
    try {
      resetDatabase(mode);
      void refetchEverything();
      showToast(mode === "sample" ? "Sample contacts restored." : "All contacts removed.");
    } catch {
      showToast("This browser wouldn't let us change saved data.", "error");
    }
  }

  return (
    <details className="group">
      <summary className="w-fit cursor-pointer rounded-sm font-medium text-ink-soft hover:text-ink">
        Reviewer tools
        {failureOn ? <span className="ml-2 font-semibold text-danger">· failures on</span> : null}
      </summary>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={failureOn}
            onChange={(event) => handleFailureToggle(event.target.checked)}
            className="size-4 accent-brand"
          />
          Make every request fail
        </label>
        <button type="button" className={linkButtonClasses} onClick={() => handleReset("empty")}>
          Remove all contacts
        </button>
        <button type="button" className={linkButtonClasses} onClick={() => handleReset("sample")}>
          Restore sample contacts
        </button>
      </div>
    </details>
  );
}
