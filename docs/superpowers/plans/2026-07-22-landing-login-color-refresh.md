# stockkit landing/login parity + color refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring stockkit's landing page and login page up to the same structural/feature parity as qkit, loopkit, and paykit, and refresh the primary color to a richer, contrast-verified cobalt.

**Architecture:** Decompose the flat `(public)/page.tsx` into per-section components under `src/components/landing/`. Add the auth features stockkit is missing (Google OAuth, forgot/reset password, `/auth/callback` route) using a new stockkit-owned `ElevatedCard` in place of shadcn's default `Card`. Update `globals.css` color tokens and fix the dead gradient utility.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, shadcn/ui, React Hook Form + Zod, `@supabase/ssr`, Vitest + Testing Library, pnpm.

## Global Constraints

- TypeScript strict — no `any`, no `@ts-ignore`.
- Validate all user input with Zod at every boundary (forms + server actions).
- Comment hygiene: own-line comments only, never trailing inline comments (`no-inline-comments: error`); no committed dead/commented-out code (`sonarjs/no-commented-code: error`).
- No changes to RLS, the data model, or `stock_movements` — authorization stays entirely in Postgres RLS, untouched by this work.
- `font-mono` is reserved for quantity/cost figures shown to the vendor (the "ledger" motif) — not applicable to any file in this plan (no numeric figures are introduced).
- CI hard-gates changed-line coverage at ≥80% (`diff-cover`) — every task that adds non-trivial logic includes its own test.
- Primary color values are fixed by prior research and must be used exactly as given: light `oklch(0.46 0.16 255)`, dark `oklch(0.68 0.13 252)` (see spec for the contrast math backing these).
- Stock-status tokens (`--stock-ok/-low/-out`) are reserved for stock-level signals only — never touched or reused as the brand accent.
- Vitest config: `globals: false` (import `describe/it/expect/vi` explicitly), `environment: 'node'` by default — any file rendering React needs a `// @vitest-environment jsdom` docblock as its first line. No `jest-dom` matchers are installed in this project — do not use `toBeInTheDocument()`/`toHaveTextContent()`; use `.toBeTruthy()`, `.textContent`, or `.toHaveProperty('textContent', …)` instead (all confirmed available, see existing `src/app/dashboard/dashboard-nav.dom.test.tsx` and `src/app/dashboard/profile/profile-form.dom.test.tsx`).
- Any component importing `@/lib/supabase/client` or `@/lib/supabase/server` in a test must mock that module — `publicEnv` throws at import time in this dev/CI environment (no live Supabase project configured, see `AGENTS.md`).

---

## Task 1: Commit the in-flight navbar/footer/layout WIP

This repo already has uncommitted changes to three files that make the public `Navbar`/`SiteFooter` session-aware server components — this is the same feature area this plan continues, so it gets committed first as its own clean baseline. The unrelated uncommitted `.env.example` / `src/lib/utils/request-origin.ts` changes are a different in-flight task and are explicitly left alone.

**Files:**
- Modify (already modified, uncommitted): `src/app/(public)/layout.tsx`, `src/components/layout/navbar.tsx`, `src/components/layout/site-footer.tsx`

**Interfaces:**
- Produces: `Navbar({ authed?: boolean })` and `SiteFooter({ creditText?: string; links?: LinkItem[] })` — both already implemented in the working tree, this task only verifies and commits them.

- [ ] **Step 1: Review the existing uncommitted diff**

Run: `git diff -- "src/app/(public)/layout.tsx" "src/components/layout/navbar.tsx" "src/components/layout/site-footer.tsx"`

Expected: `Navbar` is a plain (non-`'use client'`) server component accepting an `authed` prop; `PublicLayout` fetches the session via `createServerClient()` and passes `authed` through to `Navbar`/`SiteFooter`; `SiteFooter`'s `links` default to `[]` and only render `LinkList` when non-empty.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: exits 0, no errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: exits 0, no errors.

- [ ] **Step 4: Stage exactly these three files**

```bash
git add "src/app/(public)/layout.tsx" "src/components/layout/navbar.tsx" "src/components/layout/site-footer.tsx"
```

Do not run `git add -A` or `git add .` here — `.env.example` and the deleted `src/lib/utils/request-origin.ts` must stay unstaged.

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
refactor: make public Navbar/SiteFooter session-aware server components

Navbar drops its client-side pathname check and becomes a plain server
component driven by an authed prop from PublicLayout's own session fetch;
SiteFooter's links default to empty instead of a placeholder "Contact Us".
EOF
)"
```

---

## Task 2: Color tokens + gradient utility fix

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: updated `--primary`/`--primary-hover`/`--ring` CSS custom properties (light + dark), and a real two-stop `.bg-brand-gradient`/`.text-brand-gradient`. `BrandText` (`src/components/widgets/brand-text.tsx`) already consumes `.text-brand-gradient` and needs no code change — it starts rendering the new gradient automatically once this task lands.

- [ ] **Step 1: Update light-mode primary tokens**

In `src/app/globals.css`, in the `:root` block, replace:

```css
  --primary: oklch(0.45 0.09 250);
  --primary-foreground: oklch(0.98 0.01 240);
  --primary-hover: oklch(0.4 0.09 250);
```

with:

```css
  --primary: oklch(0.46 0.16 255);
  --primary-foreground: oklch(0.98 0.01 240);
  --primary-hover: oklch(0.42 0.16 255);
```

And further down in the same block, replace:

```css
  --ring: oklch(0.45 0.09 250);
```

with:

```css
  --ring: oklch(0.46 0.16 255);
```

- [ ] **Step 2: Update dark-mode primary tokens**

In the `.dark` block, replace:

```css
  --primary: oklch(0.62 0.1 245);
  --primary-foreground: oklch(0.15 0.02 250);
  --primary-hover: oklch(0.68 0.1 245);
```

with:

```css
  --primary: oklch(0.68 0.13 252);
  --primary-foreground: oklch(0.15 0.02 250);
  --primary-hover: oklch(0.74 0.13 252);
```

And replace:

```css
  --ring: oklch(0.62 0.1 245);
```

with:

```css
  --ring: oklch(0.68 0.13 252);
```

- [ ] **Step 3: Fix the dead gradient utility**

In the `@layer utilities` block, replace:

```css
  .bg-brand-gradient {
    @apply from-primary via-primary to-primary bg-linear-to-r;
  }
  .text-brand-gradient {
    @apply from-primary via-primary to-primary bg-linear-to-r bg-clip-text text-transparent;
  }
```

with:

```css
  .bg-brand-gradient {
    @apply from-primary to-primary-hover bg-linear-to-r;
  }
  .text-brand-gradient {
    @apply from-primary to-primary-hover bg-linear-to-r bg-clip-text text-transparent;
  }
```

- [ ] **Step 4: Build sanity check**

Run: `pnpm build`
Expected: build succeeds (Tailwind resolves the new token references with no unknown-utility errors).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
fix: richer cobalt primary color and a real brand gradient

Primary chroma was 0.09-0.1, reading flat next to qkit/loopkit's
0.12-0.18; raised to 0.16 (light) / 0.13 (dark) while staying in the
same steel/cobalt hue family, contrast-verified against WCAG AA/AAA
(6.6-6.8:1 both directions). .text-brand-gradient/.bg-brand-gradient
were from-primary via-primary to-primary — three identical stops, i.e.
no visible gradient at all; now a real two-stop primary -> primary-hover
gradient.
EOF
)"
```

---

## Task 3: `passwordChangeSchema` + shared form-field classes

**Files:**
- Modify: `src/lib/schemas.ts`
- Modify: `src/lib/utils/index.ts`
- Create: `src/lib/schemas.test.ts`

**Interfaces:**
- Produces: `passwordChangeSchema: ZodSchema<{ password: string; confirm: string }>` and `type PasswordChangeInput`; `FORM_LABEL_CLASS: string`, `FORM_ERROR_CLASS: string`.
- Consumed by: Task 5's reset-password form, Task 6's login form.

- [ ] **Step 1: Write the failing test**

Create `src/lib/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { passwordChangeSchema } from './schemas';

describe('passwordChangeSchema', () => {
  it('accepts matching passwords at least 8 characters long', () => {
    const result = passwordChangeSchema.safeParse({ password: 'hunter22', confirm: 'hunter22' });
    expect(result.success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordChangeSchema.safeParse({ password: 'short', confirm: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters');
    }
  });

  it('rejects when confirm does not match password', () => {
    const result = passwordChangeSchema.safeParse({ password: 'hunter22', confirm: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Passwords do not match');
      expect(result.error.issues[0]?.path).toEqual(['confirm']);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/schemas.test.ts`
Expected: FAIL — `passwordChangeSchema` is not exported from `./schemas`.

- [ ] **Step 3: Add the schema**

In `src/lib/schemas.ts`, after the existing `loginSchema` export, add:

```ts
export const passwordChangeSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/schemas.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Add the shared form-field classes**

In `src/lib/utils/index.ts`, add below the existing `cn` export:

```ts
export const FORM_LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
export const FORM_ERROR_CLASS = 'text-sm font-medium text-destructive';
```

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/schemas.ts src/lib/schemas.test.ts src/lib/utils/index.ts
git commit -m "$(cat <<'EOF'
feat: add passwordChangeSchema and shared form-field classes

Needed by the upcoming reset-password and restyled login forms.
EOF
)"
```

---

## Task 4: `/auth/callback` route + test

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/callback/route.test.ts`

**Interfaces:**
- Produces: `GET(request: Request): Promise<Response>` — exchanges an OAuth/recovery `code` for a session, redirects to a safe relative `?next=` path (default `/dashboard`), or to `/login?error=oauth` on missing/failed exchange.
- Consumes: `createServerClient` from `@/lib/supabase/server`, `PAGE_ROUTES` from `@/lib/constants/routes`.

- [ ] **Step 1: Write the failing test**

Create `src/app/auth/callback/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { exchangeCodeForSessionMock, createServerClientMock } = vi.hoisted(() => ({
  exchangeCodeForSessionMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: createServerClientMock,
}));

beforeEach(() => {
  exchangeCodeForSessionMock.mockReset();
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  });
});

function req(url: string) {
  return new Request(url);
}

describe('GET /auth/callback', () => {
  it('redirects to /login?error=oauth when no code param is present', async () => {
    const { GET } = await import('./route');
    const res = await GET(req('http://localhost/auth/callback'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/login?error=oauth');
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard by default on a successful exchange', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const { GET } = await import('./route');
    const res = await GET(req('http://localhost/auth/callback?code=abc'));
    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('abc');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('redirects to a safe relative ?next= path on success', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const { GET } = await import('./route');
    const res = await GET(req('http://localhost/auth/callback?code=abc&next=/reset-password'));
    expect(res.headers.get('location')).toBe('http://localhost/reset-password');
  });

  it('falls back to /dashboard when ?next= is a protocol-relative open redirect (//evil.com)', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const { GET } = await import('./route');
    const res = await GET(req('http://localhost/auth/callback?code=abc&next=//evil.com'));
    expect(res.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('falls back to /dashboard when ?next= is an absolute URL', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const { GET } = await import('./route');
    const res = await GET(
      req('http://localhost/auth/callback?code=abc&next=' + encodeURIComponent('https://evil.com'))
    );
    expect(res.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('redirects to /login?error=oauth when the code exchange fails', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: { message: 'invalid code' } });
    const { GET } = await import('./route');
    const res = await GET(req('http://localhost/auth/callback?code=bad'));
    expect(res.headers.get('location')).toBe('http://localhost/login?error=oauth');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/auth/callback/route.test.ts`
Expected: FAIL — `./route` does not exist.

- [ ] **Step 3: Write the route**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse } from 'next/server';

import { PAGE_ROUTES } from '@/lib/constants/routes';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Where to land after the session is established. Both OAuth sign-in and
  // the password-recovery link route through here; recovery passes
  // ?next=/reset-password. Only accept a same-origin relative path (leading
  // "/", not "//") so the param can't be used as an open redirect.
  const next = searchParams.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : PAGE_ROUTES.DASHBOARD;

  if (!code) return NextResponse.redirect(`${origin}${PAGE_ROUTES.LOGIN}?error=oauth`);

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}${PAGE_ROUTES.LOGIN}?error=oauth`);

  return NextResponse.redirect(`${origin}${safeNext}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/auth/callback/route.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/auth/callback/route.ts src/app/auth/callback/route.test.ts
git commit -m "$(cat <<'EOF'
feat: add /auth/callback route for OAuth and password-recovery links

stockkit had no callback route at all, so Google OAuth and password
reset had nowhere to land. Mirrors paykit's exchange-and-redirect
implementation, including its open-redirect-safe ?next= handling.
EOF
)"
```

---

## Task 5: `ElevatedCard` + reset-password page/form + test

**Files:**
- Create: `src/components/elevated-card.tsx`
- Modify: `src/lib/constants/routes.ts`
- Create: `src/app/(auth)/reset-password/page.tsx`
- Create: `src/app/(auth)/reset-password/reset-password-form.tsx`
- Create: `src/app/(auth)/reset-password/reset-password-form.dom.test.tsx`

**Interfaces:**
- Produces: `ElevatedCard({ as?: 'div' | 'section'; className?: string; children: ReactNode })`; `PAGE_ROUTES.RESET_PASSWORD = '/reset-password'`; `ResetPasswordForm()`.
- Consumes: `passwordChangeSchema` (Task 3), `useAsyncAction`/`navigatingAway` (`@/hooks`), `createClient` (`@/lib/supabase/client`).
- Consumed by: Task 6's login form (imports `ElevatedCard` and `PAGE_ROUTES.RESET_PASSWORD`).

- [ ] **Step 1: Add the `ElevatedCard` component**

Create `src/components/elevated-card.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ElevatedCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
  className?: string;
  children: ReactNode;
}

// stockkit's own polished-card look for the public auth surfaces: rounded
// corners, a soft two-layer lifted shadow. Deliberately not qkit's
// perforated "Ticket" — that's qkit's own booth/receipt motif. See
// docs/superpowers/specs/2026-07-22-landing-login-color-refresh-design.md.
export function ElevatedCard({ as: As = 'div', className, children, ...props }: ElevatedCardProps) {
  return (
    <As
      className={cn(
        'rounded-[20px] border bg-card shadow-[0_1px_0_0_var(--color-border),0_12px_28px_-20px_rgba(0,0,0,0.35)]',
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}
```

- [ ] **Step 2: Add the `RESET_PASSWORD` route constant**

In `src/lib/constants/routes.ts`, update `PAGE_ROUTES`:

```ts
export const PAGE_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/dashboard/products',
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
} as const;
```

- [ ] **Step 3: Write the failing form test**

Create `src/app/(auth)/reset-password/reset-password-form.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { routerPush, routerRefresh, getUserMock, updateUserMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  getUserMock: vi.fn(),
  updateUserMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock, updateUser: updateUserMock } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ResetPasswordForm } from './reset-password-form';

afterEach(() => cleanup());

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUserMock.mockResolvedValue({ error: null });
  });

  it('shows the expired-link state when there is no recovery session', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    render(<ResetPasswordForm />);
    expect(await screen.findByText('This link has expired')).toBeTruthy();
  });

  it('shows the password form when a recovery session exists', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    render(<ResetPasswordForm />);
    expect(await screen.findByLabelText('New password')).toBeTruthy();
  });

  it('shows an error and does not call updateUser when passwords do not match', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveProperty('textContent', 'Passwords do not match');
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it('updates the password and redirects to dashboard on success', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(updateUserMock).toHaveBeenCalledWith({ password: 'hunter22' }));
    expect(routerPush).toHaveBeenCalledWith('/dashboard');
    expect(routerRefresh).toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm vitest run "src/app/(auth)/reset-password/reset-password-form.dom.test.tsx"`
Expected: FAIL — `./reset-password-form` does not exist.

- [ ] **Step 5: Write the form**

Create `src/app/(auth)/reset-password/reset-password-form.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ElevatedCard } from '@/components/elevated-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { navigatingAway, useAsyncAction } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { passwordChangeSchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { FORM_ERROR_CLASS, FORM_LABEL_CLASS } from '@/lib/utils';

type SessionState = 'checking' | 'ready' | 'no-session';

// Sets a new password on the recovery session established by /auth/callback
// (the reset link exchanges its code there, then forwards here). If no
// session is present the link was already used or expired, so this routes
// the vendor back to sign in rather than showing a form that would fail.
export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [state, setState] = useState<SessionState>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAsyncAction();

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState(data.user ? 'ready' : 'no-session');
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  function submit() {
    const parsed = passwordChangeSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your password');
      return;
    }
    setError(null);
    return run(async () => {
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }
      toast.success('Password updated');
      router.push(PAGE_ROUTES.DASHBOARD);
      router.refresh();
      await navigatingAway();
    });
  }

  if (state === 'checking') {
    return (
      <ElevatedCard className="px-7 py-8">
        <p className="text-muted-foreground text-center text-sm">Checking your reset link…</p>
      </ElevatedCard>
    );
  }

  if (state === 'no-session') {
    return (
      <ElevatedCard className="px-7 py-8">
        <h1 className="text-2xl font-semibold leading-tight">This link has expired</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Password reset links can only be used once, and they expire after a short while. Request a
          fresh one from the sign-in page.
        </p>
        <Button asChild variant="outline" className="mt-6 w-full rounded-xl">
          <Link href={PAGE_ROUTES.LOGIN}>Back to sign in</Link>
        </Button>
      </ElevatedCard>
    );
  }

  return (
    <ElevatedCard className="px-7 py-8">
      <h1 className="text-2xl font-semibold leading-tight">Set a new password</h1>
      <p className="text-muted-foreground mt-1.5 text-sm">Pick something at least 8 characters long.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-6 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="new-password" className={FORM_LABEL_CLASS}>
            New password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className={FORM_LABEL_CLASS}>
            Confirm new password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && (
            <p role="alert" className={FORM_ERROR_CLASS}>
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={pending || !password || !confirm}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {pending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </ElevatedCard>
  );
}
```

- [ ] **Step 6: Write the page**

Create `src/app/(auth)/reset-password/page.tsx`:

```tsx
import Link from 'next/link';

import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { ResetPasswordForm } from './reset-password-form';

export const revalidate = 0;

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href={PAGE_ROUTES.HOME} className="text-3xl font-bold tracking-tight">
            <BrandText />
          </Link>
          <p className="text-muted-foreground mt-1 text-sm">Choose a new password for your account.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm vitest run "src/app/(auth)/reset-password/reset-password-form.dom.test.tsx"`
Expected: PASS (4 tests).

- [ ] **Step 8: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 9: Commit**

```bash
git add src/components/elevated-card.tsx src/lib/constants/routes.ts \
  "src/app/(auth)/reset-password/page.tsx" \
  "src/app/(auth)/reset-password/reset-password-form.tsx" \
  "src/app/(auth)/reset-password/reset-password-form.dom.test.tsx"
git commit -m "$(cat <<'EOF'
feat: add reset-password page and stockkit's own ElevatedCard

stockkit had no way to complete a password reset once /auth/callback
established the recovery session. ElevatedCard is a lifted-shadow card
treatment (not a copy of qkit's perforated Ticket, same call loopkit
made for its own ElevatedCard) shared by this and the restyled login.
EOF
)"
```

---

## Task 6: Login page restyle — Google OAuth + forgot password

**Files:**
- Create: `src/app/(auth)/login/login-form.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/login-form.dom.test.tsx`

**Interfaces:**
- Produces: `LoginForm()` (exported, moved out of `page.tsx` so it's directly testable).
- Consumes: `ElevatedCard` (Task 5), `PAGE_ROUTES.RESET_PASSWORD` (Task 5), `FORM_LABEL_CLASS`/`FORM_ERROR_CLASS` (Task 3), `completeSignup` (existing `./actions`), `loginSchema`/`vendorSchema` (existing `@/lib/schemas`).

- [ ] **Step 1: Write the failing test**

Create `src/app/(auth)/login/login-form.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { routerPush, routerRefresh, searchParamsValue, completeSignupMock, authMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  searchParamsValue: { current: '' },
  completeSignupMock: vi.fn(),
  authMock: {
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  useSearchParams: () => new URLSearchParams(searchParamsValue.current),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: authMock }),
}));

vi.mock('./actions', () => ({
  completeSignup: completeSignupMock,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'sonner';

import { LoginForm } from './login-form';

afterEach(() => cleanup());

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsValue.current = '';
    authMock.signInWithOAuth.mockResolvedValue({ error: null });
    authMock.signUp.mockResolvedValue({ data: { session: {} }, error: null });
    authMock.signInWithPassword.mockResolvedValue({ error: null });
    authMock.resetPasswordForEmail.mockResolvedValue({ error: null });
    completeSignupMock.mockResolvedValue({ success: true });
  });

  it('renders the sign-in form by default', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('starts in signup mode when the mode search param is signup', () => {
    searchParamsValue.current = 'mode=signup';
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeTruthy();
    expect(screen.getByLabelText('Stall / business name')).toBeTruthy();
  });

  it('calls signInWithOAuth when Continue with Google is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /Continue with Google/ }));
    expect(authMock.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/auth/callback') },
    });
  });

  it('shows a toast when Google sign-in fails to start', async () => {
    authMock.signInWithOAuth.mockResolvedValue({ error: { message: 'OAuth unavailable' } });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /Continue with Google/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('OAuth unavailable'));
  });

  it('rejects signup without a stall name before calling signUp', async () => {
    searchParamsValue.current = 'mode=signup';
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'vendor@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(authMock.signUp).not.toHaveBeenCalled();
  });

  it('signs up, completes vendor setup, and redirects when a session is returned immediately', async () => {
    searchParamsValue.current = 'mode=signup';
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Stall / business name'), "Mama's Kitchen");
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(completeSignupMock).toHaveBeenCalledWith("Mama's Kitchen"));
    expect(routerPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows the check-your-email signup state when signUp returns no session', async () => {
    authMock.signUp.mockResolvedValue({ data: { session: null }, error: null });
    searchParamsValue.current = 'mode=signup';
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Stall / business name'), "Mama's Kitchen");
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Check your email')).toBeTruthy();
    expect(screen.getByText(/confirmation link/)).toBeTruthy();
  });

  it('signs in with email/password and redirects to dashboard on success', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'vendor@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(authMock.signInWithPassword).toHaveBeenCalledWith({
        email: 'vendor@example.com',
        password: 'hunter22',
      })
    );
    expect(routerPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows a toast when sign-in fails', async () => {
    authMock.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'vendor@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid credentials'));
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('shows a toast and does not send when Forgot password is clicked with no email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Enter your email first'));
    expect(authMock.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('sends a password-reset email and shows the check-your-email reset state', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'vendor@example.com');
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));

    await waitFor(() =>
      expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith('vendor@example.com', {
        redirectTo: expect.stringContaining('/auth/callback?next=/reset-password'),
      })
    );
    expect(await screen.findByText('Check your email')).toBeTruthy();
    expect(screen.getByText(/password reset link/)).toBeTruthy();
  });

  it('returns to sign-in from the check-your-email state', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'vendor@example.com');
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    await screen.findByText('Check your email');

    await user.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run "src/app/(auth)/login/login-form.dom.test.tsx"`
Expected: FAIL — `./login-form` does not exist.

- [ ] **Step 3: Write the form**

Create `src/app/(auth)/login/login-form.tsx`:

```tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ElevatedCard } from '@/components/elevated-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandText } from '@/components/widgets';
import { navigatingAway, useAsyncAction } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { loginSchema, vendorSchema, type LoginInput } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { FORM_ERROR_CLASS, FORM_LABEL_CLASS } from '@/lib/utils';
import { completeSignup } from './actions';

type Mode = 'signin' | 'signup';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.05rem]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [stallName, setStallName] = useState('');
  const [stallNameError, setStallNameError] = useState<string | null>(null);
  const { pending: loading, run } = useAsyncAction();
  const [sent, setSent] = useState<{ email: string; kind: 'signup' | 'reset' } | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function signInWithGoogle() {
    return run(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast.error(error.message);
    });
  }

  function onSubmit(data: LoginInput) {
    if (mode === 'signup') {
      const parsedName = vendorSchema.safeParse({ name: stallName });
      if (!parsedName.success) {
        setStallNameError(parsedName.error.issues[0]?.message ?? 'Enter your stall name');
        return;
      }
    }
    setStallNameError(null);

    return run(async () => {
      if (mode === 'signup') {
        // Land the confirmation-email link back on stockkit — the shared
        // Supabase project's Site URL may point at another kit, so without
        // this the confirm link would bounce the vendor to the wrong app.
        const { data: result, error } = await supabase.auth.signUp({
          ...data,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!result.session) {
          setSent({ email: data.email, kind: 'signup' });
          return;
        }
        const signupResult = await completeSignup(stallName);
        if (!signupResult.success) toast.error(signupResult.error);
        router.push(PAGE_ROUTES.DASHBOARD);
        router.refresh();
        await navigatingAway();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push(PAGE_ROUTES.DASHBOARD);
      router.refresh();
      await navigatingAway();
    });
  }

  function sendReset() {
    const email = getValues('email');
    const parsed = loginSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      toast.error('Enter your email first');
      return;
    }
    return run(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${PAGE_ROUTES.RESET_PASSWORD}`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent({ email, kind: 'reset' });
    });
  }

  const isSignin = mode === 'signin';

  if (sent) {
    const isReset = sent.kind === 'reset';
    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <div className="w-full max-w-md text-center">
          <ElevatedCard className="px-7 py-10">
            <Link href={PAGE_ROUTES.HOME} className="text-2xl font-bold tracking-tight">
              <BrandText />
            </Link>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">Check your email</h1>
            <p className="text-muted-foreground mt-3 text-sm">
              {isReset ? (
                <>
                  We sent a password reset link to{' '}
                  <span className="text-foreground font-medium">{sent.email}</span>. Open it to choose a
                  new password.
                </>
              ) : (
                <>
                  We sent a confirmation link to{' '}
                  <span className="text-foreground font-medium">{sent.email}</span>. Click it to activate
                  your account, then sign in.
                </>
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-7 w-full rounded-xl"
              onClick={() => {
                setSent(null);
                setMode('signin');
              }}
            >
              Back to sign in
            </Button>
          </ElevatedCard>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href={PAGE_ROUTES.HOME} className="text-4xl font-bold tracking-tight">
            <BrandText />
          </Link>
          <p className="text-muted-foreground mt-1 text-sm">
            Track stock in and out, and know your costs.
          </p>
        </div>

        <ElevatedCard>
          <div className="px-7 pt-9 pb-8">
            <h1 className="text-3xl font-semibold leading-tight">
              {isSignin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {isSignin ? 'Sign in to your vendor dashboard.' : 'Set up a vendor account in seconds.'}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
              disabled={loading}
              className="mt-7 h-12 w-full gap-2.5 rounded-xl text-[0.95rem] font-medium"
            >
              <GoogleMark />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <span className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
                or with email
              </span>
              <span className="bg-border h-px flex-1" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="stallName" className={FORM_LABEL_CLASS}>
                    Stall / business name
                  </Label>
                  <Input
                    id="stallName"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Mama's Kitchen"
                    className="h-11 rounded-xl"
                    aria-invalid={!!stallNameError}
                    aria-describedby={stallNameError ? 'stallName-error' : undefined}
                  />
                  {stallNameError && (
                    <p id="stallName-error" role="alert" className={FORM_ERROR_CLASS}>
                      {stallNameError}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className={FORM_LABEL_CLASS}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className={FORM_ERROR_CLASS}>
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password" className={FORM_LABEL_CLASS}>
                    Password
                  </Label>
                  {isSignin && (
                    <button
                      type="button"
                      onClick={sendReset}
                      disabled={loading}
                      className="text-primary text-xs font-semibold underline-offset-4 hover:underline disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" role="alert" className={FORM_ERROR_CLASS}>
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Please wait…' : isSignin ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </div>

          <div className="border-t" />
          <p className="text-muted-foreground px-7 py-4 text-center text-sm">
            {isSignin ? 'New to stockkit? ' : 'Already have an account? '}
            <button
              type="button"
              className="text-primary ml-1 font-semibold underline-offset-4 hover:underline"
              onClick={() => setMode(isSignin ? 'signup' : 'signin')}
            >
              {isSignin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </ElevatedCard>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Shrink the page to a thin wrapper**

Replace the full contents of `src/app/(auth)/login/page.tsx` with:

```tsx
import { Suspense } from 'react';

import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run "src/app/(auth)/login/login-form.dom.test.tsx"`
Expected: PASS (12 tests).

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(auth)/login/page.tsx" "src/app/(auth)/login/login-form.tsx" \
  "src/app/(auth)/login/login-form.dom.test.tsx"
git commit -m "$(cat <<'EOF'
feat: add Google OAuth and forgot-password to login, restyle with ElevatedCard

Brings login to feature parity with qkit/loopkit/paykit: Google
sign-in, a forgot-password flow reusing the existing check-your-email
state (now for both signup confirmation and password reset), and the
same rounded-xl/uppercase-label visual language via ElevatedCard
instead of the default shadcn Card. LoginForm moves to its own file so
it's directly testable outside the page's Suspense boundary.
EOF
)"
```

---

## Task 7: Landing — `Hero` component (authed-aware)

**Files:**
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/hero.dom.test.tsx`

**Interfaces:**
- Produces: `Hero({ authed?: boolean })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/hero.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Hero } from './hero';

afterEach(() => cleanup());

describe('Hero', () => {
  it('links Get started to signup when signed out', () => {
    render(<Hero />);
    const cta = screen.getByRole('link', { name: 'Get started' });
    expect(cta.getAttribute('href')).toBe('/login?mode=signup');
  });

  it('links to the dashboard when signed in', () => {
    render(<Hero authed />);
    const cta = screen.getByRole('link', { name: 'Go to dashboard' });
    expect(cta.getAttribute('href')).toBe('/dashboard');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/hero.dom.test.tsx`
Expected: FAIL — `./hero` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/hero.tsx`:

```tsx
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface HeroProps {
  authed?: boolean;
}

export function Hero({ authed = false }: HeroProps) {
  return (
    <div className="flex-center min-h-screen flex-col gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
        <BrandText />
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Track stock in and out, and know what every product actually costs you.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={authed ? PAGE_ROUTES.DASHBOARD : `${PAGE_ROUTES.LOGIN}?mode=signup`}>
            {authed ? 'Go to dashboard' : 'Get started'}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#how">See how it works</a>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/hero.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/hero.tsx src/components/landing/hero.dom.test.tsx
git commit -m "feat: extract landing Hero into its own authed-aware component"
```

---

## Task 8: Landing — `HowItWorks` component

**Files:**
- Create: `src/components/landing/how-it-works.tsx`
- Create: `src/components/landing/how-it-works.dom.test.tsx`

**Interfaces:**
- Produces: `HowItWorks()`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/how-it-works.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HowItWorks } from './how-it-works';

afterEach(() => cleanup());

describe('HowItWorks', () => {
  it('renders all three steps in order', () => {
    render(<HowItWorks />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Add your products',
      'Log stock in and out',
      'Watch your numbers',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/how-it-works.dom.test.tsx`
Expected: FAIL — `./how-it-works` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/how-it-works.tsx`:

```tsx
const STEPS = [
  {
    title: 'Add your products',
    body: 'List what you stock, its unit cost, and a low-stock threshold.',
  },
  {
    title: 'Log stock in and out',
    body: 'Restock, record waste, or adjust counts — every change is logged.',
  },
  {
    title: 'Watch your numbers',
    body: 'See total inventory value and get alerted when something runs low.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="mb-10 text-center text-3xl font-semibold">Up and running in three steps</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-2xl border p-6">
            <p className="text-muted-foreground font-mono text-xs">Step {i + 1}</p>
            <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/how-it-works.dom.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/how-it-works.tsx src/components/landing/how-it-works.dom.test.tsx
git commit -m "feat: extract landing HowItWorks into its own component"
```

---

## Task 9: Landing — `Benefits` component (new content)

**Files:**
- Create: `src/components/landing/benefits.tsx`
- Create: `src/components/landing/benefits.dom.test.tsx`

**Interfaces:**
- Produces: `Benefits()`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/benefits.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Benefits } from './benefits';

afterEach(() => cleanup());

describe('Benefits', () => {
  it('renders all three benefit headings', () => {
    render(<Benefits />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Always know your on-hand count',
      "See what it's really costing you",
      'Nothing gets lost or overwritten',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/benefits.dom.test.tsx`
Expected: FAIL — `./benefits` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/benefits.tsx`:

```tsx
const BENEFITS = [
  {
    title: 'Always know your on-hand count',
    body: 'Every restock, sale, and adjustment updates a running balance per product — no more counting shelves to find out what you actually have.',
  },
  {
    title: "See what it's really costing you",
    body: 'Carry a per-unit cost on every product and stockkit rolls it up into your total inventory value automatically.',
  },
  {
    title: 'Nothing gets lost or overwritten',
    body: 'Every stock change is kept as a permanent, append-only record — restock, waste, and adjustment history you can always look back on.',
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="mb-10 text-center text-3xl font-semibold">Why vendors pick stockkit</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-2xl border p-6">
            <h3 className="text-xl font-semibold">{b.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/benefits.dom.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/benefits.tsx src/components/landing/benefits.dom.test.tsx
git commit -m "feat: add landing Benefits section (stockkit had none)"
```

---

## Task 10: Landing — `Faq` component

**Files:**
- Create: `src/components/landing/faq.tsx`
- Create: `src/components/landing/faq.dom.test.tsx`

**Interfaces:**
- Produces: `Faq()`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/faq.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Faq } from './faq';

afterEach(() => cleanup());

describe('Faq', () => {
  it('renders every question', () => {
    render(<Faq />);
    expect(screen.getByText('Does stockkit track sales automatically?')).toBeTruthy();
    expect(screen.getByText('What counts as a stock movement?')).toBeTruthy();
    expect(screen.getByText('Is there a free plan?')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/faq.dom.test.tsx`
Expected: FAIL — `./faq` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/faq.tsx`:

```tsx
const FAQ = [
  {
    q: 'Does stockkit track sales automatically?',
    a: 'Not yet — today it’s manual stock in/out and costing. Automatic sales-linked stock tracking is planned.',
  },
  {
    q: 'What counts as a stock movement?',
    a: 'Restock (adding stock), waste (removing spoiled/lost stock), or adjustment (correcting a count) — every movement is kept as a permanent record.',
  },
  {
    q: 'Is there a free plan?',
    a: 'stockkit is free to use today.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <h2 className="mb-10 text-center text-3xl font-semibold">Questions</h2>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group bg-card open:border-primary/50 overflow-hidden rounded-xl border"
          >
            <summary className="focus-visible:ring-primary/50 flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset">
              <span className="text-base leading-snug font-semibold">{item.q}</span>
              <span
                aria-hidden
                className="text-muted-foreground mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-lg leading-none transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="text-foreground/80 px-5 pb-5 text-sm leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/faq.dom.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/faq.tsx src/components/landing/faq.dom.test.tsx
git commit -m "feat: extract landing Faq into its own component"
```

---

## Task 11: Landing — `Cta` component (authed-aware)

**Files:**
- Create: `src/components/landing/cta.tsx`
- Create: `src/components/landing/cta.dom.test.tsx`

**Interfaces:**
- Produces: `Cta({ authed?: boolean })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/cta.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Cta } from './cta';

afterEach(() => cleanup());

describe('Cta', () => {
  it('links Get started to signup when signed out', () => {
    render(<Cta />);
    const cta = screen.getByRole('link', { name: 'Get started' });
    expect(cta.getAttribute('href')).toBe('/login?mode=signup');
  });

  it('links to the dashboard when signed in', () => {
    render(<Cta authed />);
    const cta = screen.getByRole('link', { name: 'Go to dashboard' });
    expect(cta.getAttribute('href')).toBe('/dashboard');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/cta.dom.test.tsx`
Expected: FAIL — `./cta` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/cta.tsx`:

```tsx
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface CtaProps {
  authed?: boolean;
}

export function Cta({ authed = false }: CtaProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-14 text-center">
        <h2 className="text-3xl font-semibold">Know your numbers before you run out.</h2>
        <p className="text-primary-foreground/80 max-w-md">
          Free to use today. Add your products and start logging stock in minutes.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-2">
          <Link href={authed ? PAGE_ROUTES.DASHBOARD : `${PAGE_ROUTES.LOGIN}?mode=signup`}>
            {authed ? 'Go to dashboard' : 'Get started'}
          </Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/cta.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/cta.tsx src/components/landing/cta.dom.test.tsx
git commit -m "feat: add landing closing Cta section"
```

---

## Task 12: Rewire `(public)/page.tsx` composition

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `Hero`, `HowItWorks`, `Benefits`, `Faq`, `Cta` (Tasks 7–11), `createServerClient` (existing `@/lib/supabase/server`).

- [ ] **Step 1: Replace the page**

Replace the full contents of `src/app/(public)/page.tsx` with:

```tsx
import { Benefits } from '@/components/landing/benefits';
import { Cta } from '@/components/landing/cta';
import { Faq } from '@/components/landing/faq';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authed = !!user;

  return (
    <>
      <Hero authed={authed} />
      <HowItWorks />
      <Benefits />
      <Faq />
      <Cta authed={authed} />
    </>
  );
}
```

This is a thin async Server Component composing already-tested pieces; there is no existing precedent in this repo for testing an async page-level Server Component directly (only Route Handlers and `'use client'` components get `.test`/`.dom.test` files), so none is added here — covered instead by Task 13's build/lint/typecheck gate and a manual dev-server check.

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 3: Manual smoke check**

Run: `pnpm dev` (in the background), then open `http://localhost:3000/` in a browser.
Expected: hero, three-step, benefits, FAQ, and closing CTA sections all render; "Get started" links point to `/login?mode=signup`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/page.tsx"
git commit -m "$(cat <<'EOF'
refactor: compose the landing page from the new section components

(public)/page.tsx becomes session-aware (mirrors qkit/loopkit) so the
Hero and closing Cta route an already-signed-in vendor straight to
/dashboard instead of back through /login.
EOF
)"
```

---

## Task 13: Final verification

**Files:** none (verification only; fixes below only if a check fails)

- [ ] **Step 1: Full check**

Run: `pnpm check`
Expected: exits 0 (prettier --check + eslint + tsc --noEmit + route-logging check all pass).

- [ ] **Step 2: Full test suite**

Run: `pnpm test`
Expected: all tests pass, including the new ones from Tasks 3–11 and the pre-existing `test/api/*.test.ts` and dashboard `.dom.test.tsx` suites.

- [ ] **Step 3: Coverage sanity check**

Run: `pnpm test:ci`
Expected: exits 0; review the printed text-coverage summary for `src/app/auth/callback/route.ts`, `src/app/(auth)/reset-password/reset-password-form.tsx`, `src/app/(auth)/login/login-form.tsx`, `src/lib/schemas.ts`, and `src/components/landing/*.tsx` — all should show non-zero, high line coverage given the tests added in this plan.

- [ ] **Step 4: Fix any failures**

If any check in Steps 1–3 fails, fix the root cause in the relevant file from Tasks 1–12 (do not add ad-hoc exclusions or skip flags), rerun the failing command to confirm, then:

```bash
git add -u
git commit -m "fix: address final verification failures"
```

Skip this step entirely if Steps 1–3 all passed clean.

- [ ] **Step 5: Note manual-only follow-up**

No code change needed — record for the user: Google OAuth requires the Google provider to be enabled in the Supabase project's Auth settings (an infrastructure step outside this repo). No live Supabase project is configured in this dev/CI environment (per `AGENTS.md`), so the OAuth and email-confirmation flows can't be exercised end-to-end here — verification for those is the test suite above plus a manual check once a project is configured.
