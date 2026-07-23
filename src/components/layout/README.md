# src/components/layout

Site chrome shared across routes: `Navbar` and `SiteFooter` (public
marketing nav/footer — the dashboard has its own `DashboardNav`, never
these), plus `Providers`/`ThemeProvider`.

`Navbar` is a full-width sticky translucent bar (`sticky top-0 border-b
bg-background/80 backdrop-blur`), not a floating pill — chosen to sit
cleanly on top of the landing page's ambient gradient background. Per
`docs/business/2026-07-21-landing-page-standard.md`: wordmark links via a
plain `<a href="/#top">` (not `next/link`'s `Link`, for reliable same-page
hash navigation) and there's a `#faq` link next to the login/dashboard CTA.
