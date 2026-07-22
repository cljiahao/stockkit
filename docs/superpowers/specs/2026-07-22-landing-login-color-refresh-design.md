# stockkit — landing page, login parity, and color refresh

Date: 2026-07-22

## Problem

stockkit's public-facing surfaces (landing page, login page, color palette)
were built as a fast v1 scaffold and have drifted from the pattern shared by
its three sibling kits (qkit, loopkit, paykit):

- **Landing page** exists (`(public)/page.tsx`: hero + 3-step + FAQ) but is a
  single flat file with no component decomposition, and is missing a
  "why vendors pick stockkit" benefits section that every sibling has.
- **Login page** exists but lacks Google OAuth, forgot-password/reset-password,
  and the visual polish (elevated card, rounded-xl inputs, uppercase-tracking
  labels) all three siblings share. There is no `/auth/callback` route at all.
- **Color palette**: stockkit's primary (`oklch(0.45 0.09 250)`, chroma 0.09)
  is intentionally its own steel/cobalt-blue hue per `AGENTS.md`, distinct
  from qkit's ember, loopkit's magenta/gold, and paykit's neutral+mint/flow —
  but its chroma is markedly lower than the siblings' (0.12–0.18), so it reads
  flat/washed-out next to them. There is also a dead gradient utility
  (`.text-brand-gradient` / `.bg-brand-gradient` = `from-primary via-primary
  to-primary`, i.e. one solid color, not a gradient).

There is also an in-flight, uncommitted refactor already sitting in the repo
(`(public)/layout.tsx`, `navbar.tsx`, `site-footer.tsx`) that moves `Navbar`/
`SiteFooter` toward the authed-aware, server-component pattern the siblings
use. This work builds on top of that WIP rather than replacing it.

Out of scope: `.env.example` / `src/lib/utils/request-origin.ts` changes
already sitting uncommitted are an unrelated, separate in-flight task and are
left untouched here. No changes to the data model, RLS, or stock-movement
logic. No cross-kit shared UI package (considered and rejected — see
"Approaches considered" below).

## Approaches considered

1. **Full structural + visual parity, own visual skin (chosen).** Decompose
   the landing page into components matching the sibling file shape, bring
   login up to auth-feature parity, restyle with a stockkit-owned elevated
   card (not a copy of qkit's perforated "Ticket," which is qkit's own
   booth/receipt motif — loopkit already set the precedent of building its
   own `ElevatedCard` rather than reusing Ticket).
2. **Visual-only, no decomposition.** Keep the landing page as one file, only
   fix colors/card styling and add login auth features. Rejected: the landing
   file keeps growing and diverges further from how the other three kits
   structure theirs, making future edits harder.
3. **Extract a shared cross-kit UI package.** One library all four kits
   import. Rejected: cross-repo scope, breaks the kits' deliberate
   independence, overkill for a v1 first-cut kit.

## Color decision

Deep research (`deep-research` skill, 102 sub-agents) found solid, corroborated
grounding on contrast mechanics (WCAG AA/AAA thresholds, APCA's graduated
scale, OKLCH's perceptual-uniformity properties) but produced **no verified
evidence** for hue-psychology conventions or named-competitor precedent
(Sortly, inFlow, Zoho Inventory, Cin7, Katana, Ordoro) — every such claim was
submitted to adversarial verification and refuted for lack of independent
corroboration. One useful negative finding survived: holding OKLCH lightness
constant while raising chroma does **not** guarantee the contrast ratio
against a fixed background stays the same — it must be re-measured, not
assumed.

Given no external verdict, the color choice was made by direct contrast
computation (OKLCH → linear sRGB → WCAG relative-luminance ratio, standard
Björn Ottosson OKLab conversion formulas) plus hue-distance constraint
checking against the three sibling palettes:

| token | value | hex (approx) | contrast vs near-white text | contrast vs page bg |
|---|---|---|---|---|
| `--primary` (light) | `oklch(0.46 0.16 255)` | `#0055ae` | 6.81 | 6.61 |
| `--primary` (dark) | `oklch(0.68 0.13 252)` | `#589ce6` | 6.84 (vs near-black) | 6.29 |

Both clear WCAG AAA (7:1) territory with margin. Hue 255 sits 35° from
paykit's minor "flow" accent (220), 95° from loopkit's magenta primary (350),
and 220° from qkit's ember primary (36) — stays clearly distinct while
keeping stockkit's committed cobalt/steel-blue identity (no hue switch to
indigo/teal — there was no verified reason to move away from the family
already documented in `AGENTS.md`).

`--primary-hover` and `--ring` are re-derived from the new `--primary` by
walking lightness only (holding hue/chroma fixed), per the OKLCH
derived-state technique the research corroborated. Stock-status tokens
(`--stock-ok/-low/-out`) are untouched — they stay reserved for stock-level
signals only, never the brand accent, per existing `AGENTS.md` rule.

## Design

### 1. Color tokens (`src/app/globals.css`)

- `:root` and `.dark` `--primary`/`--primary-hover`/`--ring` updated to the
  values above (light and dark variants respectively).
- `.text-brand-gradient` / `.bg-brand-gradient` fixed to an actual two-stop
  gradient (`from-primary to-primary-hover` or similar — no longer three
  identical stops).
- No other token changes; `--accent`/`--secondary`/`--stock-*` unchanged.

### 2. Landing page decomposition

New `src/components/landing/` directory, one component per section, mirroring
qkit/loopkit/paykit's shape:

- `hero.tsx` — headline, subcopy, primary CTA (existing hero content, extracted)
- `how-it-works.tsx` — existing 3-step content, extracted
- `benefits.tsx` — **new** "why vendors pick stockkit" section (stockkit
  currently has no equivalent to qkit's MOAT / loopkit's Benefits); copy
  focuses on the ledger/costing angle already central to stockkit's identity
  (running on-hand counts, per-unit cost visibility, append-only movement
  history) — not the "ties to your sales" cross-kit tagline, which is
  explicitly out of scope per `AGENTS.md`
- `faq.tsx` — existing FAQ content, extracted, same accordion pattern
- `cta.tsx` — closing call-to-action, mirrors sibling pattern of a second CTA
  before the footer

`(public)/page.tsx` becomes a thin composition of these components plus the
existing `Navbar`/`SiteFooter`, following the exact shape of qkit's/loopkit's/
paykit's root `page.tsx`. Existing session-check logic (authed CTA routing)
carries over unchanged.

### 3. Login parity

- **`ElevatedCard`** (`src/components/elevated-card.tsx`) — new, stockkit-owned
  card treatment: rounded corners, soft two-layer lifted shadow, no
  scallop/perforation (that's qkit's Ticket, deliberately not adopted, same
  reasoning loopkit documented in its own `elevated-card.tsx`). Replaces the
  plain shadcn `Card` on the login page only; shadcn `Card` stays available
  elsewhere unchanged.
- **Google OAuth** — `signInWithOAuth({ provider: 'google', ... })` button
  above the email/password form, same Google mark SVG and button treatment as
  siblings. Redirects through the new `/auth/callback` route.
- **Forgot password** — link next to the password label (sign-in mode only)
  triggers `resetPasswordForEmail`, transitions to a "check your email" state
  (`kind: 'reset'`), reusing/extending the existing sent-state UI rather than
  duplicating it.
- **`/auth/callback/route.ts`** (new, doesn't exist today) — exchanges the
  OAuth/recovery `code` for a session via `exchangeCodeForSession`; accepts an
  optional `?next=` param but only honors a same-origin relative path
  (rejects `//`-prefixed and absolute URLs to prevent open redirect),
  defaulting to `/dashboard`; redirects to `/login?error=oauth` on missing
  code or exchange failure. Mirrors paykit's implementation, including its
  redirect-safety behavior.
- **`(auth)/reset-password/page.tsx` + form** (new) — three states: checking
  session, no session (expired/used link → back-to-sign-in), ready (new
  password + confirm form via `updateUser`). Mirrors qkit's/loopkit's
  reset-password form structure.
- **Schema**: `passwordChangeSchema` added to `src/lib/schemas.ts`
  (password + confirm, min-length + match validation).
- **Visual polish carried through**: rounded-xl inputs sized h-11/h-12,
  uppercase-tracking-wide labels, thin `border-t` divider (not a perforation)
  between the form and the mode-switch footer line, matching the sizing/
  spacing conventions (not the paper-ticket motif) siblings use.

`src/proxy.ts` / `src/lib/supabase/middleware.ts` need no changes — only
`/dashboard` is a protected path today, so `/auth/callback` and
`/reset-password` are already reachable unauthenticated.

Google OAuth requires the Google provider to be enabled in the Supabase
project's Auth settings — an infrastructure/config step outside this
codebase, called out here so it isn't assumed to work purely from the code
change. No live Supabase project is configured in this dev/CI environment
today (per `AGENTS.md`), so this cannot be manually verified end-to-end in
this environment either; verification is via the test suite below plus a
manual check once a project is configured.

### 4. Testing

CI hard-gates changed-line coverage at ≥80% (`diff-cover`), so new logic
needs direct coverage, not just manual smoke-testing:

- `/auth/callback/route.test.ts` — mirrors paykit's suite: missing code,
  successful exchange (default redirect + `?next=` honored), open-redirect
  rejection (`//evil.com` and absolute-URL `next` values both fall back to
  `/dashboard`), failed exchange.
- Reset-password form — `.dom.test.tsx` covering the three states (checking/
  no-session/ready) and the password-mismatch/too-short validation path,
  mirroring loopkit's existing `reset-password-form.dom.test.tsx` pattern.
- `passwordChangeSchema` — direct schema validation cases (mismatch, too
  short, valid).
- Login form — Google OAuth button triggers `signInWithOAuth` with the
  correct redirect target; forgot-password triggers `resetPasswordForEmail`
  and flips to the reset "check your email" state.

No changes needed to the existing `test/api/*.test.ts` health-route suite.

## Non-goals

- No changes to `stock_movements`, RLS policies, or any data-model file.
- No cross-kit shared package.
- No resolution of the unrelated uncommitted `.env.example` /
  `request-origin.ts` diff already in the working tree — left as-is.
- No new stock-status colors or reuse of green/amber/red as brand accents.
