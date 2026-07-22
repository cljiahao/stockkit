# src/app/auth/callback

`GET` Route Handler both Google OAuth and password-recovery links redirect
through. Exchanges the Supabase `code` for a session, then redirects to a
safe same-origin `?next=` path (default `/dashboard`) or to
`/login?error=oauth` on a missing/failed exchange.
