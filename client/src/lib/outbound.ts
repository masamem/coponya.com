// Outbound "go" links: /go/<store-slug>[?c=<coupon id>] records a click, then forwards
// to the store's saved destination (its affiliate tracking link). Imported by the
// app/go route on the server and by the browser, so keep it free of server-only code.
import { storeSlug } from "./storeSlug";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A coupon id we can pass along, or null when it is missing or malformed. */
export function validCouponId(value: string | null | undefined): string | null {
  return value && UUID.test(value) ? value.toLowerCase() : null;
}

/** The internal tracked path for a store, optionally naming the coupon that was used. */
export function outboundPath(storeName: string, couponId?: string | null): string {
  const base = `/go/${encodeURIComponent(storeSlug(storeName))}`;
  const id = validCouponId(couponId);
  return id ? `${base}?c=${id}` : base;
}

/** The saved destination unchanged (tracking parameters intact) when it is a plain https URL; otherwise null. */
export function safeOutboundUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

/** Crawlers, link checkers and previewers follow links too; their visits are not shopper clicks. */
export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|httpclient|headless|lighthouse/i.test(userAgent);
}

/** Browsers mark speculative loads; those are not clicks either. */
export function isPrefetch(headers: Headers): boolean {
  const purpose = `${headers.get("purpose") || ""} ${headers.get("sec-purpose") || ""}`.toLowerCase();
  return purpose.includes("prefetch") || purpose.includes("prerender") || headers.has("next-router-prefetch");
}
