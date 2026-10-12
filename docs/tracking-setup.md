# Analytics and advertising setup

Prepared integrations: Google Analytics 4, Google Ads base tag, and Meta Pixel (one pixel can measure Facebook and Instagram campaigns). No account identifiers have been supplied, so these integrations remain disabled. Vercel's existing cookie-free visitor analytics stays enabled separately.

When accounts are ready, add the public IDs to the hosting project's environment settings:

- `VITE_GA_MEASUREMENT_ID`: your actual `G-...` measurement ID.
- `VITE_GOOGLE_ADS_ID`: your actual `AW-...` tag ID.
- `VITE_META_PIXEL_ID`: your actual numeric Meta pixel ID.

Rebuild/redeploy after adding IDs. These are browser-visible identifiers, not passwords or secret access tokens. Do not add Meta Conversions API tokens to VITE variables.

The visitor can accept all, reject optional tools, or independently select analytics and marketing. Google and Meta scripts are requested only after the corresponding permission and only when a valid ID exists. Consent preferences are stored locally for 180 days. Withdrawing permission reloads the page to stop already loaded tools and removes known first-party Google/Meta cookies accessible to this origin; third-party cookies cannot be deleted by this site. Other tabs reload when the saved preference changes.

Google uses basic consent mode with four denied defaults before any measurement configuration. GA receives public page views only after analytics consent; Meta receives public page views only after marketing consent. Private/search routes are excluded from these explicit events. GA page URLs omit query strings/fragments; Meta page events are skipped when the current URL has a query or fragment. Providers may collect additional browser/request metadata, so this is not a guarantee that they receive no personal data. Vercel retains its existing independent behavior.

No purchase/conversion events are fabricated. Coponya does not process merchant checkout, so purchase attribution requires a merchant/affiliate integration. Google Ads conversion action IDs/labels and the intended business event still need configuration. TikTok and Snapchat integrations are not implemented.

Before activating accounts, check Google Tag Assistant and Meta Test Events: no optional tag before consent, page view after the correct grant, no repeated page event on the same route, and no subsequent optional tag after withdrawal/reload. Live-provider delivery cannot be verified without actual account IDs. Review the privacy text against the final account settings and data practices before production release.

References: [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent), [Meta Pixel](https://developers.facebook.com/docs/meta-pixel/).
