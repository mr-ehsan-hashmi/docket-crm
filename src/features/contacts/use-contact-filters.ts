"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_FILTERS, parseFilters, serializeFilters, type ContactFilters } from "@/lib/contacts/filter";

const URL_WRITE_DELAY_MS = 250;

export function useContactFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(() => parseFilters(new URLSearchParams(searchParams)), [searchParams]);

  const [query, setQuery] = useState(urlFilters.query);
  const [writtenQuery, setWrittenQuery] = useState(urlFilters.query);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlFilters.query);

  if (urlFilters.query !== seenUrlQuery) {
    setSeenUrlQuery(urlFilters.query);
    if (urlFilters.query !== writtenQuery) setQuery(urlFilters.query);
  }

  const writeUrl = useCallback(
    (next: ContactFilters) => {
      const search = serializeFilters(next);
      setWrittenQuery(next.query);
      window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
    },
    [pathname],
  );

  useEffect(() => {
    if (query === urlFilters.query) return;
    const timer = setTimeout(() => writeUrl({ ...urlFilters, query }), URL_WRITE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, urlFilters, writeUrl]);

  const filters = useMemo(() => ({ ...urlFilters, query }), [urlFilters, query]);

  const setFilters = useCallback(
    (changes: Partial<ContactFilters>) => {
      if (changes.query !== undefined) setQuery(changes.query);
      const onlyQueryChanged = Object.keys(changes).every((key) => key === "query");
      if (!onlyQueryChanged) writeUrl({ ...filters, ...changes });
    },
    [filters, writeUrl],
  );

  const clearFilters = useCallback(() => {
    setQuery(DEFAULT_FILTERS.query);
    writeUrl({ ...filters, query: DEFAULT_FILTERS.query, status: DEFAULT_FILTERS.status });
  }, [filters, writeUrl]);

  return { filters, setFilters, clearFilters };
}
