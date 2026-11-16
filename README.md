# Docket

[![CI](https://github.com/mr-ehsan-hashmi/docket-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/mr-ehsan-hashmi/docket-crm/actions/workflows/ci.yml)

A small CRM for a law firm's intake desk: who enquired, what they need, who has picked it up and where it stands.

**Live:** https://docket-crm.vercel.app

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run test:e2e   # builds, then runs Playwright against the production build
```

Sample data is seeded on the first visit. "Reviewer tools" in the footer can fail every request or remove all contacts, to reach the error and empty states.

## Structure and state

- `src/app`: routes only, each a Suspense boundary around one screen.
- `src/features`: the `contacts` and `pipeline` screens plus their own components.
- `src/components`: app shell and shared UI.
- `src/lib/api`: the only code that touches storage. Async, typed, can fail.
- `src/lib/contacts`: types, zod schema, pure functions and query hooks.

State has three homes. Server data is in TanStack Query under one `["contacts"]` key, so one invalidation refreshes the list, the board and any open detail page. Search, filters and sort are in the URL. Form state is in react-hook-form with a zod schema that also produces the types. No global store, nothing needed one.

## UI and UX decisions

- The fields are what intake asks on a first call. A phone number or an email is required, not both, because walk-ins often give only one.
- The form warns when the person already looks to be on file (same email, phone or name). It only warns, since two people can share a phone.
- A lead with no activity for three days shows as "Quiet for N days" and has its own filter. The usual way an intake desk fails is a lead nobody called back.
- Pipeline moves are optimistic, roll back if the save fails and can be undone. Every card also has a "Move to" menu, which is the touch and keyboard path: dragging on a phone fights with scrolling.
- Two different empty states. "Nobody on file" offers to add someone, "no match" offers to clear the filters. Errors keep what was typed and whatever was already on screen.
- No delete. A firm keeps its intake records, so a contact gets closed instead.
- Paper, ink and one green. Any other colour means status.

## One tradeoff

Data is per browser. localStorage covers "persists after refresh" without putting a sign-up wall in front of reviewers, but two members of staff would not see each other's changes (tabs in the same browser do stay in sync). With more time I would move `src/lib/api` to Supabase with auth and server-side search. That folder is the only one that would change.

## AI use

Most of the code was written with Claude Code, working from a plan I approved before any code existed. I then asked for an audit at a senior-review standard and chose which fixes and features to build from it. The agent also ran the app in a browser and wrote the tests, and several commits fix bugs those runs found: the search box dropping keystrokes, the pipeline hanging in production only, and sideways scrolling on phones.
