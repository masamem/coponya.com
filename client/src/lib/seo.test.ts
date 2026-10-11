import { describe, it, expect } from "vitest";
import {
  articleMetadata,
  articlePath,
  articleSchema,
  couponMetadata,
  couponSchema,
} from "./seo";
import { mapCatalog } from "./liveCatalog";
describe("article and coupon SEO", () => {
  const article = {
    id: "1",
    slug: "guide",
    title: "دليل",
    description: "وصف",
    body: "نص",
    seo_title: " عنوان ",
    meta_description: " وصف البحث ",
    keywords: "خطة",
    store_id: null,
    published: true,
  };
  it("respects reviewed overrides and uses one canonical article URL", () => {
    expect(articleMetadata(article)).toEqual({
      title: "عنوان",
      description: "وصف البحث",
    });
    expect(articlePath(article)).toBe("/articles/guide");
    expect(articleSchema(article)).toMatchObject({
      "@type": "Article",
      headline: "دليل",
      mainEntityOfPage: "https://coponya.com/articles/guide",
    });
    expect(JSON.stringify(articleSchema(article))).not.toContain("خطة");
  });
  it("excludes unpublished, expired and hidden-store coupons from detail URLs", () => {
    const store = {
      id: "1",
      name: "متجر",
      initial: "م",
      tone: "olive",
      active: true,
      website_url: "https://example.com",
    };
    const coupon = {
      id: "coupon",
      store_id: "1",
      title: "عرض",
      description: "وصف",
      discount: "10%",
      code: "A",
      category: "أزياء",
      terms: "شروط",
      expires_at: null,
      published: true,
      verified_at: null,
      seo_title: " عنوان الكوبون ",
    };
    const data = mapCatalog(
      [store],
      [
        coupon,
        { ...coupon, id: "draft", published: false },
        { ...coupon, id: "expired", expires_at: "2000-01-01" },
      ],
    );
    expect(data.coupons).toHaveLength(1);
    expect(couponMetadata(data.coupons[0]).title).toBe("عنوان الكوبون");
    expect(couponSchema(data.coupons[0])).toMatchObject({
      "@type": "WebPage",
      url: "https://coponya.com/coupons/coupon",
    });
    expect(
      mapCatalog([{ ...store, active: false }], [coupon]).coupons,
    ).toHaveLength(0);
  });
});
