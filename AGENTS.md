# AGENTS.md — stockkit

> STOP — This project diverges from the stock templateCentral Next.js stack on
> the data layer only. Auth/DB are **Supabase** (`@supabase/ssr`), not
> better-auth + Drizzle. Authorization is enforced in Postgres via **RLS**, not
> an app repository layer. Runtime matches tc: Next 16, route protection in
> `src/proxy.ts`, and `cookies()`/`headers()`/`params`/`searchParams` are async.

## What stockkit is

Inventory tracking for small vendors — v1 / first cut. A vendor signs in, adds
the products they stock, and logs stock in/out (restock, waste, adjustment)
against a running on-hand count and per-unit cost. The dashboard surfaces
total inventory value and low/out-of-stock alerts.

This is standalone: manual stock in/out and costing only. Tying stock
movement to qkit's sales automatically (the "ties stock movement to your
sales" tagline in `merqo/src/lib/kits.ts`) is a real planned cross-kit
feature but is **not built** — deliberately out of scope for this pass. Don't
assume any qkit integration exists.

## Stack

Next.js 16 · App Router · Turbopack · TypeScript strict · Tailwind v4 ·
shadcn/ui (new-york) · React Hook Form · Zod · Supabase (`@supabase/ssr`) ·
Vitest · pnpm · Node ≥24

`@tanstack/react-query` is a dependency (inherited from the base scaffold) but
**not wired in** — this app uses plain Server Components + Server Actions
(the qkit pattern), not client-side query caching. Don't add TanStack Query
usage without discussing it first; it'd be a second data-fetching pattern
living alongside the real one.

## Commands

```bash
pnpm dev          # dev server — http://localhost:3000
pnpm build        # production build
pnpm test         # run test suite (vitest)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm check        # prettier --check + eslint + tsc --noEmit + route-logging check
pnpm format       # prettier --write
```

No e2e suite and no tests for the auth/dashboard/products code yet — the
scaffold's `test/api/*.test.ts` (health route + `withLogging`) is all that
exists. Writing real coverage for the new code is future work, not done in
this pass.

## File Layout

```
src/app/(auth)/login/            — combined sign-in/sign-up page + completeSignup action
src/app/(public)/                — landing page
src/app/dashboard/               — vendor dashboard: layout (session + sign-out), overview stats
src/app/dashboard/products/      — products workspace: list/detail UI + server actions
src/proxy.ts                     — Supabase session refresh + /dashboard guard (Next 16)
src/lib/supabase/                — browser / server / service clients + middleware helper
src/lib/types.ts                 — DB types (hand-maintained mirror of supabase/migrations)
src/lib/schemas.ts                — Zod schemas for forms + actions, money-cents helpers
src/lib/stock.ts                  — shared stock-status (ok/low/out) classification
src/lib/action-result.ts          — ActionResult<T> server-action return type
src/components/ui/                — shadcn primitives (CLI-managed style; do not hand-edit)
supabase/migrations/              — SQL schema + RLS + record_stock_movement/sync_vendor_profile
```

## Data model

- `vendors` (id = `auth.users.id`, stall name).
- `products` — belong to a vendor; `on_hand` (numeric, live balance),
  `unit_cost_cents`, `low_stock_threshold`, `is_active`.
- `stock_movements` — append-only ledger (`restock` / `waste` / `adjustment` /
  `initial`). No update/delete RLS policy — default-deny keeps it immutable,
  even for the row's own owner.
- The only write path for a stock change is `stockkit.record_stock_movement`
  (SECURITY INVOKER — the caller is always the vendor acting on their own
  data, so RLS already authorizes it): applies the delta to `on_hand`,
  rejects a move that would take it below zero, and appends the ledger row,
  atomically (one function body = one implicit transaction).
- RLS: a vendor sees/edits only their own `vendors` row, `products`, and
  `stock_movements`. No public read of anything — unlike qkit's booths, none
  of this data ever needs to be public.
- `stockkit.sync_vendor_profile` (SECURITY DEFINER) forwards a vendor's stall
  name to the shared `merqo.upsert_vendor_profile` RPC on signup — best-effort,
  never blocks or fails signup if it errors.

## Rules (always)

- TypeScript strict — no `any`, no `@ts-ignore`.
- Validate all user input with Zod at every boundary (forms + server actions).
- Authorization lives in **RLS policies**, not in app code. Never widen a
  policy to "fix" a query — fix the query or the session instead.
- Use the **service-role client** (`createServiceClient`) only in Server
  Actions / Route Handlers, never in client components, and only when a task
  genuinely needs to bypass RLS — none of the current vendor-owned writes do;
  they all go through the RLS-scoped `createServerClient()`.
- No secrets in `NEXT_PUBLIC_*`. `NEXT_PUBLIC_SUPABASE_*` are inlined at
  build time — rebuild after changing them.
- `@supabase/ssr` and `@supabase/supabase-js` versions must stay compatible
  (check `package.json`, not this number, since both get bumped) or every
  query degrades to `never`.
- After editing the schema, update both `supabase/migrations/` and
  `src/lib/types.ts` (or regenerate via `supabase gen types typescript`).
- Comment hygiene: own-line comments only (no trailing inline comments),
  enforced by `no-inline-comments: error`; no committed dead/commented-out
  code, enforced by `sonarjs/no-commented-code: error`.
- `font-mono` on every quantity/cost figure shown to the vendor — the app's
  one deliberate typographic signature (a "ledger" motif). Don't drop it on
  new numeric displays.

## Project-Specific Notes

- No live Supabase project is configured in the dev/CI environment this app
  was built in — `.env.local` has empty Supabase values on purpose, so
  `src/lib/supabase/env.ts`'s fail-fast check throws a clear error instead of
  the app silently misbehaving. Every page under `/dashboard` sets
  `export const revalidate = 0` so Next never tries to statically prerender a
  page that needs a real session/DB round-trip.
- The design accent is steel/cobalt blue (`oklch(0.45 0.09 250)`-ish),
  deliberately distinct from qkit's warm ember and loopkit's gold. Green/
  amber/red (`--stock-ok`/`--stock-low`/`--stock-out`) are reserved for
  stock-level status only — never reused as the brand accent.
- No `.claude/` harness, no e2e suite, no `docs/` tree exist yet in this repo
  (unlike qkit) — this file intentionally omits an "AI Harness" section until
  one is actually built.
