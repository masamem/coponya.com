import { describe, expect, it } from "vitest";
import { pathFromSegments, routeMetadata } from "./routeMetadata";
import type { Store } from "./catalog";

const stores: Store[] = [
  { name: "noon - نون", initial: "ن", tone: "olive", discount: "10%", count: "1 كوبون", faq: "كيف أستخدم الكود؟\nانسخه وأدخله عند الدفع." },
  { name: "صيدلية النهدي", initial: "ص", tone: "olive", discount: "5%", count: "1 كوبون", seoTitle: "عنوان مخصص" },
];

describe("server route metadata", () => {
  it("builds browser-style encoded paths from route segments", () => {
    expect(pathFromSegments()).toBe("/");
    expect(pathFromSegments(["stores", "noon"])).toBe("/stores/noon");
    expect(pathFromSegments(["stores", "صيدلية-النهدي"])).toBe("/stores/" + encodeURIComponent("صيدلية-النهدي"));
    expect(pathFromSegments(["stores", encodeURIComponent("صيدلية-النهدي")])).toBe("/stores/" + encodeURIComponent("صيدلية-النهدي"));
  });
  it("gives store pages their own indexable metadata and structured data", () => {
    const meta = routeMetadata("/stores/noon", stores);
    expect(meta).toMatchObject({ kind: "page", path: "/stores/noon", noindex: false, title: "كود خصم noon - نون وكوبونات المتجر | كوبونيا" });
    expect(JSON.stringify(meta.kind === "page" && meta.schema)).toContain("FAQPage");
    expect(routeMetadata(pathFromSegments(["stores", "صيدلية-النهدي"]), stores)).toMatchObject({ kind: "page", title: "عنوان مخصص" });
  });
  it("redirects legacy full-name store links and 404s unknown stores", () => {
    expect(routeMetadata(pathFromSegments(["stores", "noon - نون"]), stores)).toEqual({ kind: "redirect", to: "/stores/noon" });
    expect(routeMetadata("/stores/missing", stores)).toEqual({ kind: "not-found" });
  });
  it("keeps demo store pages and personal pages out of the index", () => {
    expect(routeMetadata("/stores/noon", null)).toMatchObject({ kind: "page", noindex: true });
    for (const path of ["/favorites", "/account", "/report", "/admin", "/search"]) {
      expect(routeMetadata(path, stores)).toMatchObject({ kind: "page", noindex: true });
    }
  });
  it("indexes listing, blog and legal pages, and 404s unknown routes", () => {
    for (const path of ["/", "/stores", "/coupons", "/categories", "/deals", "/blog", "/blog/use-coupon", "/privacy"]) {
      expect(routeMetadata(path, stores)).toMatchObject({ kind: "page", noindex: false });
    }
    expect(routeMetadata("/blog/missing", stores)).toEqual({ kind: "not-found" });
    expect(routeMetadata("/nothing-here", stores)).toEqual({ kind: "not-found" });
    expect(routeMetadata("/stores/noon/extra", stores)).toEqual({ kind: "not-found" });
  });
});
