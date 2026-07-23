# src/components

Shared React components. `ui/` is shadcn-managed (CLI style — do not
hand-edit); `widgets/` are small app-wide bits (brand mark, theme toggle,
link list); `layout/` is site chrome; `landing/` is the marketing page's
section components; `elevated-card.tsx` is stockkit's own lifted-shadow
card treatment used on the public auth pages.
`section.tsx` — the per-field-group shell (icon chip + eyebrow + title +
description, wraps `ElevatedCard`) used by the profile page's five
sections, per
`docs/business/2026-07-21-profile-settings-page-standard.md` §2.1.
