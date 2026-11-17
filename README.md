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

I started by breaking down the requirements and defining the system architecture before writing any code. Throughout the build, I used Claude Code and Gemini as execution accelerators while maintaining strict ownership over architectural decisions, scope, and code quality.

I only moved from planning to implementation once the data flow and boundaries were solid. During development, I actively challenged and refined AI-generated proposals—specifically around folder structure, the trade-offs of avoiding a heavy UI library, and ensuring we were leveraging Next.js effectively rather than over-engineering.

Every bug fix was isolated in its own commit for a clean git history. Automated tests caught edge cases like input debouncing/dropping characters and a production-only pipeline hang, while hands-on QA surfaced UI polish issues like sticky header positioning, layout shifts during filtering, and select-dropdown alignment.
