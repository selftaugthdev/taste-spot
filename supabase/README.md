# Supabase

Empty for now — SQL migrations, RLS policies, and RPC functions land in
Phase 3. This folder exists so the `supabase` CLI can be initialized here
later (`supabase init`) without restructuring.

## Setting up the project now (optional, recommended)

You can create the Food & Drink site's Supabase project today so it's ready
when Phase 3 starts:

1. Create a new project at supabase.com on the **Free** plan, named something
   like `tastespot-food`.
2. Copy the project URL and anon key into `.env.local` at the repo root
   (see `.env.example`).
3. Note: each future site (Science, etc.) gets its **own** Supabase project —
   never share one project/database across sites.
