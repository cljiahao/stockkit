# stockkit — landing page visual refresh (hero, navbar, typography, motion)

Date: 2026-07-22

## Problem

The landing/login parity pass (merged in #1) gave stockkit the right
*structure* — Hero/HowItWorks/Benefits/Faq/Cta as separate components,
matching qkit/loopkit/paykit's file shape. But the user's follow-up feedback
is that the page still isn't visually pleasing: it's flat. Structural parity
alone didn't close the gap — qkit and loopkit each layer real visual polish
on top of that structure that stockkit's landing page has none of:

- A concrete hero illustration (qkit: a live order-board carousel; loopkit: a
  stamp-card graphic) instead of text-only.
- An ambient tinted background (two low-opacity radial gradients,
  `background-attachment: fixed`) instead of flat `bg-background`.
- A distinct display typeface for headings (qkit: Fraunces; loopkit:
  Bricolage Grotesque) instead of reusing the body sans everywhere.
- Icons and a numbered-step treatment on HowItWorks/Benefits instead of bare
  text blocks.
- A navbar that reads as part of the same page (both siblings use a
  full-width sticky/inline bar) — stockkit's current navbar is a floating
  rounded pill with its own shadow, which will look disconnected sitting on
  top of a new ambient-gradient background.

Research basis: a fork read qkit's `hero-preview-carousel.tsx`, `ticket.tsx`
+ its scallop/ambient-gradient CSS, `featured-booths.tsx`, and its
`docs/superpowers/specs/2026-06-16-landing-refresh-design.md`; and loopkit's
`stamp-card.tsx`, `nav.tsx`, `benefits.tsx`, `how-it-works.tsx`, and its
`fade-rise` animation and documented (BMC Psychology 2025 / Royal Society
Open Science 2023-cited) color-brightness rationale. Full findings summarized
in the design conversation; not re-duplicated here — the "Design" section
below states the conclusions.

Out of scope: no changes to the color palette itself (light/dark `--primary`
etc. were just finalized in #1), no changes to landing copy content, no
changes to login/reset-password (already restyled in #1), no changes to
RLS/data model.

## What's reusable vs. brand-specific (from the research)

**Reusable techniques** (hue/motif-agnostic, legitimate to bring to
stockkit):
- Ambient body background (two radial gradients + `background-attachment:
  fixed`) — retint with stockkit's own cobalt primary.
- A concrete hero visual instead of text-only.
- Icons on Benefits/HowItWorks items.
- Numbered step markers (`01/02/03` mono + rule + icon) — justified here
  specifically because HowItWorks *is* a real sequence (add products → log
  stock → watch numbers), not decoration for its own sake (per the
  `frontend-design` skill's explicit warning against numbering that doesn't
  encode real sequence).
- `fade-rise` entrance animation, reduced-motion-respecting.
- Lifted-shadow cards instead of plain `border p-6`.

**Brand-specific — not copied:**
- qkit's perforated `.ticket` scallop (booth/receipt motif) and kraft-paper
  noise texture.
- loopkit's `StampCard` illustration concept and its `--gold` accent color.
- Either kit's specific font choice (Fraunces / Bricolage Grotesque) —
  stockkit picks its own.
- A freeform decorative secondary accent color — stockkit's only non-primary
  hues (green/amber/red) are hard-reserved for stock-status signals per
  `AGENTS.md` and stay that way.

## Approaches considered

1. **Full visual layer on the existing structure (chosen).** Add ambient
   background, hero illustration, display font, icons/numbering, lifted
   cards, entrance motion, and a simplified navbar — all additive to the
   already-shipped component structure, no structural changes.
2. **Minimal richness bump.** Ambient background + icons only, skip the hero
   illustration and navbar change. Rejected: the hero is explicitly the
   weakest part per the "flat" complaint, and the navbar was called out by
   name — skipping either doesn't address the actual feedback.
3. **New hero showpiece only, skip everything else.** Rejected: same reason
   in reverse — a strong hero next to bare-text Benefits/HowItWorks and the
   old navbar would read as inconsistent, not "pleasing."

## Design

### 1. Typography — Space Grotesk display face

Add `Space_Grotesk` via `next/font/google` in `src/app/layout.tsx`
(`variable: '--font-space-grotesk'`), alongside the existing `Lato`/
`Geist_Mono` loaders. Register `--font-display: var(--font-space-grotesk)`
in `globals.css`'s `@theme inline` fonts block, and add a `.font-display`
utility (`font-family: var(--font-display); letter-spacing: -0.01em;`),
mirroring qkit's own `.font-display` pattern.

Rationale: Space Grotesk is a display sibling of Space Mono, so it shares
letterform DNA with stockkit's existing `font-mono` ledger numerals instead
of fighting them — a typeface choice made *for this brief specifically*
(precise/financial/ledger tone), not qkit's warm-editorial serif or
loopkit's rounded grotesque.

Applied to: `Hero`'s `<h1>`, `HowItWorks`/`Benefits`/`Faq`/`Cta`'s `<h2>`,
and the navbar wordmark link — every heading-level element on the public
landing/nav surface. Body copy and `Faq` question/answer text stay on the
existing sans (`--font-sans`, Lato) — matching qkit/loopkit's own
"characterful display face used with restraint, complementary body face"
pairing rather than applying the display face everywhere.

### 2. Ambient background

New per-theme CSS custom properties in `globals.css` (`:root` and `.dark`):
`--gradient-wash-1` and `--gradient-wash-2`, each the theme's `--primary`
hue/chroma at low alpha (light: `oklch(0.46 0.16 255 / 0.06)` and
`oklch(0.46 0.16 255 / 0.04)`; dark: `oklch(0.68 0.13 252 / 0.1)` and
`oklch(0.68 0.13 252 / 0.07)` — dark mode needs a touch more opacity to
register against a dark background, consistent with how both sibling kits
tune their own dark-mode gradient strength separately from light).

Applied to `body` in `@layer base`: two `radial-gradient`s (`ellipse 70% 45%
at 15% -10%` and `ellipse 55% 40% at 100% 0%`, using the wash tokens,
`transparent` after 55-60%) plus `background-attachment: fixed`. No
paper-grain noise texture (that's qkit's kraft-paper identity specifically)
— cleaner, closer to loopkit's brighter treatment, matching stockkit's
precise/financial tone.

### 3. Hero — ledger-card illustration

New component `src/components/landing/ledger-card-preview.tsx`: a static
mock product card (not real data — a marketing illustration, same
non-interactive-mock approach as loopkit's `StampCard`) built on
`ElevatedCard`, showing:
- Product name + a stock-status dot (reusing `--stock-ok`/`--color-stock-ok`
  — this **is** a stock-status indicator, a legitimate use of that reserved
  token, not a decorative reuse)
- On-hand count, large, `font-mono`
- Unit cost, `font-mono`
- A divider, then one recent stock-movement line ("+12 restock · 2h ago")
  in small muted `font-mono`, with a `lucide-react` icon

This is stockkit's answer to "show the product, not just describe it" — the
same principle behind qkit's live order-board carousel and loopkit's stamp
card, expressed through stockkit's own actual product concept (a ledger
entry), not borrowed imagery.

`Hero` becomes a two-column layout at the `lg` breakpoint (headline/subcopy/
CTAs left, `LedgerCardPreview` right — mirroring how both siblings pair
hero copy with a visual), stacking centered on mobile as it does today. A
small trust-strip chip row ("Free to use · No setup fee · Own your data")
sits under the subcopy, styled with `--primary`/`--muted` only (no
stock-status colors used decoratively there).

### 4. HowItWorks & Benefits — icons, numbering, lifted cards

`HowItWorks`: replace the plain `Step {i+1}` label with `01/02/03` in
`font-mono font-semibold text-primary` + a `h-px flex-1 bg-border` rule +
one `lucide-react` icon per step (package/add, arrow-left-right/log,
trending-up/watch — exact icon choice at implementation time). Numbering is
justified here specifically because the three steps are a real sequence.

`Benefits`: add one `lucide-react` icon per item (no numbering — these
aren't sequential, so no `01/02/03` here, per the same justification
principle in reverse).

Both: swap the current `rounded-2xl border p-6` card for `ElevatedCard`'s
lifted-shadow treatment, plus a `fade-rise` entrance animation and a
`hover:-translate-y-1` micro-lift on hover, transition-eased.

### 5. Navbar — sticky translucent bar

Replace the current floating rounded-pill (`fixed inset-x-0 top-0 z-50
mx-auto pt-6` wrapping a `rounded-2xl border shadow-lg`) with a full-width
sticky bar: `sticky top-0 z-50 border-b bg-background/80 backdrop-blur`,
matching loopkit's exact pattern (qkit's is plain/non-sticky; loopkit's
sticky-translucent-bar is the better fit once the page has an ambient
gradient behind it — a floating detached pill would otherwise sit oddly on
top of the new background). Wordmark gets `.font-display`. Auth-aware CTA
logic (`authed` prop, Sign in/Get started vs. Dashboard) is unchanged.

### 6. Motion

`fade-rise` keyframe added to `globals.css` (opacity 0→1 + `translateY(8px)`
→ `0`, `0.4s ease-out`), wrapped in a `prefers-reduced-motion: reduce` media
query that disables it. Applied to: Hero content on mount, HowItWorks/
Benefits cards, `LedgerCardPreview`. Deliberately no scroll-triggered
JS/IntersectionObserver — mount-triggered CSS animation only, keeping this
restrained (per the `frontend-design` skill's caution that scattered/
elaborate animation reads as templated) rather than adding a new
scroll-reveal dependency for a first pass.

## Non-goals

- No color palette changes (finalized in #1).
- No landing copy rewrites — only markup/structure changes to existing
  copy (icons, numbering, layout).
- No changes to login, reset-password, or `/auth/callback` (already done).
- No scroll-triggered animation library — mount-only `fade-rise`.
- No changes to RLS, data model, or `stock_movements`.
- `templatecentral:add`'s generic feature-module scaffolding
  (`src/features/<name>/`, React Query, `/api/*` services) does not apply —
  `AGENTS.md` explicitly diverges from that pattern for this project
  (Server Components + Server Actions only). New components stay in
  `src/components/landing/` and `src/components/layout/`, consistent with
  the scaffolding guide's own "Standalone Components" placement table.
