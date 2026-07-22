# src/app/(public)

The marketing landing page. `page.tsx` composes the section components in
`src/components/landing/`; `layout.tsx` wraps it with the shared `Navbar`/
`SiteFooter` and fetches the session so both can render auth-aware.
