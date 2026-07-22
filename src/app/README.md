# src/app

Next.js App Router routes. `(auth)` and `(public)` are route groups (no URL
segment); `dashboard/` requires a session (enforced by `src/proxy.ts`);
`auth/callback/` and `api/` are plain Route Handlers.
