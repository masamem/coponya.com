import type { ArticleRecord } from "./backend";
export const siteOrigin = "https://coponya.com";
export const articlePath = (article: ArticleRecord) =>
  `/articles/${encodeURIComponent(article.slug)}`;
export function articleMetadata(article: ArticleRecord) {
  return {
    title: article.seo_title.trim() || `${article.title} | كوبونيا`,
    description: article.meta_description.trim() || article.description,
  };
}
export function articleSchema(article: ArticleRecord) {
  const url = siteOrigin + articlePath(article);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: url,
    inLanguage: "ar",
    ...(article.created_at ? { datePublished: article.created_at } : {}),
    publisher: { "@type": "Organization", name: "كوبونيا", url: siteOrigin },
  };
}

import type { Coupon } from "./catalog";
export function couponMetadata(coupon: Coupon) {
  return {
    title:
      coupon.seoTitle?.trim() || `${coupon.title} — ${coupon.store} | كوبونيا`,
    description:
      coupon.metaDescription?.trim() ||
      coupon.description ||
      `اقرأ شروط كوبون ${coupon.store} وتاريخ انتهائه قبل استخدام الكود.`,
  };
}
export function couponSchema(coupon: Coupon) {
  const url = `${siteOrigin}/coupons/${coupon.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: couponMetadata(coupon).title,
    description: couponMetadata(coupon).description,
    inLanguage: "ar",
  };
}
