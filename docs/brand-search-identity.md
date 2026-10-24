# Search identity rollout

Use **كوبونيا** as the Arabic name and **Coponya** as the English name. The owner confirmed TikTok **@coponya**; the **@couponnia** account shown in the recording is not an official profile for this change. Do not rename or edit that account.

Homepage title/description, the visible introduction and footer identify the same service. Static page generation and React metadata share siteBrand. Home includes WebSite and Organization data in initial HTML and after React updates. Other routes retain their own page/store/article schemas; homepage identity data is removed when navigating away. Keywords do not promise verified or guaranteed discounts.

The favorites promotion is marked data-nosnippet so its utility text is not used as the primary search pitch. Google still chooses search result snippets and generated answers; these changes cannot directly edit its answer or force an immediate update.

After deploying the reviewed change:
1. Inspect https://coponya.com/ in Search Console and request indexing.
2. Confirm initial HTML and rendered page have the new title, description, og:site_name and exactly one site-brand-schema.
3. Check home -> store/blog -> home navigation for correct per-page metadata.
4. Allow recrawling; verify the resulting search appearance rather than assuming immediate changes.

References:
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/snippet
