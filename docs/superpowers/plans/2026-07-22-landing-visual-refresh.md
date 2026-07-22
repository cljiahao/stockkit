# stockkit landing visual refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give stockkit's landing page the visual richness qkit/loopkit already have — ambient background, a hero illustration, a display typeface, icons/numbering on content sections, lifted cards, restrained motion, and a simplified navbar — without touching page structure, copy, or color palette (all already correct from the prior parity pass).

**Architecture:** Additive CSS/font foundations in `globals.css`/`layout.tsx` (Task 1), then one new presentational component (`LedgerCardPreview`), then per-section visual upgrades to the five already-shipped landing components plus the navbar. No new routes, no new data fetching, no new dependencies (lucide-react is already installed; Space Grotesk loads via the existing `next/font/google` pattern).

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, `next/font/google`, `lucide-react`, Vitest + Testing Library.

## Global Constraints

- TypeScript strict — no `any`, no `@ts-ignore`.
- Comment hygiene: own-line comments only, never trailing inline comments; no dead/commented-out code.
- No changes to RLS, the data model, `stock_movements`, page structure/section order, landing copy content, or the color palette itself (`--primary` etc. were finalized in the prior PR) — only markup/styling additions.
- `font-mono` stays reserved for quantity/cost figures — `LedgerCardPreview`'s on-hand count and unit cost correctly use it; nothing else on the landing page should start using it decoratively.
- Stock-status tokens (`--stock-ok/-low/-out`, `STOCK_STATUS_DOT_CLASS` etc. from `src/lib/stock.ts`) stay reserved for actual stock-status signals — `LedgerCardPreview`'s status dot is a legitimate use (it _is_ showing a stock status), nothing else on the page should reuse those colors decoratively.
- No scroll-triggered animation library — `fade-rise` is a mount-triggered CSS animation only, wrapped in `prefers-reduced-motion: reduce`.
- Vitest: `globals: false` (import `describe/it/expect` explicitly from `vitest`), `// @vitest-environment jsdom` required as the first line of any test that renders a component, no `jest-dom` matchers available (use `.toBeTruthy()`/`.toHaveProperty(...)`/`.getAttribute(...)`, not `toBeInTheDocument()`/`toHaveAttribute()`).
- The existing tests for `Hero`, `HowItWorks`, `Benefits`, and `Cta` (all in `src/components/landing/`) must continue to pass **unmodified** — every task below preserves the exact heading text and link text/hrefs those tests assert on. If a step in this plan would require editing one of those four existing test files, stop and treat that as a signal something drifted from spec — do not silently rewrite the assertions.

---

## Task 1: Typography, ambient background, and motion foundations

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Produces: CSS custom property `--font-display` (usable via Tailwind's `font-display` utility class, mirroring how `--font-mono`/`font-mono` already work); CSS custom properties `--gradient-wash-1`/`--gradient-wash-2` (theme-scoped, consumed only by the `body` background — not intended for direct use elsewhere); a `.fade-rise` utility class.
- Consumed by: Tasks 2–7 (`.font-display` on every landing/nav heading, `.fade-rise` on Hero content, `LedgerCardPreview`, and the HowItWorks/Benefits cards).

- [ ] **Step 1: Add the Space Grotesk font loader**

In `src/app/layout.tsx`, change the import line:

```ts
import { Geist_Mono, Lato } from 'next/font/google';
```

to:

```ts
import { Geist_Mono, Lato, Space_Grotesk } from 'next/font/google';
```

Add a new loader below the existing `geistMono` one:

```ts
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});
```

Add `${spaceGrotesk.variable}` to the `body` className template string:

```tsx
<body className={`${lato.variable} ${geistMono.variable} ${spaceGrotesk.variable} relative antialiased`}>
```

- [ ] **Step 2: Register `--font-display` and the `.font-display` utility**

In `src/app/globals.css`, in the `@theme inline` block, add a line directly after `--font-mono: var(--font-geist-mono);`:

```css
--font-display: var(--font-space-grotesk);
```

In the `@layer utilities` block, add a new utility (anywhere among the existing ones, e.g. after `.text-brand-gradient`):

```css
.font-display {
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
```

- [ ] **Step 3: Add the ambient-background gradient tokens**

In `src/app/globals.css`'s `:root` block, add two new lines directly after `--stock-out: oklch(0.58 0.2 27);`:

```css
--gradient-wash-1: oklch(0.46 0.16 255 / 0.06);
--gradient-wash-2: oklch(0.46 0.16 255 / 0.04);
```

In the `.dark` block, add directly after `--stock-out: oklch(0.62 0.2 27);`:

```css
--gradient-wash-1: oklch(0.68 0.13 252 / 0.1);
--gradient-wash-2: oklch(0.68 0.13 252 / 0.07);
```

- [ ] **Step 4: Apply the gradients to `body`**

In `src/app/globals.css`'s `@layer base` block, replace:

```css
body {
  @apply bg-background text-foreground;
}
```

with:

```css
body {
  @apply bg-background text-foreground;
  background-image:
    radial-gradient(ellipse 70% 45% at 15% -10%, var(--gradient-wash-1), transparent 60%),
    radial-gradient(ellipse 55% 40% at 100% 0%, var(--gradient-wash-2), transparent 55%);
  background-attachment: fixed;
}
```

- [ ] **Step 5: Add the `fade-rise` animation**

In `src/app/globals.css`, directly after the existing `.animate-float { ... }` block, add:

```css
@keyframes fade-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-rise {
  animation: fade-rise 0.4s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .fade-rise {
    animation: none;
  }
}
```

- [ ] **Step 6: Build sanity check**

Run: `pnpm build`
Expected: succeeds — confirms the new font loader and CSS compile with no errors.

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
feat: add display typeface, ambient background, and fade-rise motion

Foundations for the landing visual refresh: Space Grotesk as
--font-display (shares letterform DNA with the existing font-mono
ledger numerals, unlike qkit's Fraunces or loopkit's Bricolage
Grotesque), two cobalt-tinted ambient gradient washes on body
(retinted per-theme, no paper-grain texture), and a reduced-motion
-respecting fade-rise entrance animation.
EOF
)"
```

---

## Task 2: `LedgerCardPreview` component + test

**Files:**

- Create: `src/components/landing/ledger-card-preview.tsx`
- Create: `src/components/landing/ledger-card-preview.dom.test.tsx`

**Interfaces:**

- Produces: `LedgerCardPreview()` — a static, non-interactive marketing illustration (no props).
- Consumes: `ElevatedCard` (`@/components/elevated-card`), `STOCK_STATUS_DOT_CLASS` (`@/lib/stock`), `cn` (`@/lib/utils`).
- Consumed by: Task 3's `Hero`.

- [ ] **Step 1: Write the failing test**

Create `src/components/landing/ledger-card-preview.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LedgerCardPreview } from './ledger-card-preview';

afterEach(() => cleanup());

describe('LedgerCardPreview', () => {
  it('renders the mock product name, on-hand count, unit cost, and a recent movement', () => {
    render(<LedgerCardPreview />);
    expect(screen.getByText('Whole Bean Coffee 1kg')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('$18.50')).toBeTruthy();
    expect(screen.getByText('+12 restock')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/landing/ledger-card-preview.dom.test.tsx`
Expected: FAIL — `./ledger-card-preview` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/landing/ledger-card-preview.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react';

import { ElevatedCard } from '@/components/elevated-card';
import { STOCK_STATUS_DOT_CLASS } from '@/lib/stock';
import { cn } from '@/lib/utils';

// A static marketing illustration (not real data) — stockkit's answer to
// qkit's live order-board carousel / loopkit's stamp card: show the actual
// product concept (a ledger entry) instead of describing it in text.
export function LedgerCardPreview() {
  return (
    <ElevatedCard className="fade-rise mx-auto w-full max-w-sm p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className={cn('size-2.5 rounded-full', STOCK_STATUS_DOT_CLASS.ok)} />
          <span className="text-sm font-semibold">Whole Bean Coffee 1kg</span>
        </div>
        <span className="text-muted-foreground text-xs">In stock</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">On hand</p>
          <p className="font-mono text-3xl font-semibold">42</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Unit cost</p>
          <p className="font-mono text-3xl font-semibold">$18.50</p>
        </div>
      </div>
      <div className="border-border mt-5 border-t pt-4">
        <div className="flex items-center gap-2 text-sm">
          <ArrowUpRight className="text-stock-ok size-4" aria-hidden />
          <span className="font-mono">+12 restock</span>
          <span className="text-muted-foreground">· 2h ago</span>
        </div>
      </div>
    </ElevatedCard>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/landing/ledger-card-preview.dom.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/ledger-card-preview.tsx src/components/landing/ledger-card-preview.dom.test.tsx
git commit -m "feat: add LedgerCardPreview, stockkit's hero illustration"
```

---

## Task 3: `Hero` — two-column layout, trust strip, ledger illustration

**Files:**

- Modify: `src/components/landing/hero.tsx`

**Interfaces:**

- Consumes: `LedgerCardPreview` (Task 2).
- No change to `Hero`'s own props or exported signature (`{ authed?: boolean }` unchanged) — the existing `hero.dom.test.tsx` must pass unmodified.

- [ ] **Step 1: Replace the component**

Replace the full contents of `src/components/landing/hero.tsx` with:

```tsx
import Link from 'next/link';

import { LedgerCardPreview } from '@/components/landing/ledger-card-preview';
import { Button } from '@/components/ui/button';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface HeroProps {
  authed?: boolean;
}

const TRUST = ['Free to use', 'No setup fee', 'Own your data'];

export function Hero({ authed = false }: HeroProps) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
      <div className="fade-rise text-center lg:text-left">
        <h1 className="font-display text-4xl font-bold tracking-tight lg:text-6xl">
          <BrandText />
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-md text-lg lg:mx-0">
          Track stock in and out, and know what every product actually costs you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <Button asChild size="lg">
            <Link href={authed ? PAGE_ROUTES.DASHBOARD : `${PAGE_ROUTES.LOGIN}?mode=signup`}>
              {authed ? 'Go to dashboard' : 'Get started'}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#how">See how it works</a>
          </Button>
        </div>
        <ul className="text-muted-foreground mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm lg:justify-start">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span aria-hidden className="bg-primary/60 size-1.5 rounded-full" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="fade-rise flex justify-center lg:justify-end">
        <LedgerCardPreview />
      </div>
    </div>
  );
}
```

Note: this replaces the previous full-viewport (`min-h-screen`) centered hero with a padded two-column section — matching how both qkit and loopkit pair hero copy with a visual rather than centering text alone in the viewport.

- [ ] **Step 2: Run the existing Hero test to confirm it still passes unmodified**

Run: `pnpm vitest run src/components/landing/hero.dom.test.tsx`
Expected: PASS (2 tests) — the CTA link text/hrefs are unchanged, so `hero.dom.test.tsx` needs no edits.

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat: give Hero a two-column layout with the ledger illustration and trust strip"
```

---

## Task 4: `HowItWorks` — icons, numbering, lifted cards

**Files:**

- Modify: `src/components/landing/how-it-works.tsx`

**Interfaces:**

- Consumes: `ElevatedCard` (`@/components/elevated-card`), `lucide-react` icons.
- No change to `HowItWorks`'s exported signature or step titles — the existing `how-it-works.dom.test.tsx` must pass unmodified.

- [ ] **Step 1: Replace the component**

Replace the full contents of `src/components/landing/how-it-works.tsx` with:

```tsx
import { ListChecks, RefreshCw, TrendingUp } from 'lucide-react';

import { ElevatedCard } from '@/components/elevated-card';

const STEPS = [
  {
    icon: ListChecks,
    title: 'Add your products',
    body: 'List what you stock, its unit cost, and a low-stock threshold.',
  },
  {
    icon: RefreshCw,
    title: 'Log stock in and out',
    body: 'Restock, record waste, or adjust counts — every change is logged.',
  },
  {
    icon: TrendingUp,
    title: 'Watch your numbers',
    body: 'See total inventory value and get alerted when something runs low.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold">
        Up and running in three steps
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <ElevatedCard
            key={step.title}
            className="fade-rise p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary font-mono text-sm font-semibold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="bg-border h-px flex-1" />
              <step.icon className="text-primary size-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.body}</p>
          </ElevatedCard>
        ))}
      </div>
    </section>
  );
}
```

Numbering is retained deliberately (`01/02/03`) — these three steps are a real, ordered sequence (add products → log stock → watch numbers), not a decorative list.

- [ ] **Step 2: Run the existing test to confirm it still passes unmodified**

Run: `pnpm vitest run src/components/landing/how-it-works.dom.test.tsx`
Expected: PASS (1 test) — step titles are unchanged, so `how-it-works.dom.test.tsx` needs no edits.

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/how-it-works.tsx
git commit -m "feat: add icons and 01/02/03 numbering to HowItWorks"
```

---

## Task 5: `Benefits` — icons, lifted cards

**Files:**

- Modify: `src/components/landing/benefits.tsx`

**Interfaces:**

- Consumes: `ElevatedCard` (`@/components/elevated-card`), `lucide-react` icons.
- No change to `Benefits`'s exported signature or item titles — the existing `benefits.dom.test.tsx` must pass unmodified.

- [ ] **Step 1: Replace the component**

Replace the full contents of `src/components/landing/benefits.tsx` with:

```tsx
import { Boxes, Coins, History } from 'lucide-react';

import { ElevatedCard } from '@/components/elevated-card';

const BENEFITS = [
  {
    icon: Boxes,
    title: 'Always know your on-hand count',
    body: 'Every restock, waste, and adjustment updates a running balance per product — no more counting shelves to find out what you actually have.',
  },
  {
    icon: Coins,
    title: "See what it's really costing you",
    body: 'Carry a per-unit cost on every product and stockkit rolls it up into your total inventory value automatically.',
  },
  {
    icon: History,
    title: 'Nothing gets lost or overwritten',
    body: 'Every stock change is kept as a permanent, append-only record — restock, waste, and adjustment history you can always look back on.',
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold">
        Why vendors pick stockkit
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <ElevatedCard
            key={b.title}
            className="fade-rise p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <b.icon className="text-primary size-6" aria-hidden />
            <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{b.body}</p>
          </ElevatedCard>
        ))}
      </div>
    </section>
  );
}
```

No numbering here — these three benefits aren't a sequence, so (unlike HowItWorks) no `01/02/03` markers are added.

- [ ] **Step 2: Run the existing test to confirm it still passes unmodified**

Run: `pnpm vitest run src/components/landing/benefits.dom.test.tsx`
Expected: PASS (1 test) — benefit titles are unchanged, so `benefits.dom.test.tsx` needs no edits.

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/benefits.tsx
git commit -m "feat: add icons and lifted cards to Benefits"
```

---

## Task 6: `Faq` and `Cta` — display typeface on headings

**Files:**

- Modify: `src/components/landing/faq.tsx`
- Modify: `src/components/landing/cta.tsx`

**Interfaces:**

- Consumes: `.font-display` (Task 1). No prop/behavior changes to either component — existing `cta.dom.test.tsx` must pass unmodified (`Faq` has no test).

- [ ] **Step 1: Update `Faq`'s heading**

In `src/components/landing/faq.tsx`, change:

```tsx
<h2 className="mb-10 text-center text-3xl font-semibold">Questions</h2>
```

to:

```tsx
<h2 className="font-display mb-10 text-center text-3xl font-semibold">Questions</h2>
```

- [ ] **Step 2: Update `Cta`'s heading**

In `src/components/landing/cta.tsx`, change:

```tsx
<h2 className="text-3xl font-semibold">Know your numbers before you run out.</h2>
```

to:

```tsx
<h2 className="font-display text-3xl font-semibold">Know your numbers before you run out.</h2>
```

- [ ] **Step 3: Run the existing Cta test to confirm it still passes unmodified**

Run: `pnpm vitest run src/components/landing/cta.dom.test.tsx`
Expected: PASS (2 tests) — link text/hrefs are unchanged.

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/faq.tsx src/components/landing/cta.tsx
git commit -m "feat: apply display typeface to Faq and Cta headings"
```

---

## Task 7: `Navbar` — sticky translucent bar

**Files:**

- Modify: `src/components/layout/navbar.tsx`
- Create: `src/components/layout/navbar.dom.test.tsx`

**Interfaces:**

- No change to `Navbar`'s exported signature (`{ authed?: boolean }` unchanged) — only markup/styling changes plus a new test (none existed before).

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/navbar.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Navbar } from './navbar';

afterEach(() => cleanup());

describe('Navbar', () => {
  it('shows Sign in and Get started when signed out', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Get started' }).getAttribute('href')).toBe(
      '/login?mode=signup'
    );
  });

  it('shows Dashboard when signed in', () => {
    render(<Navbar authed />);
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/dashboard');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/layout/navbar.dom.test.tsx`
Expected: FAIL only if the current markup doesn't expose these roles/text — in practice this should already PASS against the current implementation (it's a new test of existing behavior). If it fails, read the diff between this test's expectations and the current `navbar.tsx` before proceeding to Step 3 — do not silently change the test's expectations to match unrelated behavior.

- [ ] **Step 3: Replace the component**

Replace the full contents of `src/components/layout/navbar.tsx` with:

```tsx
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface NavbarProps {
  authed?: boolean;
}

// Public-marketing nav only — the dashboard uses its own DashboardNav
// (vendor name + sign out), never this one, so this stays a plain server
// component: logo plus one auth-aware primary action, no client JS needed.
export function Navbar({ authed = false }: NavbarProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={PAGE_ROUTES.HOME} className="font-display text-xl font-bold tracking-tight">
          <span className="text-primary">stock</span>
          <span className="text-foreground">kit</span>
        </Link>

        <div className="flex items-center gap-2">
          {authed ? (
            <Button asChild className="h-10 rounded-lg px-5 font-semibold">
              <Link href={PAGE_ROUTES.DASHBOARD}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="h-10 rounded-lg px-4">
                <Link href={PAGE_ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button asChild className="h-10 rounded-lg px-5 font-semibold">
                <Link href={`${PAGE_ROUTES.LOGIN}?mode=signup`}>Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

This replaces the previous floating rounded-pill (`fixed ... rounded-2xl border shadow-lg`) with a full-width sticky translucent bar (matching loopkit's `sticky top-0 border-b bg-background/80 backdrop-blur` pattern) — a floating detached pill would sit oddly on top of the new ambient-gradient background from Task 1.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/layout/navbar.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/navbar.tsx src/components/layout/navbar.dom.test.tsx
git commit -m "feat: replace floating pill navbar with a sticky translucent bar"
```

---

## Task 8: Final verification

**Files:** none (verification only; fixes below only if a check fails)

- [ ] **Step 1: Full check**

Run: `pnpm check`
Expected: exits 0 (prettier --check + eslint + tsc --noEmit + route-logging check all pass). Note: on Windows checkouts with `core.autocrlf=true`, `prettier --check .` run directly against the raw working tree can fail on line-ending grounds unrelated to this branch's content — if that happens, verify with `npx prettier --check --end-of-line auto <changed files>` before concluding there's a real formatting issue (see the prior PR's precedent for this exact false-positive).

- [ ] **Step 2: Full test suite**

Run: `pnpm test`
Expected: all tests pass, including the new `ledger-card-preview.dom.test.tsx` and `navbar.dom.test.tsx`, and the five pre-existing landing tests (`hero`, `how-it-works`, `benefits`, `faq` has none, `cta`) unmodified.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 4: Fix any failures**

If any check in Steps 1–3 fails, fix the root cause in the relevant file from Tasks 1–7, rerun the failing command to confirm, then:

```bash
git add -u
git commit -m "fix: address final verification failures"
```

Skip this step entirely if Steps 1–3 all passed clean.

- [ ] **Step 5: Note the visual-verification limitation**

No code change needed — record for the user: this environment has no live Supabase project configured (`AGENTS.md`), so the landing page cannot be visually checked in a local `pnpm dev` browser session here (the page's session check throws on missing Supabase env vars at request time, same constraint noted for the prior landing/login PR). Visual confirmation of the ambient background, hero illustration, typography, icons, and navbar should happen via the Vercel preview deployment this branch's PR will generate (the repo's CI already showed a working Vercel preview deployment on the prior PR, meaning it has working Supabase credentials configured there unlike local dev).
