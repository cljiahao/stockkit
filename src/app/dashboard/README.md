# src/app/dashboard

The authenticated vendor dashboard (guarded by `src/proxy.ts`). `layout.tsx`
resolves the session + stall name + avatar URL (read defensively off
`user.user_metadata`) and renders `dashboard-nav.tsx` (burger far-left
below `sm`, avatar/account dropdown far-right at every width, per
`docs/business/2026-07-21-dashboard-nav-standard.md`) — the account
dropdown's avatar renders the vendor's uploaded profile icon when set,
falling back to initials otherwise. `(overview)/` is the stock-value/low/
out-of-stock stats page; `products/` is the products workspace; `profile/`
is the account-settings page.
