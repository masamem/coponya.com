import { StoreLogo } from "@/components/StoreLogo";
import { Heart, BadgeCheck, Clock3, ChevronDown, Award } from "lucide-react";
import type { Coupon } from "@/lib/catalog";

export function CouponCard({ coupon, onReveal, favorite, onFavorite }: {
  coupon: Coupon; onReveal: (coupon: Coupon) => void; favorite: boolean; onFavorite: () => void;
}) {
  const featured = coupon.state === "featured";
  const demo = coupon.isDemo !== false;
  return <article className={`coupon-card coupon-ticket ${featured ? "coupon-ticket--featured" : ""}`}>
    {featured && <div className="coupon-ticket__banner"><Award size={15} aria-hidden="true"/> عرض بارز{demo ? " · تجريبي" : ""}</div>}
    <div className="coupon-ticket__body">
      <div className="coupon-ticket__discount"><strong dir="auto">{coupon.discount || "عرض"}</strong>{coupon.discount && <span>خصم</span>}</div>
      <div className="coupon-ticket__info">
        <div className="coupon-ticket__meta"><span className="coupon-ticket__brand"><StoreLogo initial={coupon.initial} tone={coupon.tone} logoUrl={coupon.logoUrl}/>{coupon.store}</span>{demo ? <span>عرض تجريبي</span> : coupon.verifiedAt ? <span><BadgeCheck size={14} aria-hidden="true"/> تمت المراجعة</span> : <span>كوبون خصم</span>}</div>
        <h3>{coupon.title}</h3>
        <details className="coupon-ticket__details"><summary>عرض التفاصيل <ChevronDown size={14} aria-hidden="true"/></summary><p>{coupon.description}</p><p>{demo ? "مثال توضيحي لتجربة الموقع، وليس عرضاً فعلياً." : coupon.terms || "راجع شروط المتجر قبل استخدام الكود."}</p></details>
      </div>
      <div className="coupon-ticket__actions"><button className="button button--primary coupon-ticket__reveal" onClick={() => onReveal(coupon)} aria-label={`إظهار ${coupon.code ? "كود" : "تفاصيل عرض"} ${coupon.store}: ${coupon.title}`}>{coupon.code ? "إظهار كود الخصم" : "عرض التفاصيل"}</button>{coupon.expiresAt && <span className="coupon-ticket__expiry"><Clock3 size={13} aria-hidden="true"/> ينتهي {coupon.expiresAt}</span>}</div>
      <button className={`icon-button coupon-ticket__favorite ${favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-pressed={favorite} aria-label={favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}><Heart size={17} fill={favorite ? "currentColor" : "none"}/></button>
    </div>
  </article>;
}
