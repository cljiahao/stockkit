# src/components/layout

Site chrome shared across routes: `Navbar` and `SiteFooter` (public
marketing nav/footer — the dashboard has its own `DashboardNav`, never
these), plus `Providers`/`ThemeProvider`.

`Navbar` is a full-width sticky translucent bar (`sticky top-0 border-b
bg-background/80 backdrop-blur`), not a floating pill — chosen to sit
cleanly on top of the landing page's ambient gradient background.
