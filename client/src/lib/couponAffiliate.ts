import type { Coupon } from "./catalog";

// Keep the saved affiliate URL intact, including its tracking parameters.
export function couponAffiliateUrl(coupon: Pick<Coupon, "websiteUrl">): string | null {
  if (!coupon.websiteUrl) return null;
  try {
    const url = new URL(coupon.websiteUrl);
    return url.protocol === "https:" && url.hostname === "s.noon.com" ? coupon.websiteUrl : null;
  } catch {
    return null;
  }
}

export function openCouponAffiliate(coupon: Pick<Coupon, "websiteUrl">): void {
  const url = couponAffiliateUrl(coupon);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}
