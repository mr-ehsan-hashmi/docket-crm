"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DEFAULT_FILTERS, parseFilters, serializeFilters, type ContactFilters } from "@/lib/contacts/filter";

export function useContactFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams)), [searchParams]);

  const setFilters = useCallback(
    (changes: Partial<ContactFilters>) => {
      const query = serializeFilters({ ...filters, ...changes });
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [filters, pathname],
  );

  const clearFilters = useCallback(
    () => setFilters({ query: DEFAULT_FILTERS.query, status: DEFAULT_FILTERS.status }),
    [setFilters],
  );

  return { filters, setFilters, clearFilters };
}
