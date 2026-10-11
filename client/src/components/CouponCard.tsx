import { couponAffiliateUrl, openCouponAffiliate } from "@/lib/couponAffiliate";
import { StoreLogo } from "@/components/StoreLogo";
/* سوق الضوء: clear coupon actions, RTL-first, Coponya palette. */
import { useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  Copy,
  Check,
  ShieldCheck,
  BadgeCheck,
  Zap,
  ArrowLeft,
  ArrowUpLeft,
} from "lucide-react";
import type { Coupon } from "@/lib/catalog";
export function CouponCard({
  coupon,
  onReveal,
  favorite,
  onFavorite,
}: {
  coupon: Coupon;
  onReveal: (coupon: Coupon) => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const affiliateUrl = couponAffiliateUrl(coupon);
  const copyCode = async () => {
    openCouponAffiliate(coupon);
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(coupon.isDemo === false ? "تم نسخ الكود" : "تم نسخ الكود التجريبي");
    } catch {
      toast.error("تعذر النسخ. افتح التفاصيل لنسخ الكود يدوياً.");
      onReveal(coupon);
    }
  };
  return (
    <article className={`coupon-card coupon-card--${coupon.tone}`}>
      <div className="verified-rail">
        <span>{coupon.isDemo === false ? "كوبون خصم" : "كوبون تجريبي"}</span>
        <ShieldCheck size={15} />
      </div>
      <div className="coupon-card__top">
        <div className="coupon-store">
          <StoreLogo initial={coupon.initial} tone={coupon.tone} logoUrl={coupon.logoUrl}/>
          <div>
            <strong>{coupon.store}</strong>
            <span>
              <BadgeCheck size={14} /> {coupon.isDemo === false ? (coupon.verifiedAt ? "تمت المراجعة" : "كوبون خصم") : "عرض تجريبي"}
            </span>
          </div>
        </div>
        <button
          className={`icon-button ${favorite ? "is-favorite" : ""}`}
          onClick={onFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="coupon-card__main">
        <div>
          <span className="discount-pill">خصم {coupon.discount}</span>
          <h3>{coupon.title}</h3>
          <p>{coupon.description}</p>
        </div>
        <div className="discount-value">
          {coupon.discount}
          <small>خصم</small>
        </div>
      </div>
      <div className="code-strip">
        <span className="code-label">كود الخصم</span>
        <strong dir="ltr">{coupon.code}</strong>
        <span className="code-dots" />
      </div>
      <div className="coupon-card__bottom">
        <div className="coupon-meta">
          <span>
            <ShieldCheck size={14} /> {coupon.isDemo === false ? (coupon.expiresAt ? `حتى ${coupon.expiresAt}` : "راجع الشروط") : "مثال توضيحي"}
          </span>
          <span>
            <Zap size={14} /> تفاصيل الكوبون
          </span>
        </div>
        <button
          className="button button--primary button--small"
          onClick={copyCode}
          aria-label={`نسخ كود ${coupon.store}: ${coupon.code}${affiliateUrl ? " وفتح نون في نافذة جديدة" : ""}`}
        >
          {copied ? <>تم النسخ <Check size={16} /></> : <>{affiliateUrl ? "نسخ الكود وفتح نون" : "نسخ الكود"} <Copy size={16} /></>}
        </button>
      </div>
      <button className="terms-link" onClick={() => onReveal(coupon)}>
        الشروط والأحكام <ArrowUpLeft size={13} />
      </button>
    </article>
  );
}
