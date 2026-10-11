export function applyPageMetadata(title: string, description: string, path: string, options: { noindex?: boolean; structuredData?: unknown } = {}) {
  document.title = title;
  const setMeta = (attribute: "name" | "property", key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.append(element); }
    element.content = content;
  };
  const url = new URL(path, "https://coponya.com").href;
  setMeta("name", "description", description);
  setMeta("name", "robots", options.noindex ? "noindex,follow" : "index,follow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:type", "website");
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
  canonical.href = url;
  document.getElementById("store-schema")?.remove();
  if (options.structuredData) {
    const script = document.createElement("script");
    script.id = "store-schema"; script.type = "application/ld+json";
    script.textContent = JSON.stringify(options.structuredData).replace(/</g, "\\u003c");
    document.head.append(script);
  }
}
