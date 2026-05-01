<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/clone-website/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.

## Current Project Strategy — Two-Branch Comparison

The client (Accel Event Rentals) is undecided between two strategic directions for this marketing site. Both are built as separate Git branches off `master`. Vercel auto-builds a preview URL for each branch, allowing side-by-side review.

### Branches
- **`master`** — productionized baseline. Internal `/rentals/[slug]` pages, internal `/search`, global cart drawer with **disabled** "Submit Quote (Test Mode)" button. Untouched by either phase branch.
- **`link-to-shop`** (Phase A — shipped) — pure marketing brochure that hands every commerce action to `https://shop.accelrentals.com` (Rent Ant). Deletes cart layer + internal /rentals + /search. Adds `next.config.ts` redirects + `SITE.shopUrl` + `shopCategoryUrl(slug?)` helper.
- **`homemade-quote-flow`** (Phase B — shipped) — homemade quote-request flow. Adds `/quote/review`, `/quote/submitted`, `POST /api/quotes`, foundations libs (`lib/test-mode`, `lib/rate-limit`, `lib/idempotency`, `lib/email`, `lib/log`, `lib/quote-types`, `lib/quote-store`), cart hardening (localStorage, idempotency key, hydration boundary), and a stubbed `createOpportunity()` in `lib/current-rms.ts` gated by `RMS_WRITE_ENABLED=true`. Stays in **TEST MODE** by default.

### Decisions captured (do not relitigate without checking with the user)
- **No Supabase, no Stripe.** Client doesn't want either.
- **Quote workflow only** — no online payment ever. Staff reviews submissions and reaches out.
- **Guest-first.** No accounts UI in either phase.
- **No Vercel-specific storage** (no Blob, no KV) — vendor-neutral interfaces only.
- **Email provider deferred.** `ConsoleEmailProvider` (logs to stdout) is the default. Plug in real provider via 1-file change in `lib/email.ts` when client picks one.
- **Current RMS is read-only today** (enforced by comment in `src/lib/current-rms.ts`). Phase B adds a stubbed write behind `RMS_WRITE_ENABLED` flag with `RMS_WRITE_DRY_RUN` mode for staff testing — not active.
- **Shop deep-linking**: `shop.accelrentals.com` uses `/categories/{numericId}/{Name}` URLs but ID mapping isn't available + deep pages currently fail to load. Phase A's `shopCategoryUrl(slug)` ignores slug and returns `/categories` hub. Single-function-body change when ready to upgrade.
- **All shop links open in a new tab** (`target="_blank" rel="noopener noreferrer"`).
- **Spam protection on /api/quotes**: honeypot + per-IP rate limit (5/min) + per-email rate limit (3/hr) + same-origin check. No CAPTCHA in Phase B.

### Phase B env vars (set in Vercel before flipping to live)
- `QUOTE_TEST_MODE` — `true` keeps subjects tagged `[TEST]` and banner visible. `false` only when going live.
- `QUOTE_NOTIFY_EMAILS` — comma-separated staff inboxes (e.g. `sales@accelrentals.com,ops@accelrentals.com`).
- `EMAIL_PROVIDER` — `console` today; will be `resend` / `postmark` / `smtp` once a provider is plugged in.
- `RMS_WRITE_ENABLED` — leave `false` until Phase C.
- `RMS_WRITE_DRY_RUN` — `true` while testing the future RMS write path.

### How the comparison works
1. Both phase branches pushed → 2 Vercel preview URLs.
2. Send both URLs to client.
3. Client picks: A only / B only / hybrid → open PR to `master`, merge winner.
4. `master` stays unchanged through evaluation. Either branch can be discarded cheaply.

### Plan file
The detailed Phase B plan lives at `~/.claude/plans/what-color-orange-are-refactored-boole.md`.

# Website Inspection Guide

## How to Reverse-Engineer Any Website

This guide outlines what to capture when inspecting a target website via Chrome MCP or browser DevTools.

## Phase 1: Visual Audit

### Screenshots to Capture
- [ ] Every distinct page — desktop, tablet, mobile
- [ ] Dark mode variants (if applicable)
- [ ] Light mode variants (if applicable)
- [ ] Key interaction states (hover, active, open menus, modals)
- [ ] Loading/skeleton states
- [ ] Empty states
- [ ] Error states

### Design Tokens to Extract
- [ ] **Colors** — background, text (primary/secondary/muted), accent, border, hover, error, success, warning
- [ ] **Typography** — font family, sizes (h1-h6, body, caption, label), weights, line heights, letter spacing
- [ ] **Spacing** — padding/margin patterns (look for a scale: 4px, 8px, 12px, 16px, 24px, 32px, etc.)
- [ ] **Border radius** — buttons, cards, avatars, inputs
- [ ] **Shadows/elevation** — card shadows, dropdown shadows, modal overlay
- [ ] **Breakpoints** — when does the layout shift? (inspect with DevTools responsive mode)
- [ ] **Icons** — which icon library? custom SVGs? sizes?
- [ ] **Avatars** — sizes, shapes, fallback behavior
- [ ] **Buttons** — all variants (primary, secondary, ghost, icon-only, danger)
- [ ] **Inputs** — text fields, textareas, selects, checkboxes, toggles

## Phase 2: Component Inventory

For each distinct UI component, document:
1. **Name** — what would you call this component?
2. **Structure** — what HTML elements / child components does it contain?
3. **Variants** — does it have different sizes, colors, or states?
4. **States** — default, hover, active, disabled, loading, error, empty
5. **Responsive behavior** — how does it change at different breakpoints?
6. **Interactions** — click, hover, focus, keyboard navigation
7. **Animations** — transitions, entrance/exit animations, micro-interactions

### Common Components to Look For
- Navigation (top bar, sidebar, bottom bar)
- Cards / list items
- Buttons and links
- Forms and inputs
- Modals and dialogs
- Dropdowns and menus
- Tabs and segmented controls
- Avatars and user badges
- Loading skeletons
- Toast notifications
- Tooltips and popovers

## Phase 3: Layout Architecture

- [ ] **Grid system** — CSS Grid? Flexbox? Fixed widths?
- [ ] **Column layout** — how many columns at each breakpoint?
- [ ] **Max-width** — main content area max-width
- [ ] **Sticky elements** — header, sidebar, floating buttons
- [ ] **Z-index layers** — navigation, modals, tooltips, overlays
- [ ] **Scroll behavior** — infinite scroll, pagination, virtual scrolling

## Phase 4: Technical Stack Analysis

- [ ] **Framework** — React? Vue? Angular? Check `__NEXT_DATA__`, `__NUXT__`, `ng-version`
- [ ] **CSS approach** — Tailwind (utility classes), CSS Modules, Styled Components, Emotion, vanilla CSS
- [ ] **State management** — Redux (check DevTools), React Query, Zustand, Pinia
- [ ] **API patterns** — REST, GraphQL (check network tab for `/graphql` requests)
- [ ] **Font loading** — Google Fonts, self-hosted, system fonts
- [ ] **Image strategy** — CDN, lazy loading, srcset, WebP/AVIF
- [ ] **Animation library** — Framer Motion, GSAP, CSS transitions only

## Phase 5: Documentation Output

After inspection, create these files in `docs/research/`:
1. `DESIGN_TOKENS.md` — All extracted colors, typography, spacing
2. `COMPONENT_INVENTORY.md` — Every component with structure notes
3. `LAYOUT_ARCHITECTURE.md` — Page layouts, grid system, responsive behavior
4. `INTERACTION_PATTERNS.md` — Animations, transitions, hover states
5. `TECH_STACK_ANALYSIS.md` — What the site uses and our chosen equivalents
