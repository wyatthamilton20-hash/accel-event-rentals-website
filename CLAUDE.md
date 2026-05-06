## Keep README.md in sync

`README.md` is the canonical entry point for the human dev team that will eventually take over this codebase. Keep it accurate as work progresses.

When you change any of the following, update `README.md` in the same commit:
- **Env vars** (added/removed/renamed) → update the env-vars table and `.env.example`.
- **Scripts** in `package.json` → update the Scripts section.
- **Routes** (new page, new API route, removed route, redirect added) → update the Routes table.
- **Tech stack** (framework upgrade, new major dependency, swapped service) → update Tech stack and any relevant section.
- **Project structure** (new top-level dir, moved subsystem) → update the structure tree.
- **Conventions** (new global rule, e.g. brand color change, new "don't do X" guardrail) → update Key conventions.
- **Branch strategy** (branch cut, branch merged, branch deleted, strategy decided) → update Branch strategy.
- **Deployment** (domain change, project rename, build command change) → update Deployment.

Do not update the README for: internal refactors, bug fixes that don't change public behavior, content/copy edits, or styling-only tweaks.

If a change is ambiguous, prefer updating the README — it's cheaper to keep it slightly over-documented than to let it drift.

## Don't reproduce other companies' content

This is a marketing site for Accel Event Rentals. When the user points at another rental company's page (RSVP Party, etc.) and says "copy this":

- **Push back before building.** "Copy" usually means "cover the same topics in our voice," not "reproduce verbatim." Confirm this is the intent before producing any content. Do not strip-and-rebrand competitor imagery (removing a logo from someone else's diagram is not transformation).
- **Use the reference for structure and factual data only.** Section headings, topic coverage, and numeric data (table sizes, square-footage formulas, standard linen drops, capacity counts) are factual and fine to reuse. The prose, layouts, and visuals around them are not.
- **For visual guides, expect the user to supply their own image.** If they ask for a diagram and we don't have one, offer to build an original SVG or wait for them to generate/commission art — don't reach for a competitor's image.

## Accel-grounded policy content

For pages that state company policy — `/resources/faqs`, `/resources/will-call-delivery-setup`, contact info, fees, hours, service tiers — every claim must trace back to one of:

- `src/lib/site-config.ts` (address, phone, email, warehouse hours)
- The mirrored FAQ at `src/app/resources/faqs/page.tsx` (sourced from accelrentals.com/faqs)
- Something the user has stated directly

Do not fabricate industry-typical details ("same-day pickup if your order is small," "standard time windows are a few hours wide," "restocking labor adds a fee") and present them as Accel policy. If the grounded sources don't cover something, either omit it or route the reader to sales with a soft "contact us" line.

## Resource page layout

Pages under `/resources/*` share a layout: site Header, hero section with breadcrumb / orange-period h1 / centered intro paragraph (`max-w-[640px]`), white card articles in a `max-w-[900px]` column with `space-y-12`, dark CTA button at the bottom linking to `/contact` plus a `tel:` link using `SITE.phone`. Match this pattern when adding new resource pages.

Image-only guides (linen draping, linen sizing, table seating) follow a stripped variant: hero → single `<article>` containing one `next/image` at the source PNG's exact `width`/`height` → CTA. Images live under `public/images/resources/<slug>.png`.
