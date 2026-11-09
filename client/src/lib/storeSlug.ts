// Stable, readable store URLs. Keep this file free of imports: api/store-page.ts
// carries an identical copy (checked by storeSlug.test.ts) because Vercel
// functions cannot import extensionless TypeScript modules from the client.

/** "noon - نون" → "noon", "iHerb - اي هيرب" → "iherb", "صيدلية النهدي" → "صيدلية-النهدي" */
export function storeSlug(name: string): string {
  const clean = name.normalize("NFKC").trim().toLowerCase();
  const [first, ...rest] = clean.split(/\s+-\s+/);
  const latinPrefix = rest.length > 0 && /^[a-z0-9][a-z0-9 .&'+]*$/.test(first) ? first : clean;
  return latinPrefix
    .replace(/&/g, " and ")
    .replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "store";
}

export function storePath(name: string): string {
  return `/stores/${encodeURIComponent(storeSlug(name))}`;
}

/** Finds a store by its slug, or by the legacy URL that used the full encoded name. */
export function findStoreBySegment<T extends { name: string }>(stores: T[], segment: string): { store?: T; legacy: boolean } {
  const bySlug = stores.find(s => storeSlug(s.name) === segment);
  if (bySlug) return { store: bySlug, legacy: false };
  const byName = stores.find(s => s.name === segment);
  return { store: byName, legacy: !!byName };
}
