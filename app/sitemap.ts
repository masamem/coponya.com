import type { MetadataRoute } from "next";
import { siteBrand } from "@/lib/siteBrand";
import { articles } from "@/lib/articles";
import { legalPages } from "@/lib/legal";
import { fetchStoreSitemapPaths } from "../scripts/storeSitemap";

export const revalidate = 3600;

const fixedPaths = ["/", "/stores", "/coupons", "/categories", "/deals", "/blog", "/contact", "/submit-coupon", "/links", ...Object.keys(legalPages), ...articles.map(a => `/blog/${a.slug}`)];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await fetchStoreSitemapPaths(process.env.VITE_SUPABASE_URL || undefined, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || undefined);
  return [...new Set([...fixedPaths, ...stores])].map(path => ({ url: siteBrand.origin + path }));
}
