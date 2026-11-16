# Coponya coupons

Arabic, RTL coupon discovery website. Keeps the original olive and apricot visual design and completes store/category browsing, coupon search and sorting, coupon details with accessible dialogs, clipboard copying, saved favorites, account preferences, help and informational pages.

## Run and build

Requires Node.js 22 or later and pnpm 10 (the version in `package.json`).

```sh
pnpm install
pnpm dev      # next dev
pnpm check    # tsc --noEmit
pnpm test     # vitest
pnpm build    # next build
```

## How pages are rendered

The site runs on Next.js (App Router) on Vercel. Every public URL is rendered on the server with the live catalog, so search engines receive the full page (store details, coupon list, links between pages), not an empty shell:

- `app/[[...path]]/page.tsx` loads the catalog from Supabase (`client/src/lib/serverCatalog.ts`), decides the title, description, canonical URL, robots rule and JSON-LD for the path (`client/src/lib/routeMetadata.ts`), and renders the existing React app (`client/src/App.tsx`) for that path. The browser then hydrates it and in-app navigation works as before (wouter).
- Pages are cached and refreshed every 5 minutes (ISR). Public routes and all active store pages are built at deploy time; other paths render on first visit.
- Legacy store links (`/stores/<full name>`) answer with a permanent redirect; unknown stores, articles and routes answer 404.
- `app/sitemap.ts` lists the public pages and every active store; `app/robots.ts` keeps admin and personal pages out of crawling.
- The public Supabase and tracking settings keep their `VITE_*` names; `next.config.ts` passes them to the browser bundle.

## Current data and services

- `client/src/lib/data.ts` is the sample catalog. Every coupon is illustrative, clearly marked in the interface. Replace it with verified merchant data before launch; supply dates, terms, exclusions and destination URLs before offering real redemption.
- Favorites and the optional display name are stored on the current device with local storage. This is not server authentication or cross-device sync.
- Contact and report forms generate a message for copying. They do not send email or create support tickets. A service and actual recipient are needed for delivery.
- Privacy and terms pages describe the demo behavior and must be finalized with operator details for launch.
- The homepage uses the project's original external illustrations and Google Fonts. Host licensed assets locally if desired.
- Production deployment uses the Vercel `coponya` project linked to `masamem/coponya.com` on GitHub. The product name is Coponya — كوبونيا.
