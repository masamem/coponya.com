import type { Coupon } from "./catalog";
import { outboundPath } from "./outbound";

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

type OutboundCoupon = Pick<Coupon, "websiteUrl" | "isDemo" | "store" | "id">;

/**
 * Where a real (non-demo) coupon's copy button also takes the shopper, if anywhere:
 * Coponya's /go/<store> path, which counts the click and forwards to the saved
 * tracked link above unchanged.
 */
export function couponCopyOpensUrl(coupon: OutboundCoupon): string | null {
  return coupon.isDemo === false && couponAffiliateUrl(coupon) ? outboundPath(coupon.store, coupon.id) : null;
}

type CopyDeps = { writeText?: (text: string) => Promise<void>; open?: (url: string) => void };

/**
 * Copies the code and, for real Noon coupons, opens the tracked Noon link.
 * The clipboard write starts first (while this page still has focus) and the tab opens
 * synchronously inside the click so popup blockers allow it.
 */
export async function copyCouponCode(
  coupon: OutboundCoupon & Pick<Coupon, "code">,
  {
    writeText = text => navigator.clipboard.writeText(text),
    open = url => { window.open(url, "_blank", "noopener,noreferrer"); },
  }: CopyDeps = {},
): Promise<{ copied: boolean; opened: boolean }> {
  let pending: Promise<void>;
  try { pending = Promise.resolve(writeText(coupon.code)); } catch (error) { pending = Promise.reject(error); }
  const url = couponCopyOpensUrl(coupon);
  if (url) open(url);
  try { await pending; return { copied: true, opened: !!url }; }
  catch { return { copied: false, opened: !!url }; }
}
