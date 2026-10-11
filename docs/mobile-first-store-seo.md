# Mobile-first store SEO

## Current architecture and changes

The site is a Vite/React SPA. Home owns routing through wouter; CatalogPage handles store/category/coupon routes. CatalogProvider loads active stores and published, non-expired coupons through Supabase REST, or demo content without configuration. Admin uses the existing authenticated REST flow and store RLS policies.

This change adds small-screen filter grids, two-column store browsing, full-width store actions, 44–48px targets, readable form inputs, safe-area spacing, and scrollable coupon dialogs. Existing desktop layouts remain available.

## Deployment order

1. Apply the existing schema/profile/logo setup if not already installed.
2. Run `database/store-seo.sql` in the project's SQL editor before deploying the frontend. It adds columns; it does not change RLS or existing values.
3. Run the verification query at the end of that file. Confirm public users can read active stores and only admins can update them using the existing policies.
4. Deploy the reviewed PR, edit a store and save SEO fields; reload the public store page to verify persistence.

The migration is prepared in this PR, not applied to production. Saving stores with the new frontend requires these columns.

## Editorial workflow

Each store has a primary keyword, supporting terms, long-tail phrases, SEO title, meta description and article ideas. Use one phrase per line in planning fields. The suggestion button fills empty fields only, including neutral store description and FAQ templates. Suggestions are starting points, not keyword-volume research or verified store policies. Review them before publishing. Existing shipping/payment/returns fields should contain sourced facts.

Keyword planning fields and article ideas are not displayed as keyword stuffing or automatic articles. Title and description fall back for old stores; the search preview shows the effective values. The public FAQ and JSON-LD use the same parser, excluding incomplete entries. FAQ markup does not guarantee a rich result.

Canonical URLs retain existing store-name routes. Metadata, Open Graph, WebPage/BreadcrumbList and visible FAQ JSON-LD update after live data loads. Navigating away removes the store schema. Admin and personal/form routes use noindex; demo store pages also use noindex.

## Production SEO extension

See [SEO Manager implementation](seo-manager-implementation.md) for server rendering, stable routes and historical redirects, coupon/article SEO, dynamic sitemap, robots, rollout requirements and verification. The earlier client-only limitation is addressed by the production server/function; Vite dev/preview remains a client development shell.

## Review checks

- At 320, 375, 390 and 768px, check home, stores, a store page, coupons, modal, and admin editor for horizontal overflow and bottom-navigation overlap.
- Use keyboard navigation, FAQ expansion and store anchor links; verify dialog scrolling with long terms.
- In an authenticated staging admin session, fill suggestions twice, confirm existing text is preserved, save/reload and check public metadata and FAQ schema.
- Visit store → coupons → home → admin and verify canonical, robots and schema do not retain the previous store.
- Type checks, existing tests, SEO unit tests and production build are required before deployment. Database persistence and authenticated mobile admin checks require a configured staging backend.
