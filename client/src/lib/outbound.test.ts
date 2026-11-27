import { describe, it, expect } from "vitest";
import { isLikelyBot, isPrefetch, outboundPath, safeOutboundUrl, validCouponId } from "./outbound";

const id = "3F2A9C1E-5B7D-4E8A-9C21-7D4E5F6A8B90";

describe("outbound /go links", () => {
  it("builds the store path from the same slug as store pages", () => {
    expect(outboundPath("noon - نون")).toBe("/go/noon");
    expect(outboundPath("iHerb - اي هيرب", id)).toBe(`/go/iherb?c=${id.toLowerCase()}`);
    expect(outboundPath("صيدلية النهدي")).toBe(`/go/${encodeURIComponent("صيدلية-النهدي")}`);
  });

  it("drops coupon ids that are not UUIDs", () => {
    expect(outboundPath("noon - نون", "1; drop table")).toBe("/go/noon");
    expect(validCouponId(null)).toBeNull();
    expect(validCouponId(id)).toBe(id.toLowerCase());
  });

  it("keeps a safe destination byte-for-byte and rejects unsafe ones", () => {
    const tracked = "https://s.noon.com/OoQcrZA2gGg?x=1&utm_source=coponya";
    expect(safeOutboundUrl(tracked)).toBe(tracked);
    expect(safeOutboundUrl("http://s.noon.com/x")).toBeNull();
    expect(safeOutboundUrl("https://user:pass@evil.example")).toBeNull();
    expect(safeOutboundUrl("javascript:alert(1)")).toBeNull();
    expect(safeOutboundUrl("")).toBeNull();
  });

  it("does not count crawlers, previews or prefetches", () => {
    expect(isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isLikelyBot("WhatsApp/2.23")).toBe(true);
    expect(isLikelyBot(null)).toBe(true);
    expect(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")).toBe(false);
    expect(isPrefetch(new Headers({ "sec-purpose": "prefetch;prerender" }))).toBe(true);
    expect(isPrefetch(new Headers({ "next-router-prefetch": "1" }))).toBe(true);
    expect(isPrefetch(new Headers())).toBe(false);
  });
});
