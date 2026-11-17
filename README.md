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

I read the brief first and made sure I understood what was being asked. After that I used AI tools through the whole thing, mainly Claude Code and also Gemini.

We started with a plan, and I only moved on once I was happy with it. Most of the code was then written by the AI while I steered: what to build, what to leave out, and what I wasn't convinced by. I questioned the folder structure, the choice not to use a UI library, and whether we were really using Next.js.

Bugs were fixed one at a time, each in its own commit. Some came out of the tests, like the search box dropping letters and the pipeline hanging only in production. Others I found myself while using the app, like the header not staying in place, the page jumping when a search shortened the list, and the dropdown arrows sitting on the edge.
