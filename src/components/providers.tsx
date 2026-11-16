"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { DATABASE_KEY } from "@/lib/api/storage";
import { contactKeys } from "@/lib/contacts/queries";
import { ToastProvider } from "./toast";
import { UnsavedChangesProvider } from "./unsaved-changes";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // show the error and a "Try again" straight away instead of retrying silently
        retry: false,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

// "storage" only fires in the other tabs, which is exactly who needs to refetch
function CrossTabSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function refetchIfContactsChanged(event: StorageEvent) {
      if (event.key === DATABASE_KEY || event.key === null) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    }

    window.addEventListener("storage", refetchIfContactsChanged);
    return () => window.removeEventListener("storage", refetchIfContactsChanged);
  }, [queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <CrossTabSync />
      <UnsavedChangesProvider>
        <ToastProvider>{children}</ToastProvider>
      </UnsavedChangesProvider>
    </QueryClientProvider>
  );
}
