import { useEffect } from "react";
import { Link } from "wouter";
import { useCatalog } from "@/contexts/CatalogContext";
import { applyPageMetadata } from "@/lib/pageMetadata";
import { couponMetadata, couponSchema } from "@/lib/seo";
import { CouponCard } from "@/components/CouponCard";
import type { Coupon } from "@/lib/catalog";
export default function CouponDetail({
  location,
  onReveal,
  onFavorite,
  favorites,
}: {
  location: string;
  onReveal: (c: Coupon) => void;
  onFavorite: (code: string) => void;
  favorites: string[];
}) {
  const { coupons, stores, loading, isLive } = useCatalog();
  const coupon = coupons.find((c) => `/coupons/${c.id}` === location);
  const store = stores.find((s) => s.name === coupon?.store);
  useEffect(() => {
    const meta = coupon
      ? couponMetadata(coupon)
      : {
          title: "الكوبون غير موجود | كوبونيا",
          description: "تصفح الكوبونات المتاحة وشروط كل عرض على كوبونيا.",
        };
    applyPageMetadata(meta.title, meta.description, location, {
      noindex: !coupon || !isLive,
      structuredData: coupon && isLive ? couponSchema(coupon) : undefined,
    });
  }, [coupon, location, isLive]);
  return (
    <section className="catalog-page container">
      <nav className="breadcrumbs">
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/coupons">الكوبونات</Link>
      </nav>
      <h1>
        {coupon?.title || (loading ? "جارٍ التحميل…" : "الكوبون غير موجود")}
      </h1>
      {coupon && (
        <>
          <CouponCard
            coupon={coupon}
            favorite={favorites.includes(coupon.code)}
            onFavorite={() => onFavorite(coupon.code)}
            onReveal={onReveal}
          />
          <section className="content-panel">
            <h2>شروط العرض</h2>
            <p>{coupon.terms}</p>
            {coupon.expiresAt && (
              <p>
                تاريخ الانتهاء:{" "}
                <time dateTime={coupon.expiresAt}>{coupon.expiresAt}</time>
              </p>
            )}
            <p>
              تأكد من تطبيق الخصم على طلبك قبل الدفع. قبول الكود يعتمد على شروط
              المتجر.
            </p>
            {store && (
              <Link
                className="text-link"
                href={`/stores/${encodeURIComponent(store.slug || store.name)}`}
              >
                كل كوبونات {store.name}
              </Link>
            )}
          </section>
        </>
      )}
    </section>
  );
}
