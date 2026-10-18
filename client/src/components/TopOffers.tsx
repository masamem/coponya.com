import { Link } from "wouter";
import { ArrowLeft, Tag } from "lucide-react";
import { useCatalog } from "@/contexts/CatalogContext";
import type { Coupon } from "@/lib/catalog";
import { StoreLogo } from "./StoreLogo";
import { RiyalAmount } from "./RiyalAmount";

// Existing Coponya editorial imagery; these are illustrative, not product photos.
const imagery = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663890167905/YhatHEeNFLBL9m3u6y3Nwp/sahm-hero-fixpfM4RqYnrUecg2f4VDV.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663890167905/YhatHEeNFLBL9m3u6y3Nwp/sahm-savings-spotlight-knrB4G87CxRHwAHAo2WEjz.webp",
];

export default function TopOffers({ onReveal }: { onReveal: (coupon: Coupon) => void }) {
  const { coupons, deals, stores, isLive, loading, error, reload } = useCatalog();
  const offers = isLive ? coupons.map(c => ({
    key: `${c.store}-${c.code}`, brand: c.store, title: c.title,
    description: c.description, discount: c.discount, tone: c.tone,
    initial: c.initial, logoUrl: c.logoUrl, coupon: c,
    oldPrice: "", newPrice: "",
  })) : deals.map(d => ({
    ...d, key: d.brand, description: "اكتشف تفاصيل العرض والاختيارات المتاحة لدى المتجر.",
    initial: stores.find(s => s.name === d.brand)?.initial || d.brand.charAt(0),
    logoUrl: undefined, coupon: undefined,
  }));

  return <div className="top-offers">
    <div className="top-offers__intro"><Tag size={17} aria-hidden="true"/><span>عروض وكوبونات في مكان واحد</span><span className="top-offers__count" aria-live="polite">{loading ? "جارٍ التحميل…" : `${offers.length} عروض متاحة`}</span></div>
    {loading ? <div className="top-offers__empty" role="status">نحمّل العروض المتاحة لك…</div> : error ? <div className="top-offers__empty" role="alert"><h2>تعذر تحميل العروض</h2><p>حاول مرة أخرى لعرض أحدث الكوبونات.</p><button className="button button--primary" onClick={reload}>إعادة المحاولة</button></div> : !offers.length ? <div className="top-offers__empty"><Tag size={32} aria-hidden="true"/><h2>ترقّب العروض القادمة</h2><p>ستجد هنا العروض والكوبونات عند توفرها.</p><Link className="button button--primary" href="/stores">تصفح المتاجر <ArrowLeft size={16}/></Link></div> : <div className="top-offers__list">
      {offers.map((offer, index) => <article className={`top-offer top-offer--${offer.tone}`} key={offer.key}>
        <div className="top-offer__visual">
          <img className="top-offer__image" src={imagery[index % imagery.length]} alt="" width="960" height="540" loading={index === 0 ? "eager" : "lazy"}/>
          <div className="top-offer__store"><StoreLogo initial={offer.initial} tone={offer.tone} logoUrl={offer.logoUrl}/><span>{offer.brand}</span></div>
          <span className="top-offer__caption">صورة توضيحية</span>
        </div>
        <div className="top-offer__content">
          <div className="top-offer__meta"><span>{offer.brand}</span><span className="top-offer__badge">{isLive ? (offer.coupon?.code ? "كود خصم" : "عرض") : "عرض تجريبي"}</span></div>
          <h2>{offer.discount ? <><span className="top-offer__discount" dir="auto">{offer.discount}</span><span className="top-offer__title">{offer.title}</span></> : offer.title}</h2>
          <p>{offer.description}</p>
          {offer.newPrice && <div className="top-offer__prices"><strong><RiyalAmount value={offer.newPrice}/></strong><del><RiyalAmount value={offer.oldPrice}/></del></div>}
          {offer.coupon ? <button className="button button--primary top-offer__cta" onClick={() => onReveal(offer.coupon!)} aria-label={`عرض تفاصيل ${offer.title} لدى ${offer.brand}`}>{offer.coupon.code ? "إظهار الكود" : "عرض التفاصيل"}<ArrowLeft size={18} aria-hidden="true"/></button> : <Link className="button button--primary top-offer__cta" href={`/stores/${encodeURIComponent(offer.brand)}`}>تفاصيل العرض <ArrowLeft size={18} aria-hidden="true"/></Link>}
        </div>
      </article>)}
    </div>}
  </div>;
}
