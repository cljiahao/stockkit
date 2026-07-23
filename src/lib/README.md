# src/lib

Shared utilities and business logic. `schemas.ts` — Zod schemas for forms
and server actions; `types.ts` — hand-maintained DB types mirroring
`supabase/migrations/`; `stock.ts` — stock-status (ok/low/out)
classification; `action-result.ts` — `ActionResult<T>` server-action
return type; `supabase/` — browser/server/service clients.

`brand-icon.tsx` — the `brandIcon(size)` generator consumed by
`src/app/icon.tsx`/`apple-icon.tsx`, per
`docs/business/2026-07-21-brand-icon-family-standard.md`'s shared
formula. `BRAND_STEEL`/`BRAND_PALE` are concrete-hex approximations of
`--primary`/`--primary-foreground` — keep in sync if those tokens change.
