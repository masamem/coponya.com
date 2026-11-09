import { describe, expect, it } from "vitest";
import { parseFaq, storeMetadata, storeSeoDefaults, storeStructuredData } from "./storeSeo";
import { mapCatalog } from "./liveCatalog";
import type { Store } from "./catalog";
import { storePath } from "./storeSlug";
const store: Store = { name: "متجر عربي", initial: "م", tone: "olive", count: "", discount: "" };
describe("store SEO", () => {
  it("uses editor overrides, trims them, and falls back for older stores", () => {
    expect(storeMetadata({ ...store, seoTitle: " عنوان مخصص ", metaDescription: " وصف مخصص " })).toEqual({ title: "عنوان مخصص", description: "وصف مخصص" });
    expect(storeMetadata({ ...store, seoTitle: "  ", summary: "نبذة موجودة" }).description).toBe("نبذة موجودة");
    expect(storeMetadata(store).title).toContain(store.name);
  });
  it("keeps suggestions free of unsupported discount promises", () => {
    const defaults = storeSeoDefaults(store.name);
    expect(defaults.primaryKeyword).toBe(`كود خصم ${store.name}`);
    expect(defaults.metaDescription).not.toMatch(/\d+%|مضمون/);
    expect(parseFaq(defaults.faq)).toHaveLength(2);
  });
  it("uses only complete visible FAQ entries in schema", () => {
    const profile = { ...store, faq: "سؤال بلا إجابة\n\nكيف؟\nجواب\nتكملة\n\n\nإجابة بدون سؤال" };
    expect(parseFaq(profile.faq)).toEqual([{ question: "كيف؟", answer: "جواب\nتكملة" }]);
    const data = storeStructuredData(profile, "https://coponya.com");
    expect(JSON.stringify(data)).toContain("https://coponya.com" + storePath(store.name));
    expect(data["@graph"].find(item => item["@type"] === "FAQPage")).toMatchObject({ mainEntity: [{ name: "كيف؟", acceptedAnswer: { text: "جواب\nتكملة" } }] });
    expect(storeStructuredData(store, "https://coponya.com")["@graph"].some(item => item["@type"] === "FAQPage")).toBe(false);
  });
  it("maps persisted fields and remains compatible with missing SEO columns", () => {
    const record = { id: "1", name: store.name, initial: "م", tone: "olive", active: true, website_url: "https://example.com" };
    const profile = mapCatalog([{ ...record, seo_title: "عنوان", meta_description: "وصف", primary_keyword: "رئيسية", supporting_keywords: "مساندة", long_tail_keywords: "طويلة", article_ideas: "مقال" }], []).stores[0];
    expect(profile).toMatchObject({ seoTitle: "عنوان", metaDescription: "وصف", primaryKeyword: "رئيسية", supportingKeywords: "مساندة", longTailKeywords: "طويلة", articleIdeas: "مقال" });
    expect(mapCatalog([record], []).stores[0].seoTitle).toBe("");
  });
});
