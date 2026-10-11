import type { Coupon } from "./catalog";
import type { CouponRecord, StoreRecord } from "./backend";
export function mapCatalog(storeRows: StoreRecord[], couponRows: CouponRecord[], today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Riyadh" }).format(new Date())) {
  const activeStores = storeRows.filter(s => s.active);
  const coupons: Coupon[] = couponRows.filter(c => c.published && (!c.expires_at || c.expires_at >= today) && activeStores.some(s => s.id === c.store_id)).map(c => {
    const store = activeStores.find(s => s.id === c.store_id)!;
    return { id: c.id, seoTitle: c.seo_title || "", metaDescription: c.meta_description || "", store: store.name, initial: store.initial, tone: store.tone, title: c.title, description: c.description, discount: c.discount, code: c.code, category: c.category, state: "published", uses: "", verified: c.verified_at ? "تمت المراجعة" : "", isDemo: false, logoUrl: store.logo_url || "", websiteUrl: store.website_url, terms: c.terms, expiresAt: c.expires_at, verifiedAt: c.verified_at };
  });
  const stores = activeStores.map(s => ({ id: s.id, previousSlugs: s.previous_slugs || [], slug: s.slug || "", name: s.name, initial: s.initial, tone: s.tone, discount: `${Math.max(0, ...coupons.filter(c => c.store === s.name).map(c => parseFloat(c.discount)))}%`, count: `${coupons.filter(c => c.store === s.name).length} كوبون`, websiteUrl: s.website_url, summary: s.summary || "", about: s.about || "", products: s.products || "", shipping: s.shipping || "", payment: s.payment || "", returnsPolicy: s.returns_policy || "", faq: s.faq || "", logoUrl: s.logo_url || "", seoTitle: s.seo_title || "", metaDescription: s.meta_description || "", primaryKeyword: s.primary_keyword || "", supportingKeywords: s.supporting_keywords || "", longTailKeywords: s.long_tail_keywords || "", articleIdeas: s.article_ideas || "" }));
  return { stores, coupons };
}
