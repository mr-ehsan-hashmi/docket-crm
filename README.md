# Docket

A small CRM for a law firm's client intake desk: who enquired, what they need, who has picked it up, and where it stands.

**Live:** https://docket-crm.vercel.app · **Run locally:** `npm install && npm run dev` · **Checks:** `npm test`, `npm run typecheck`, `npm run lint`

To see the empty and error states without unplugging anything, open **Reviewer tools** in the footer.

## Structure and state

```
src/app/         Routes only. Each page is a Suspense boundary around one screen component.
src/features/    contacts/ and pipeline/: the screens and the components only they use.
src/components/  App shell and shared primitives (Button, Field, StatusBadge, StateMessage, Skeleton).
src/lib/api/     The only code that touches storage. Async, typed, can fail.
src/lib/contacts Types, zod schema, pure filter/sort functions, TanStack Query hooks.
```

There are three kinds of state and each has one home:

- **Server state** (contacts, notes, activity) lives in TanStack Query. Every key hangs off `["contacts"]`, so one invalidation refreshes the list, the board and any open detail page. There is no global store because nothing else needs sharing.
- **View state** (search, status filter, sort) lives in the URL, so a refresh keeps it and a filtered list can be shared.
- **Form state** lives in react-hook-form, validated by a zod schema that also produces the TypeScript types.

`lib/api` is a mock API over localStorage with ~450 ms of latency and a switch that makes every call fail. I built it first so every screen was written against real loading and error states. Replacing it with Supabase means rewriting that one folder.

## UI and UX decisions

- **Domain first.** Contacts carry what an intake team asks on a first call: practice area, how they reached the firm, a matter summary, an assigned attorney. A phone number *or* an email is required, not both, because walk-ins often give only one.
- **The list is the home screen.** No dashboard: with three statuses, the tab counts already are the dashboard.
- **Two different empty states.** "Nobody on file yet" offers to add someone; "no contacts match" offers to clear the filter. They are different problems.
- **Errors say what to do.** Validation appears on blur, names the fix, and every problem shows on the first submit. A failed save keeps what was typed. A failed background refresh keeps the data already on screen.
- **Pipeline moves are optimistic** and roll back with an explanation if the save fails. Every card also has a "Move to" menu, which is how touch and keyboard users change status; dragging on a phone fights with scrolling.
- **The timeline writes itself.** Status changes, edits and notes are logged by the API layer, so no screen can forget to record one.
- **Look.** Paper, ink and one green, with a serif for names and headings, closer to a firm's letterhead than a SaaS template. Colour other than green always means status.

## One tradeoff

Data is per browser. localStorage met "persist across refresh" with no sign-up wall for reviewers, but two intake staff would not see each other's changes, and filtering happens in memory. With more time I would move `lib/api` to Supabase (auth, row-level security, server-side search and pagination), add delete/archive with undo, and add Playwright tests for the create, edit and move flows. Unit tests currently cover the API layer, the schema and the filter logic.

## How I used AI

I built this with Claude Code. I set the scope and reviewed the plan before any code was written; the agent then wrote most of the implementation and tested each flow in a browser, which surfaced four bugs that were fixed in separate commits (dropped keystrokes in the search box, a validation error that only appeared on the second submit, screen-reader announcements that read out raw ids, and a pipeline page that hung on a hard refresh in production only). I have read the code and can explain any part of it.
