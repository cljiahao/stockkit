# Changelog

## Unreleased

- Landing page visual refresh: a new `Space Grotesk` display typeface on
  every section heading, an ambient cobalt-tinted background, a `LedgerCardPreview`
  hero illustration (mock product card — on-hand count, unit cost, a recent
  stock movement), icons and `01/02/03` numbering on `HowItWorks`, icons on
  `Benefits`, a restrained `fade-rise` entrance animation, and a navbar
  restyle (floating pill → full-width sticky translucent bar).

- Landing page decomposed into section components (`Hero`, `HowItWorks`,
  `Benefits`, `Faq`, `Cta`) matching the sibling kits' structure, adding a
  "why vendors pick stockkit" Benefits section stockkit didn't have before.
- Login gained Google OAuth sign-in and a full forgot-password/reset-password
  flow, via a new `/auth/callback` route — none of this existed previously.
- Login and reset-password restyled with a new `ElevatedCard` component.
- Primary color raised from a washed-out `oklch(0.45 0.09 250)` to a
  contrast-verified richer `oklch(0.46 0.16 255)` (light) /
  `oklch(0.68 0.13 252)` (dark); fixed a dead gradient utility that had three
  identical color stops.
- Public `Navbar`/`SiteFooter` made session-aware server components.
