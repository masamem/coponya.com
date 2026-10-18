import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "wouter";
import { X, Tag, Check, ChevronDown, ArrowUpLeft } from "lucide-react";
import { toast } from "sonner";
import { StoreLogo } from "./StoreLogo";
import type { Coupon } from "@/lib/catalog";

export default function CouponDialog({ coupon, onClose, returnFocusTo }: { coupon: Coupon | null; onClose: () => void; returnFocusTo?: HTMLElement | null }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCopied(false); }, [coupon]);
  const copy = async () => {
    if (!coupon?.code) return;
    try { await navigator.clipboard.writeText(coupon.code); setCopied(true); }
    catch { toast.error("تعذر النسخ. حدد الكود وانسخه يدوياً."); }
  };
  let storeUrl: string | null = null;
  try { const url = new URL(coupon?.websiteUrl || ""); if (url.protocol === "https:" && !url.username && !url.password) storeUrl = coupon!.websiteUrl!; } catch { /* Use the internal store page when no safe destination is available. */ }
  return <Dialog.Root open={!!coupon} onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="modal-backdrop coupon-reveal-overlay"/>{coupon && <Dialog.Content className="coupon-reveal accessible-modal" dir="rtl" onCloseAutoFocus={event => { if (returnFocusTo?.isConnected) { event.preventDefault(); returnFocusTo.focus(); } }}>
    <Dialog.Close className="icon-button coupon-reveal__close" aria-label="إغلاق"><X size={21}/></Dialog.Close>
    <div className="coupon-reveal__panel">
      <span className="coupon-reveal__type"><Tag size={14} aria-hidden="true"/>{coupon.isDemo !== false ? "كود تجريبي" : coupon.code ? "كود خصم" : "عرض"}</span>
      <div className="coupon-reveal__brand"><StoreLogo initial={coupon.initial} tone={coupon.tone} logoUrl={coupon.logoUrl}/><strong>{coupon.store}</strong></div>
      <Dialog.Title>{coupon.title}</Dialog.Title>
      <Dialog.Description>{coupon.description || `تفاصيل عرض ${coupon.store}`}</Dialog.Description>
      {coupon.code && <div className="coupon-reveal__code"><strong dir="ltr" tabIndex={0} aria-label={`كود الخصم ${coupon.code}`}>{coupon.code}</strong><button className="button button--primary" onClick={copy}>{copied ? <><Check size={15}/> تم النسخ</> : "نسخ"}</button></div>}
      <p className="coupon-reveal__hint" role="status" aria-live="polite">{copied ? (coupon.isDemo !== false ? "تم نسخ الكود التجريبي." : "تم نسخ الكود، يمكنك استخدامه عند الدفع.") : coupon.isDemo !== false ? "هذا كود تجريبي لتوضيح تجربة الموقع." : coupon.code ? `انسخ الكود ثم انتقل إلى ${coupon.store}.` : "راجع تفاصيل العرض لدى المتجر."}</p>
      {storeUrl ? <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="button button--outline coupon-reveal__store">الانتقال إلى المتجر <ArrowUpLeft size={16}/><span className="sr-only">يفتح في نافذة جديدة</span></a> : <Dialog.Close asChild><Link href={`/stores/${encodeURIComponent(coupon.store)}`} className="button button--outline coupon-reveal__store">صفحة المتجر</Link></Dialog.Close>}
      <details className="coupon-reveal__details"><summary>عرض التفاصيل <ChevronDown size={14} aria-hidden="true"/></summary><div><h3>شروط الاستخدام</h3><p>{coupon.isDemo !== false ? "مثال توضيحي لتجربة الموقع. لا تستخدم هذا الكود باعتباره عرضاً فعلياً." : coupon.terms || "راجع شروط المتجر والمنتجات المشمولة قبل استخدام الكود."}</p>{coupon.expiresAt && <p>ينتهي بتاريخ {coupon.expiresAt}</p>}<Link href={`/report?code=${encodeURIComponent(coupon.code)}`} onClick={onClose}>الإبلاغ عن مشكلة</Link></div></details>
    </div>
  </Dialog.Content>}</Dialog.Portal></Dialog.Root>;
}
