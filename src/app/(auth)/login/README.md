# src/app/(auth)/login

Combined sign-in/sign-up page. `page.tsx` is a thin `Suspense` wrapper;
`login-form.tsx` holds the actual client component (email/password,
Google OAuth, forgot-password). `actions.ts` has `completeSignup`, the
server action that creates the `vendors` row after a new signup.
