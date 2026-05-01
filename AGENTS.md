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

The client (Accel Event Rentals) is undecided between two strategic directions for this marketing site. We're building both as separate Git branches off `master` and using Vercel's automatic per-branch preview URLs to evaluate side-by-side.

### Branches
- **`master`** — current state. Internal `/rentals/[slug]` product pages, internal `/search`, global cart drawer, "Submit Quote (Disabled — Test Mode)" button. Untouched while comparison is in progress.
- **`link-to-shop`** (Phase A — built first) — pure marketing brochure that hands every commerce action to the existing storefront at `https://shop.accelrentals.com` (Rent Ant platform). Deletes the cart layer, internal /rentals routes, and internal /search. Adds permanent redirects in `next.config.ts` for SEO. Centralized in `src/lib/site-config.ts` via `SITE.shopUrl` + `shopCategoryUrl(slug?)` helper.
- **`homemade-quote-flow`** (Phase B — deferred) — homemade quote-request flow built into our site. No payment, staff approves manually, eventually pushes confirmed bookings to Current RMS via the existing API key once `RMS_WRITE_ENABLED=true`. Stays in **TEST MODE**. Uses the client's existing email service. Branch will be cut from `master` (NOT from `link-to-shop`) only after Phase A is reviewed and the client explicitly asks for it.

### Decisions captured (do not relitigate without checking with the user)
- **No Supabase, no Stripe.** Client doesn't want either.
- **Quote workflow only** — no online payment ever. Staff reviews submissions and reaches out.
- **Guest-first.** No accounts UI in either phase.
- **Current RMS is read-only today** (enforced by comment in `src/lib/current-rms.ts`). Only Phase B Step 2 flips this, behind `RMS_WRITE_ENABLED` flag, with a `RMS_WRITE_DRY_RUN` mode for staff testing.
- **Shop deep-linking**: `shop.accelrentals.com` uses `/categories/{numericId}/{Name}` URLs, but we don't have the slug→ID mapping AND those deep pages currently get stuck on "Searching...". For now `shopCategoryUrl(slug)` ignores the slug and returns the `/categories` hub. The slug param is the upgrade seam for the future deep-link change (single function-body edit).
- **All shop links open in a new tab** (`target="_blank" rel="noopener noreferrer"`).

### How the comparison works
1. Phase A `link-to-shop` pushed to GitHub → Vercel emits preview URL #1.
2. Send URL #1 to the client.
3. If client says "this is enough" → PR `link-to-shop → master`, merge, done.
4. If client says "I want our own quote flow too" → enter plan mode for Phase B, cut `homemade-quote-flow` from `master`, push, get URL #2.
5. `master` stays unchanged through evaluation. Either branch can be discarded cheaply.

### Plan file
The detailed plan with file-by-file changes lives at `~/.claude/plans/what-color-orange-are-refactored-boole.md`.

@docs/research/INSPECTION_GUIDE.md
