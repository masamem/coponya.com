# Coponya public experience audit — 12 October 2026

## Reference inventory and implementation gaps

Coponsa was inspected as a functional reference only. No source code, wording, logos, coupon data or imagery was imported. Browser inspection covered desktop and mobile presentation; public page extraction provided additional detail. These are observations, not assertions that every reference feature works.

| Area | Reference observation | Coponya baseline | Result / remaining gap |
| --- | --- | --- | --- |
| Homepage | Promotional carousel, popular stores, coupons, offers, articles, categories, newsletter | Original hero, store rail, coupons, categories, demo offers, local notification preferences | Added original guide cards; retained brand and existing homepage |
| Store directory | Search, totals, popular stores | Searchable store cards with real coupon counts | Added directory totals and Arabic name / coupon-count sorting |
| Store detail | Coupon filters, merchant link, long guide, similar stores, rating form | Merchant logo, coupons, guide, FAQ, related stores, editable SEO fields | Retained; public ratings remain absent |
| Coupons | Reveal / copy, details, verification labels, category filters | Copy, affiliate navigation, terms modal, filters, saved favorites | Retained unchanged; no invented usage or verification statistics |
| Categories | Category directory and coupon listings | Category directory and detail routes | Retained |
| Offers | Product / shipping offers, price comparison and outbound links | Demo deal cards; live catalog intentionally has no deal records | Live standalone offers and their administration remain unimplemented |
| Articles | Article index, detail pages, pagination | No editorial routes | Added index, three original full guides, contents links, related guides; source-managed rather than an admin CMS |
| Search | Header merchant search and store-page search | Homepage coupon/store matches plus separate directory search | Added dedicated combined search over stores, coupons, categories and guides; URL query, live results and empty state |
| Navigation | Shared header, mobile navigation and footer links | RTL header, mobile menu, bottom navigation, social/help/legal footer | Added guide and search entry points |
| Footer / newsletter | Newsletter form, company/legal and category links | Coponya socials, legal/help links, local preference UI | Newsletter email delivery remains unconnected; existing behavior preserved |
| SEO | Extractable public headings/content, store guides and blog detail text | Client-rendered metadata and editable store SEO | Added 9 build-generated public HTML pages, full static article text, canonical URLs, article schema, sitemap, robots and Twitter metadata |
| Mobile / desktop | Responsive reference layout and carousels; mobile reference screenshot showed unusually narrow content | Mobile-first RTL layouts and F37 Sonic Arabic | Original responsive guide grid and search; tested 320, 390, 768 and 1440 px |
| Administration | Public reference does not expose admin | Existing authentication, stores, coupons, logos, SEO editing and review state | Backend and admin code untouched; no live writes made during testing |

Reference pages: [homepage](https://www.coponsa.com/), [stores](https://www.coponsa.com/store), [categories](https://www.coponsa.com/coupon-categories), [offers](https://www.coponsa.com/deals), [blog](https://www.coponsa.com/blog), [store example](https://www.coponsa.com/store/%D9%83%D9%88%D8%AF-%D9%86%D9%88%D9%86-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9).

## Brand and preservation

The existing green/orange palette, brand SVGs, favicon files, F37 Sonic Arabic font files and RTL shell are preserved. Existing working copies were not edited. Work started from the current remote repository in a separate checkout. Search reuses the existing catalog context, coupon actions and favorites. No database migration, authentication change or production data write was performed.

## SEO limits and next work

Generated HTML contains the complete original guide text. Directory and coupon HTML has a descriptive heading and navigation; live records still load in the browser. Live store detail pages and their sitemap entries need server rendering or a build-time catalog snapshot. The sitemap intentionally excludes demo stores and private/search pages. Regenerate static pages when editing guide content; add matching Vercel mappings when adding article slugs. Canonical origin is https://coponya.com and should be verified against the production domain configuration before release.

Full reference feature parity is not claimed. Remaining work includes a live offers data model/admin editor, article CMS if desired, real newsletter delivery, persisted public ratings, live store sitemap/rendering, and operational legal/contact details. Existing support forms prepare messages rather than sending them. Those integrations need service/configuration choices and production testing.

## Verification and deployment

TypeScript passed; production client/server build passed; 15 existing tests passed. Browser checks covered homepage, stores, coupons, categories, deals, blog, search and store detail at 320/768/1440 px: one H1 and no horizontal overflow on every checked route. At 390 px, guide/index, article and unified search were inspected visually; matching and empty search states passed. Checks used the demo catalog because no production configuration was copied into the checkout. Authenticated admin operations and production backend integration were not exercised.

Production deployment: **not performed**. Changes are intended for a review branch; merging or deployment still requires release review. A preview deployment may be created automatically by the repository hosting integration when a branch is pushed.
