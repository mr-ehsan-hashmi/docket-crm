"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_FILTERS, parseFilters, serializeFilters, type ContactFilters } from "@/lib/contacts/filter";

const URL_WRITE_DELAY_MS = 250;

export function useContactFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(() => parseFilters(new URLSearchParams(searchParams)), [searchParams]);

  // The search text is kept locally and mirrored to the url after a pause. Driving the
  // input straight from useSearchParams drops keystrokes, because url updates land late.
  const [query, setQuery] = useState(urlFilters.query);
  const [writtenQuery, setWrittenQuery] = useState(urlFilters.query);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlFilters.query);

  // url changed and it wasn't us (nav link, back button): take the url's value
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

    const write = () => writeUrl({ ...urlFilters, query });
    const timer = setTimeout(write, URL_WRITE_DELAY_MS);

    // A click can start a navigation, and a url write that lands after it has started
    // cancels it. So on any click, write straight away instead of waiting for the timer.
    const writeNow = () => {
      clearTimeout(timer);
      write();
    };
    document.addEventListener("click", writeNow, { capture: true, once: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", writeNow, { capture: true });
    };
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
    writeUrl({ ...DEFAULT_FILTERS, sort: filters.sort });
  }, [filters, writeUrl]);

  return { filters, setFilters, clearFilters };
}
