# Accel Event Rentals — Website

Marketing + product-discovery site for [Accel Event Rentals](https://accelrentals.com) (Oahu & Maui). Pulls the live product catalog from Current RMS, surfaces it under `/rentals`, and routes inquiries through a contact form and newsletter signup.

## Tech stack

- **Framework**: Next.js 16 (App Router) + React 19, TypeScript strict
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Hosting**: Vercel (project `accelwebsiteredo`)
- **Catalog data**: Current RMS REST API (read-only)
- **Reviews**: Google Places API (New)
- **Newsletter**: Mailchimp
- **Live chat**: HeyGabby widget (loaded site-wide in `app/layout.tsx`)
- **Node**: ≥ 24

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the keys you need (see below)
npm run dev                  # http://localhost:3000
```

The site renders with placeholders if external API keys are missing — you can develop most of the UI without any credentials.

## Environment variables

All vars live in `.env.local` for development and in the Vercel project for preview/production. See `.env.example` for the full list.

| Variable | Purpose | Required for |
|---|---|---|
| `CURRENT_RMS_SUBDOMAIN` | Current RMS account subdomain | Live product catalog (`/rentals`, `/search`, header mega-menu) |
| `CURRENT_RMS_API_KEY` | Current RMS API token (read-only scope) | Same as above |
| `GOOGLE_PLACES_API_KEY` | Google Places (New) API key | Live reviews in Welcome section |
| `GOOGLE_PLACE_ID` | Place ID for Accel's Honolulu listing | Same as above |
| `MAILCHIMP_API_KEY` | Mailchimp API key (`<hex>-<dc>` format) | Newsletter signup |
| `MAILCHIMP_LIST_ID` | Audience/list ID | Newsletter signup |
| `MAILCHIMP_DC` | Mailchimp data-center suffix (e.g. `us14`) | Newsletter signup |

If Mailchimp vars are unset, `/api/newsletter` returns 503 and the form shows a friendly fallback. If Current RMS vars are unset during build, pages render with empty product grids rather than failing.

## Scripts

```bash
npm run dev           # next dev (http://localhost:3000)
npm run build         # production build (output: standalone)
npm run start         # serve the production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run check         # lint + typecheck + build
npm run sync-products # one-time: download/refresh local product image manifest
```

## Project structure

```
src/
  app/                     # App Router routes
    api/
      availability/        # GET availability windows from Current RMS
      catalog/             # GET full product catalog (24h ISR)
      newsletter/          # POST newsletter signup → Mailchimp
    rentals/[slug]/        # Category landing pages
    search/                # Site-wide product search
    about/  contact/  gallery/
    layout.tsx  page.tsx  globals.css
    sitemap.ts  robots.ts
  components/
    ui/                    # shadcn/ui primitives
    Header.tsx Footer.tsx
    HeroCarousel.tsx WelcomeSection.tsx ...   # homepage sections
    CategoryProductGrid.tsx CartDrawer.tsx
    NewsletterForm.tsx
    icons.tsx              # extracted SVG icons
  lib/
    site-config.ts         # SITE constant — phone, email, locations, socials
    current-rms.ts         # Current RMS API client + types
    category-map.ts        # Slug ↔ Current RMS product group ID mapping
    google-reviews.ts      # Google Places API client
    cart-context.tsx       # Cart provider (client-side)
    utils.ts               # cn() helper
  hooks/  types/
public/
  images/  videos/  seo/   # downloaded assets, favicons, OG images
scripts/
  download-product-images.mjs           # mirror Current RMS images locally
  inspect-current-rms-opportunity.mjs   # read-only probe — dump live opportunity/member shapes
docs/
  current-rms-opportunity-schema.md     # reference for building the homemade quote flow
```

## Routes

| Path | Purpose |
|---|---|
| `/` | Homepage (hero, featured events, design centers, on-trend, reviews, social, newsletter) |
| `/rentals/[slug]` | Category page — `tents`, `chairs`, `tables`, `bars`, `tabletop`, `catering`, `decor`, `linens`, `lounge`, `lighting` |
| `/search?q=…` | Cross-category product search by name/category/description |
| `/gallery` | Photo gallery |
| `/about` | About page |
| `/contact` | Contact form + locations |
| `/api/catalog` | Full product catalog (cached 24h) |
| `/api/availability` | Per-product availability windows |
| `/api/newsletter` | Mailchimp signup endpoint |

## Key conventions

- **All site-wide config (phone, email, addresses, socials) lives in `src/lib/site-config.ts`.** Don't hardcode contact info in components — import `SITE`.
- **Brand orange is `#ff6c0e`.** Used in the floating header pill, headings, primary CTAs.
- **Cart is client-side only** — `CartContext` collects items and the "Submit Quote" button is currently in TEST MODE (disabled). No payment integration is planned; the eventual flow is a quote-request handed to staff.
- **Current RMS is read-only.** Enforced by comment in `src/lib/current-rms.ts`. No write operations should be added without explicit project sign-off.
- **Images from Current RMS** are allowlisted in `next.config.ts` under `current-rms.s3.amazonaws.com`. Mirrored locally via `npm run sync-products` to avoid expired signed URLs.
- **Security headers** (HSTS, X-Frame-Options, Permissions-Policy, etc.) are applied to all routes via `next.config.ts → headers()`.

## Branch strategy

The client is evaluating two strategic directions side-by-side using Vercel preview URLs:

- **`master`** (this branch) — full internal experience: `/rentals/[slug]` product pages, internal `/search`, global cart drawer, "Submit Quote (TEST MODE)" CTA. Stays untouched while comparison is in progress.
- **`link-to-shop`** — pure marketing brochure that hands all commerce off to the existing storefront at `https://shop.accelrentals.com` (Rent Ant). Internal `/rentals` and `/search` redirect out via `next.config.ts`.
- **`homemade-quote-flow`** *(not yet cut)* — homemade quote request flow, no payment, staff approves manually. Will be branched from `master` only if the client asks for it after reviewing `link-to-shop`.

Each branch gets its own Vercel preview URL automatically. Do not merge `link-to-shop` into `master` until the client has chosen a direction.

## Deployment

- **Vercel project**: `accelwebsiteredo` (team `wyatt-hamiltons-projects`)
- **Production domain**: TBD — currently `https://accel-website-template-zeta.vercel.app`. Update `SITE.url` in `src/lib/site-config.ts` and the Vercel project domains together when DNS is cut over.
- **Preview deploys**: every push to any branch.
- **Build command**: `npm run build` (Next.js standalone output).

## Handoff notes

- The two-branch comparison determines which direction the codebase converges to. After the client picks one, the other branch should be deleted.
- `SITE.url` and the Vercel domain must be updated together when production DNS is ready.
- TEST MODE on the cart's "Submit Quote" button is intentional — see `CartDrawer.tsx`. Do not enable until the quote backend is built (Phase B / `homemade-quote-flow` branch).

## License

Internal client work. All rights reserved.
