# Store sitemap

Production builds fetch active store names through the public Supabase REST endpoint, with existing public RLS and the publishable key. No admin credentials or database migrations are needed.

The sitemap preserves all existing static/blog URLs and appends the short store URLs used by the visitor UI (`storePath` in `client/src/lib/storeSlug.ts`, e.g. `/stores/noon`). Hidden stores, blank names and duplicates are excluded. Pagination handles catalogs beyond 1000 stores.

Both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be present in the build environment. With neither setting, demo/CI builds retain the static sitemap. A partial configuration, API failure or malformed response fails the build instead of silently deploying a truncated sitemap.

This is a build-time snapshot. Publishing, hiding or renaming a store requires a redeploy to update the XML.

## Store page HTML

`vercel.json` rewrites `/stores/:slug` to `api/store-page.ts`, which returns the app shell with the store's own title, description, canonical URL, Open Graph tags, breadcrumb/FAQ structured data and readable coupon list (codes are never included). It reads live data on each request (CDN-cached for 5 minutes), so new stores work without a redeploy. Legacy `/stores/<full encoded name>` links return a 301 to the short URL; unknown stores return 404 with `noindex`. Without the Supabase settings (e.g. preview builds) it serves the plain app shell.

After deployment:
- Open /sitemap.xml and verify active iHerb/noon URLs, with hidden stores absent.
- Resubmit the same sitemap URL in Search Console and inspect its discovered-page count.
- Open /stores/noon and view the page source: the title, canonical and H1 must be noon's, not the homepage's.
- Renaming a store changes its slug; the old slug then returns 404. Keep the English prefix ("noon - نون") stable when editing names.
