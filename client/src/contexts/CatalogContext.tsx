import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Store } from "@/lib/catalog";
import * as demo from "@/lib/data";
import {
  backendConfigured,
  backendRows,
  type CouponRecord,
  type StoreRecord,
  type ArticleRecord,
} from "@/lib/backend";
import { mapCatalog } from "@/lib/liveCatalog";
export type CatalogSnapshot = {
  stores: Store[];
  coupons: typeof demo.coupons;
  isLive: boolean;
  articles: ArticleRecord[];
};
type Catalog = {
  articles: ArticleRecord[];
  stores: Store[];
  coupons: typeof demo.coupons;
  categories: typeof demo.categories;
  deals: typeof demo.deals;
  isLive: boolean;
  loading: boolean;
  error: string;
  reload: () => void;
};
const Context = createContext<Catalog | null>(null);
export function CatalogProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: CatalogSnapshot;
}) {
  const [data, setData] = useState<{
    stores: Store[];
    coupons: typeof demo.coupons;
  }>(
    initial || {
      stores: backendConfigured ? [] : demo.stores,
      coupons: backendConfigured ? [] : demo.coupons,
    },
  );
  const [articles, setArticles] = useState<ArticleRecord[]>(
    initial?.articles || [],
  );
  const [loading, setLoading] = useState(!initial && backendConfigured);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!backendConfigured || (initial && revision === 0)) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      backendRows<StoreRecord>(
        "/rest/v1/stores?select=*&active=eq.true&order=id",
        { signal: controller.signal },
      ),
      backendRows<CouponRecord>(
        "/rest/v1/coupons?select=*&published=eq.true&order=id",
        { signal: controller.signal },
      ),
      backendRows<ArticleRecord>(
        "/rest/v1/articles?select=*&published=eq.true&order=id",
        { signal: controller.signal },
      ),
    ])
      .then(([stores, coupons, articles]) => {
        if (!controller.signal.aborted) {
          setData(mapCatalog(stores, coupons));
          setArticles(articles);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("تعذر تحديث المحتوى. حاول مجدداً.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return (
    <Context.Provider
      value={{
        ...data,
        articles,
        categories: demo.categories,
        deals: backendConfigured ? [] : demo.deals,
        isLive: initial?.isLive ?? backendConfigured,
        loading,
        error,
        reload: () => setRevision((v) => v + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCatalog() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing CatalogProvider");
  return value;
}
