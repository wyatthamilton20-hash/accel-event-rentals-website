# Accel Event Rentals — Website

Marketing + product-discovery site for [Accel Event Rentals](https://accelrentals.com) (Oahu). Pulls the live product catalog from Current RMS, surfaces it under `/rentals`, and routes inquiries through a rental inquiry form on the homepage and contact page.

## Tech stack

- **Framework**: Next.js 16 (App Router) + React 19, TypeScript strict
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Hosting**: Vercel (project `accelwebsiteredo`)
- **Catalog data**: Current RMS REST API (read-only)
- **Reviews**: Google Places API (New)
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
| `CURRENT_RMS_API_KEY` | Current RMS API token. **Read scope** for catalog. **Write scope** also required for `/api/rental-inquiry` (creates Member + Opportunity records). | Live product catalog + rental inquiry form |
| `GOOGLE_PLACES_API_KEY` | Google Places (New) API key | Live reviews in Welcome section |
| `GOOGLE_PLACE_ID` | Place ID for Accel's Honolulu listing | Same as above |
| `RENTAL_INQUIRY_DRY_RUN` | Set to `1` to bypass Current RMS writes — the form validates and the route logs the constructed payload, but no records are created. Use locally / on previews. Leave unset in production. | Local dev / staging without polluting RMS |

If Current RMS vars are unset, `/api/rental-inquiry` returns 503 and the form shows a friendly "we can't take inquiries online right now" message. If Current RMS vars are unset during build, pages render with empty product grids rather than failing.

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
      rental-inquiry/      # POST contact form → Current RMS Org+Contact+Opportunity
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
    icons.tsx              # extracted SVG icons
  lib/
    site-config.ts         # SITE constant — phone, email, locations, socials
    current-rms.ts         # Current RMS API client + types
    category-map.ts        # Slug ↔ Current RMS group IDs + shop storefront deep-link mapping
    google-reviews.ts      # Google Places API client
    cart-context.tsx       # Cart provider (client-side)
    utils.ts               # cn() helper
  hooks/  types/
public/
  images/  videos/  seo/   # downloaded assets, favicons, OG images
scripts/
  download-product-images.mjs  # mirror Current RMS images locally
```

## Routes

| Path | Purpose |
|---|---|
| `/` | Homepage (hero, browse rentals, welcome, inspiration, social, rental inquiry form) |
| `/rentals/[slug]` | Category page — `tents`, `chairs`, `tables`, `flooring`, `bar`, `lounge`, `lighting`, `linens`, `decor`, `catering`, `plateware`, `glassware`, `flatware`, `chargers`, `bar-fronts`. On `link-to-shop`, this 308-redirects to the shop's category index (see `next.config.ts`). |
| `/search?q=…` | Cross-category product search by name/category/description |
| `/gallery` | Photo gallery |
| `/about` | About page |
| `/contact` | Contact form + locations |
| `/resources` | Resources hub — tile grid linking to planning guides |
| `/resources/faqs` | Frequently asked questions (delivery, deposits, setup, cancellations, etc.) |
| `/resources/tent-guide` | Tent sizing chart, tent styles, and site/permit/power planning |
| `/resources/will-call-delivery-setup` | The three fulfillment options — pickup, delivery, and setup/breakdown |
| `/resources/linen-draping` | Drop-length reference (lap/mid/floor/puddle) for round, rectangular, cocktail tables |
| `/resources/linen-sizing` | Cheat sheet pairing each table size with the right linen size |
| `/resources/table-seating` | Comfortable and max guest counts per table, plus spacing tips |
| `/api/catalog` | Full product catalog (cached 24h) |
| `/api/availability` | Per-product availability windows |
| `/api/rental-inquiry` | Rental inquiry form submission. Creates Organisation + Contact + Opportunity in Current RMS. Honeypot, min-time, and per-IP rate-limited. |

## Key conventions

- **All site-wide config (phone, email, addresses, socials) lives in `src/lib/site-config.ts`.** Don't hardcode contact info in components — import `SITE`.
- **Brand orange is `#ff6c0e`.** Used in the floating header pill, headings, primary CTAs.
- **Cart is client-side only** — `CartContext` collects items and the "Submit Quote" button is currently in TEST MODE (disabled). No payment integration is planned; the eventual flow is a quote-request handed to staff.
- **Current RMS reads and writes are separated.** `src/lib/current-rms.ts` is read-only by contract (enforced by file-header comment); `src/lib/current-rms-write.ts` holds the rental-inquiry write helpers. Don't add writes to the read-only file.
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
