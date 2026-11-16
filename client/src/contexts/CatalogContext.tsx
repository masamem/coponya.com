import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Store } from "@/lib/catalog";
import * as demo from "@/lib/data";
import { backendConfigured, backendRequest, type CouponRecord, type StoreRecord } from "@/lib/backend";
import { mapCatalog } from "@/lib/liveCatalog";
type Catalog = { stores: Store[]; coupons: typeof demo.coupons; categories: typeof demo.categories; deals: typeof demo.deals; isLive: boolean; loading: boolean; error: string; reload: () => void };
const Context = createContext<Catalog | null>(null);
export type InitialCatalog = { stores: Store[]; coupons: typeof demo.coupons };
/** `initial` is the catalog the server rendered with; when given, the first client fetch is skipped. */
export function CatalogProvider({ children, initial }: { children: ReactNode; initial?: InitialCatalog | null }) {
  const [data, setData] = useState<InitialCatalog>(initial ?? { stores: backendConfigured ? [] : demo.stores, coupons: backendConfigured ? [] : demo.coupons });
  const [loading, setLoading] = useState(backendConfigured && !initial);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!backendConfigured || (initial && revision === 0)) return;
    const controller = new AbortController(); setLoading(true); setError("");
    Promise.all([
      backendRequest<StoreRecord[]>("/rest/v1/stores?select=*&active=eq.true&order=name", { signal: controller.signal }),
      backendRequest<CouponRecord[]>("/rest/v1/coupons?select=*&published=eq.true&order=created_at.desc", { signal: controller.signal }),
    ]).then(([stores, coupons]) => { if (!controller.signal.aborted) setData(mapCatalog(stores, coupons)); })
      .catch(() => { if (!controller.signal.aborted) { setData({ stores: [], coupons: [] }); setError("تعذر تحميل الكوبونات. حاول مجدداً."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return <Context.Provider value={{ ...data, categories: demo.categories, deals: backendConfigured ? [] : demo.deals, isLive: backendConfigured, loading, error, reload: () => setRevision(v => v + 1) }}>{children}</Context.Provider>;
}
export function useCatalog() { const value = useContext(Context); if (!value) throw new Error("Missing CatalogProvider"); return value; }
