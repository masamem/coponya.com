import { articles } from "./articles";
import { categories as categoryList } from "./data";
import { pages } from "./pageInfo";
import { siteBrand, siteBrandStructuredData } from "./siteBrand";
import { storeMetadata, storeStructuredData } from "./storeSeo";
import { findStoreBySegment, storePath } from "./storeSlug";
import type { Store } from "./catalog";

export type RouteMeta =
  | { kind: "page"; title: string; description: string; path: string; noindex: boolean; ogType: "website" | "article"; schema?: unknown }
  | { kind: "redirect"; to: string }
  | { kind: "not-found" };

const NOINDEX_PAGES = new Set(["/favorites", "/account", "/report", "/admin", "/search"]);
const pageTitle = (name: string) => `${name} — Coponya · كوبونيا`;

const safeDecode = (segment: string) => {
  try { return decodeURIComponent(segment); } catch { return segment; }
};

/** Builds the browser-style (percent-encoded) path from Next's route segments. */
export function pathFromSegments(segments: string[] = []): string {
  return "/" + segments.map(segment => encodeURIComponent(safeDecode(segment))).join("/");
}

/**
 * Server-side twin of the metadata the client sets with applyPageMetadata: the same
 * titles, descriptions, robots rules and structured data, decided before the HTML is sent.
 * `stores` is null when the live catalog is not configured (demo builds).
 */
export function routeMetadata(path: string, stores: Store[] | null): RouteMeta {
  const [, first = "", second, ...rest] = path.split("/");
  const detail = second === undefined ? undefined : safeDecode(second);
  if (rest.length) return { kind: "not-found" };

  if (path === "/") {
    return { kind: "page", title: siteBrand.title, description: siteBrand.description, path, noindex: false, ogType: "website", schema: siteBrandStructuredData() };
  }
  if (path === "/admin") {
    return { kind: "page", title: "إدارة كوبونيا", description: siteBrand.description, path, noindex: true, ogType: "website" };
  }
  if (path === "/search") {
    return { kind: "page", title: "ابحث في كوبونيا — كوبونيا", description: "اعثر على متجر أو كوبون أو تصنيف أو دليل في مكان واحد.", path, noindex: true, ogType: "website" };
  }
  if (path === "/blog") {
    return { kind: "page", title: "المدونة — كوبونيا", description: "أدلة أصلية تساعدك على فهم الكوبونات ومقارنة العروض.", path, noindex: false, ogType: "website" };
  }
  if (first === "blog" && detail !== undefined) {
    const article = articles.find(a => a.slug === detail);
    if (!article) return { kind: "not-found" };
    return {
      kind: "page", title: `${article.title} — كوبونيا`, description: article.description, path, noindex: false, ogType: "article",
      schema: { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, inLanguage: "ar",
        author: { "@type": "Organization", name: "كوبونيا" }, mainEntityOfPage: `${siteBrand.origin}/blog/${article.slug}` },
    };
  }
  if (first === "stores" && detail !== undefined) {
    if (!stores) {
      // Demo catalog: the client shows sample stores, which must not be indexed.
      return { kind: "page", title: pageTitle(detail), description: siteBrand.description, path, noindex: true, ogType: "website" };
    }
    const { store, legacy } = findStoreBySegment(stores, detail);
    if (!store) return { kind: "not-found" };
    if (legacy) return { kind: "redirect", to: storePath(store.name) };
    const meta = storeMetadata(store);
    return { kind: "page", ...meta, path: storePath(store.name), noindex: false, ogType: "website", schema: storeStructuredData(store, siteBrand.origin) };
  }
  if (first === "categories" && detail !== undefined) {
    const category = categoryList.find(c => c[0] === detail);
    if (!category) return { kind: "not-found" };
    return { kind: "page", title: pageTitle(category[0]), description: `${category[0]}: تصفح الكوبونات المتاحة في هذا التصنيف.`, path, noindex: false, ogType: "website" };
  }
  const info = pages[path];
  if (!info) return { kind: "not-found" };
  return { kind: "page", title: pageTitle(info[0]), description: `${info[0]}: ${info[1]}`, path, noindex: NOINDEX_PAGES.has(path), ogType: "website" };
}
