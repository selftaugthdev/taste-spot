# Costs

This file tracks what in this app could generate cost, and how each is
capped. It grows as each phase adds infrastructure; right now (Phase 1) only
the static hosting layer exists.

## Current surface area (Phase 1)

- **Hosting:** fully static export (`output: 'export'`) with no Next.js
  server, no API routes, no image optimization server. Every page is
  pre-rendered HTML/JS/CSS served from Cloudflare's CDN — cost scales with
  bandwidth only, not compute.
- **No backend calls yet:** there is no Supabase, Stripe, or Edge Function
  wired up in this phase, so there's nothing yet that can be abused or run up
  a bill beyond static asset bandwidth.

## Planned guardrails (filled in as each phase lands)

- **Phase 3 (Supabase backend):** guess submission goes through one rate-limited
  Postgres RPC (`submit_guess`) with a unique constraint enforcing one guess
  per player per question; answers are never sent to the client before a
  guess is made; RLS on every table; free-plan quota monitoring.
- **Phase 4 (leaderboards):** read from a precomputed/cached view, not a
  live per-request aggregation; no realtime subscriptions.
- **Phase 6 (payments):** Pro status is set only by the Stripe webhook Edge
  Function; the client can never set its own Pro flag.
- **Backups:** Supabase Free has no automatic backups — a scheduled GitHub
  Action will run a nightly `pg_dump` into private object storage, documented
  with a restore procedure once the schema exists (Phase 3).

## Supabase Free plan: upgrade signals

Not yet applicable (no Supabase project in this phase). Once Phase 3 lands,
this section will list the concrete quota numbers to watch (DB size, MAU,
egress, Edge Function invocations) and roughly what Pro costs once exceeded.
