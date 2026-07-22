# src/components/landing

One component per landing-page section (`Hero`, `HowItWorks`, `Benefits`,
`Faq`, `Cta`), composed by `src/app/(public)/page.tsx`. `Hero` and `Cta`
take an `authed` prop and route an already-signed-in vendor straight to
`/dashboard` instead of back through `/login`.
