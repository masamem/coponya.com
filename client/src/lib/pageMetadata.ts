import { siteBrand, siteBrandStructuredData } from "./siteBrand";
import { trackPage } from "./tracking";
export function applyPageMetadata(title: string, description: string, path: string, options: { noindex?: boolean; structuredData?: unknown } = {}) {
  document.title = title;
  trackPage(path);
  const setMeta = (attribute: "name" | "property", key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.append(element); }
    element.content = content;
  };
  const url = new URL(path, "https://coponya.com").href;
  setMeta("name", "description", description);
  setMeta("name", "robots", options.noindex ? "noindex,follow" : "index,follow");
  setMeta("property", "og:site_name", siteBrand.name);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:type", path.startsWith("/blog/") ? "article" : "website");
  setMeta("property", "og:locale", "ar_SA");
  setMeta("name", "twitter:card", "summary");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
  canonical.href = url;
  document.getElementById("site-brand-schema")?.remove();
  if (path === "/") {
    const brandSchema = document.createElement("script");
    brandSchema.id = "site-brand-schema";
    brandSchema.type = "application/ld+json";
    brandSchema.textContent = JSON.stringify(siteBrandStructuredData()).replace(/</g, "\\u003c");
    document.head.append(brandSchema);
  }
  document.getElementById("store-schema")?.remove();
  if (options.structuredData) {
    const script = document.createElement("script");
    script.id = "store-schema"; script.type = "application/ld+json";
    script.textContent = JSON.stringify(options.structuredData).replace(/</g, "\\u003c");
    document.head.append(script);
  }
}
