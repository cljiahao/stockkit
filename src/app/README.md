# src/app

Next.js App Router routes. `(auth)` and `(public)` are route groups (no URL
segment); `dashboard/` requires a session (enforced by `src/proxy.ts`);
`auth/callback/` and `api/` are plain Route Handlers.

`layout.tsx` loads three fonts: `Lato` (body), `Geist_Mono` (the "ledger"
numeric signature), and `Space_Grotesk` (`--font-display`, used on landing/
nav headings only).
