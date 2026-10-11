# SEO audit and implementation

## Audit

The main branch used a Vite SPA with client-only store metadata, no initial store content, no sitemap, a universal HTTP 200 fallback, store-name URLs, and no articles table or public article routes. Store keyword planning, descriptions, FAQ parsing, an authenticated administrator flow, F37 Sonic Arabic and approved brand assets already existed. No AI provider, credential or supported generation API existed. The linked conversation exposes the mobile/desktop requirement and font decision; its SEO assistant messages are unavailable reference placeholders, so the implementation follows the current explicit task and existing editorial fields.

## Delivered

- The production Express/Vercel handler renders the same React components and public catalog into initial HTML for every device. The browser starts from that public snapshot. Mobile layouts keep store guides and FAQ content in the DOM; no separate mobile URLs or device-specific descriptions.
- Store, coupon and article titles/descriptions use reviewed overrides with natural defaults. Canonical URLs use https://coponya.com, excluding query parameters. Store and article historic routes redirect 301; duplicate reserved routes are rejected by the database. Missing pages return HTTP 404 plus noindex. Unconfigured/demo mode is noindex and emits an empty sitemap.
- Store WebPage/BreadcrumbList and visible FAQ schema; coupon WebPage schema (no fabricated product price, rating or Offer); published Article schema. Editorial keywords stay in the manager, not hidden page text or meta-keyword stuffing.
- `/sitemap.xml` paginates anonymous catalog reads and includes active stores, published/unexpired coupons, published articles and canonical public navigation. `/robots.txt` references it and allows crawling assets and noindex pages. Private/form routes are noindex. Public data outages return 503, not indexable empty successful responses.
- Admin store fields retain editable SEO titles, descriptions, keywords and content; add slug editing. Coupon editor adds SEO title/description. SEO Manager adds article CRUD (create/update), editorial keywords, descriptions, body, slug, publication control, related-store links and search preview. Historical route fields and timestamps are excluded from editor submissions.
- AI control is disabled and explicitly says no provider is connected. Existing store template suggestions remain clearly editorial templates. A future provider must run server-side behind admin authentication; suggested texts must be reviewed, never auto-published.
- Existing font, assets and CSS are preserved. Regular font preload, high-priority hero, lazy secondary illustration, asynchronous image decode, explicit store-logo image dimensions, immutable hashed-asset cache, a 60-second public data cache, separate admin chunk and server-rendered initial content improve loading foundations. No measured production Core Web Vitals claim.

## Rollout (not applied to production)

1. Apply `database/schema.sql` only for a fresh backend; existing installations retain their tables and RLS. Ensure existing profile/logo and `database/store-seo.sql` updates are installed.
2. Review and run `database/seo-manager.sql` once in the intended Supabase environment. It adds fields and the articles table with explicit grants, RLS, administrator authorization and route-history triggers. This is a SQL rollout script, not a Supabase migration-history entry: the available CLI binary could not execute in this environment. Keep it in the site's existing SQL-script workflow.
3. Set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the build and Vercel function runtime. Only a public/publishable key is used; do not use service-role credentials. Ensure Data API exposure for articles.
4. Deploy the reviewed branch/PR. Vercel rewrites public routes to `api/index.ts`, bundles the SSR artifact from `dist/ssr`, and serves assets directly. Static-only hosting or `vite preview` cannot provide dynamic SEO; use `pnpm start` or the Vercel function.
5. Verify authenticated save/reload for a store, coupon and article in staging; check hidden-store/draft exclusion, old-slug redirects, mobile layout, source HTML, sitemap and Search Console. Runtime errors before applying SQL will return 503; apply database changes before frontend rollout.

## Verification

- Type check, 17 unit tests and client/server production build.
- `pnpm verify:seo` after build runs the actual Express handler against a public REST fixture: initial content and metadata, schema, identical mobile/desktop HTML, safe text/JSON escaping, canonical 301s, 404/noindex, sitemap and robots.
- SQL executed against temporary PGlite/Postgres with an auth.uid test shim: schema validity, administrator writes, published-only anonymous reads, anonymous/non-admin write rejection, historical slug capture and duplicate historic route rejection. This does not verify the real Supabase deployment or production administrator session.
- Browser checks of store list/detail at 320, 375, 390, 768 and 1280px: no horizontal overflow, identical store-guide text, F37 Sonic Arabic retained. Authenticated admin persistence and live database checks still require the intended configured environment.

Future AI contract: a server-only `POST /api/seo/suggestions` may accept entity type, existing title/description/body and locale; validate the admin session, enforce rate/size limits and call an explicitly configured supported provider. Return editable suggestions, preserve existing editor input, and disclose failures. No such endpoint is implemented or advertised as working here.

References used during implementation: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Supabase Data API grants and RLS](https://supabase.com/docs/guides/api/securing-your-api), and [Supabase changelog](https://supabase.com/changelog) (Data API exposure change reviewed).
