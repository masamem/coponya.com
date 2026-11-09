import { describe, expect, it } from "vitest";
import { findStoreBySegment, storePath, storeSlug } from "./storeSlug";
import { storeMetadata } from "./storeSeo";
import * as page from "../../../api/store-page";

const names = ["noon - نون", "iHerb - اي هيرب", "shein", "صيدلية النهدي", "H&M - اتش آند ام", "Bath & Body Works", "  Ounass - اوناس  ", "اي هيرب & أكثر/عروض", "!!!"];

describe("store slugs", () => {
  it("uses the English brand name when the store name has one", () => {
    expect(storeSlug("noon - نون")).toBe("noon");
    expect(storeSlug("iHerb - اي هيرب")).toBe("iherb");
    expect(storeSlug("shein")).toBe("shein");
    expect(storeSlug("H&M - اتش آند ام")).toBe("h-and-m");
  });
  it("keeps Arabic-only names readable and URL-safe as one path segment", () => {
    expect(storeSlug("صيدلية النهدي")).toBe("صيدلية-النهدي");
    expect(storeSlug("اي هيرب & أكثر/عروض")).not.toContain("/");
    expect(storePath("صيدلية النهدي")).toBe("/stores/" + encodeURIComponent("صيدلية-النهدي"));
    expect(storeSlug("!!!")).toBe("store");
  });
  it("finds stores by slug and flags legacy full-name links", () => {
    const stores = [{ name: "noon - نون" }, { name: "shein" }];
    expect(findStoreBySegment(stores, "noon")).toEqual({ store: stores[0], legacy: false });
    expect(findStoreBySegment(stores, "noon - نون")).toEqual({ store: stores[0], legacy: true });
    expect(findStoreBySegment(stores, "missing").store).toBeUndefined();
  });
  it("keeps the server function's copies identical to the client code", () => {
    for (const name of names) {
      expect(page.storeSlug(name)).toBe(storeSlug(name));
      expect(page.storePath(name)).toBe(storePath(name));
    }
    const base = { name: "noon - نون", initial: "ن", tone: "olive", discount: "10%", count: "1 كوبون" };
    expect(page.storeMetadata(base)).toEqual(storeMetadata(base));
    const custom = { ...base, seoTitle: " عنوان مخصص ", metaDescription: "", summary: "ملخص" };
    expect(page.storeMetadata(custom)).toEqual(storeMetadata(custom));
  });
});

describe("server-rendered store page", () => {
  const shell = `<!doctype html><html lang="ar" dir="rtl"><head><title>كوبونيا | الرئيسية</title><meta name="description" content="home"/><link rel="canonical" href="https://coponya.com/"/><meta property="og:title" content="home"/><script id="site-brand-schema" type="application/ld+json">{}</script><script type="module" src="/assets/app.js"></script></head><body><div id="root"><div dir="rtl"><main><h1>home</h1></main></div></div>\n\n    <!-- analytics -->\n    <script>window.va=1</script></body></html>`;
  it("replaces homepage metadata with the store's own and adds readable content without coupon codes", () => {
    const store = { id: "1", name: "noon - نون", active: true, summary: "ملخص <نون>" };
    const out = page.renderStoreHtml(shell, { title: "كود خصم نون", description: "وصف", path: "/stores/noon", schema: { a: "</script>" }, body: page.storeBody(store, [{ title: "خصم 10%", discount: "10%", category: "أزياء", expires_at: "2026-12-31" }]) });
    expect(out.match(/rel="canonical"/g)).toHaveLength(1);
    expect(out).toContain('<link rel="canonical" href="https://coponya.com/stores/noon"/>');
    expect(out).toContain("<title>كود خصم نون</title>");
    expect(out).toContain('<meta name="description" content="وصف"/>');
    expect(out).not.toContain("site-brand-schema");
    expect(out).not.toContain('content="home"');
    expect(out).not.toContain("<h1>home</h1>");
    expect(out).toContain("<h1>كوبونات noon - نون</h1>");
    expect(out).toContain("ملخص &lt;نون&gt;");
    expect(out).toContain("ينتهي 2026-12-31");
    expect(out).toContain('<script type="module" src="/assets/app.js"></script>');
    expect(out).toContain("<script>window.va=1</script>");
    expect(out).not.toContain("</script>\"}"); // structured data cannot close the tag early
    expect(out).toContain('content="index,follow"');
    expect(out).toContain("<!-- analytics -->");
  });
  it("replaces only the root element, even with nested markup and comments after it", () => {
    expect(page.replaceRoot('<div id="root"><div><div>a</div></div></div><!-- x --><div id="o">b</div>', "NEW")).toBe('<div id="root">NEW</div><!-- x --><div id="o">b</div>');
    expect(page.replaceRoot('<div id="root"></div>', "NEW")).toBe('<div id="root">NEW</div>');
  });
});
