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
`image-uploader.tsx` — the profile page's avatar uploader: validates
type/size client-side, resizes via `@/lib/image-resize`'s `resizeToWebp`,
uploads to the `vendor-avatars` Storage bucket under the vendor's own
`{vendorId}/...` path, and reports the resulting public URL back to the
caller.
`feedback-form.tsx`/`support-form.tsx` — vendor NPS and categorized
Get-help widgets, Sheet-mounted off the account menu; both use shadcn
`ToggleGroup`/`Textarea` for their score/category pickers and message
body, matching qkit's equivalent components.
