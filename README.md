# Tap Where It Happened

A daily geography game engine. One codebase, multiple independently-branded
sites — each a separate deployment, domain, Supabase project, and Stripe
account. This repo currently ships one site: **TasteSpot** (`sites/food`),
a Food & Drink edition.

## How the multi-site system works

- `sites/<site-id>/config.ts` — name, tagline, theme colors (light + dark),
  categories, Pro pricing display, social links. Typed by `@twih/site-config`.
- `sites/<site-id>/content/` — static copy (about, how-to-play) for that site.
- The `SITE_ID` env var picks which site's config gets built into
  `apps/web`. It's baked in at build time (`next.config.ts`), so each
  deployed site only ever ships its own config, categories, and assets —
  never another site's.
- The map interaction itself is behind a `MapSurfaceProps` shape (`marks`,
  `arc`, `interactive`, `onTap`, `focus`) defined in `@twih/game-core`'s
  `types.ts`, implemented today by `GlobeSurface` (a 3D globe). A future niche
  needing a 2D diagram (e.g. anatomy) implements the same prop shape against
  a flat image instead, and game logic (`useRound`, scoring) never changes.

Score feedback colors (🟩🟨🟧🟥) are **not** part of a site's theme — they're
fixed tokens in `apps/web/src/app/globals.css` so they read the same
regardless of brand color.

## Repo structure

```
apps/
  web/                 # the single Next.js app; SITE_ID picks its content/theme
packages/
  site-config/         # shared TypeScript types for a site config
  game-core/           # scoring, round state machine, GlobeSurface, daily round, share text
sites/
  food/                # TasteSpot — config.ts + content/
  science/             # placeholder, Phase 8
supabase/              # migrations/RLS/RPCs land here in Phase 3
```

## Running it locally

Requires Node 20+ and pnpm (this repo uses Corepack, so `corepack enable`
once is all you need — no global pnpm install required).

```bash
pnpm install
pnpm dev:food        # http://localhost:3000, SITE_ID=food
```

Other useful scripts (from the repo root):

```bash
pnpm build:food       # static export to apps/web/out
pnpm typecheck        # typecheck every package
pnpm lint             # lint the Next.js app
pnpm --filter @twih/game-core test   # scoring/round/share unit tests
```

**Don't run `pnpm dev:food` and `pnpm build:food` at the same time** — they
share `apps/web/.next`, and a build while dev is running will corrupt it
(restart dev after a build if that happens: `rm -rf apps/web/.next`).

## What to check in Phase 1

- `pnpm dev:food` starts and the homepage shows "TasteSpot" in mustard on a
  charcoal background, with the four score-color swatches (green/yellow/
  orange/red) visible and visually distinct from the brand color.
- The "Switch to light/dark mode" button toggles the whole page's color
  scheme and the choice survives a refresh (stored in `localStorage`).
- `pnpm build:food` produces a static export in `apps/web/out` with no
  server — confirms the static-export/Cloudflare deployment model works.

## What to check in Phase 2

- `pnpm --filter @twih/game-core test` passes (scoring curve, haversine
  distance, deterministic daily round, share text — 15 tests).
- From the homepage, "Play today's round" opens `/play`: a 3D globe loads,
  the first of 5 question prompts shows at the top.
- Tapping the globe records a guess, flies the camera to frame both the
  guess and the correct answer, draws a line between them, and shows a
  reveal panel with distance, score, and a fun fact.
- After the 5th question, the end screen shows the total score, a per-
  question breakdown, a working share button (native share sheet or
  clipboard fallback), and a countdown to the next local-midnight round.
- The globe always renders the bright, true-color Blue Marble texture
  regardless of the page's light/dark theme — a night-lights texture looked
  moody but made landmasses nearly impossible to tap accurately.
- This phase's round data is **mock-only** — `sites/food/content/questions.mock.ts`,
  12 placeholder (unverified) questions, deterministically shuffled per
  calendar date. There's no backend yet, so "Play again" just restarts
  locally; Phase 3's `get_daily_round`/`submit_guess` RPCs replace this and
  enforce one play per day.

## Changing the domain later

`sites/food/config.ts` has a placeholder `domain: "tastespot.example"`. Once
a real domain is purchased, update that one field — nothing else in the code
references a hardcoded domain.

## Deploying to Cloudflare (per site)

Each site is its own Cloudflare Pages (or Workers static assets) project,
pointed at this repo, with its own custom domain and its own env vars:

1. Create a new Cloudflare Pages project per site (e.g. `tastespot-food`).
2. Build command: `pnpm install && pnpm build:food` (swap the SITE_ID per
   project — e.g. `pnpm build:science` for the Science site, once it exists).
3. Build output directory: `apps/web/out`.
4. Set the env vars from `.env.example` in the Pages project's settings —
   this site's own Supabase URL/anon key, Stripe keys, etc. `SITE_ID` must
   also be set there to match the build command.
5. Attach the site's custom domain in the Pages project's custom domains tab.

No server runtime is required — this is a pure static asset deploy, so
there's no Workers compute cost beyond request serving.

## Environment variables

See `.env.example`. Every site shares the same variable *names* but gets its
own *values*, since each site has its own Supabase project and Stripe
account.

## Supabase (Free plan)

See `supabase/README.md`. Schema, RLS, and RPCs land in Phase 3; this phase
only reserves the folder and documents creating the project ahead of time if
you want to.

## Costs

See `COSTS.md` — updated as each phase adds infrastructure.

## Credits

The globe texture in `apps/web/public/globe/earth-blue-marble.jpg` is NASA
Blue Marble imagery (4096×2048), self-hosted here via the example assets
bundled with the MIT-licensed `three-globe` package — not hotlinked to any
third-party CDN.

## Status

- [x] Phase 1 — setup, multi-site config, static Next.js app, theme system
- [x] Phase 2 — core game (globe, round flow, scoring, reveal, share)
- [ ] Phase 3 — Supabase backend (schema, RLS, RPCs, anon auth, streaks)
- [ ] Phase 4 — leaderboards, groups, account upgrade
- [ ] Phase 5 — admin (question editor, scheduler, import/export)
- [ ] Phase 6 — Stripe/Pro (checkout, webhook, archive, category packs)
- [ ] Phase 7 — PWA, SEO, OG images, analytics, Sentry, legal, perf pass
- [ ] Phase 8 — second site (Science) proving the multi-site split
