# Store sitemap

Production builds fetch active store names through the public Supabase REST endpoint, with existing public RLS and the publishable key. No admin credentials or database migrations are needed.

The sitemap preserves all existing static/blog URLs and appends the same encoded name routes used by the visitor UI. Hidden stores, blank names and duplicates are excluded. Pagination handles catalogs beyond 1000 stores.

Both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be present in the build environment. With neither setting, demo/CI builds retain the static sitemap. A partial configuration, API failure or malformed response fails the build instead of silently deploying a truncated sitemap.

This is a build-time snapshot. Publishing, hiding or renaming a store requires a redeploy to update the XML. Store pages continue using the existing SPA routes; this change does not prerender individual stores.

After deployment:
- Open /sitemap.xml and verify active iHerb/noon URLs, with hidden stores absent.
- Resubmit the same sitemap URL in Search Console and inspect its discovered-page count.
- Name changes keep the existing routing behavior; stable slugs and redirects remain a separate follow-up.
