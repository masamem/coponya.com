import "server-only";
import type { CouponRecord, StoreRecord } from "./backend";
import { mapCatalog } from "./liveCatalog";

/** How long a rendered page and its catalog stay cached before Next refreshes them (seconds). */
export const CATALOG_REVALIDATE = 300;

const backendUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
export const serverBackendConfigured = Boolean(backendUrl && publicKey);

async function rest<T>(path: string): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    headers: { apikey: publicKey },
    next: { revalidate: CATALOG_REVALIDATE, tags: ["catalog"] },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type ServerCatalog = ReturnType<typeof mapCatalog>;

/**
 * Loads the same public catalog the browser loads (active stores, published coupons)
 * with the public key and existing RLS. Returns null when the backend is not configured
 * (demo/preview builds) or unreachable, so the page falls back to the client fetch.
 */
export async function loadCatalog(): Promise<ServerCatalog | null> {
  if (!serverBackendConfigured) return null;
  try {
    const [stores, coupons] = await Promise.all([
      rest<StoreRecord[]>("/rest/v1/stores?select=*&active=eq.true&order=name"),
      rest<CouponRecord[]>("/rest/v1/coupons?select=*&published=eq.true&order=created_at.desc"),
    ]);
    return mapCatalog(stores, coupons);
  } catch {
    return null;
  }
}
