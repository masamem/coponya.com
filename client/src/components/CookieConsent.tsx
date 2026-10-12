import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CONSENT_EVENT, CONSENT_KEY, readConsent, saveConsent, trackPage } from "@/lib/tracking";

export default function CookieConsent() {
  const [choice, setChoice] = useState(readConsent);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(choice?.analytics || false);
  const [marketing, setMarketing] = useState(choice?.marketing || false);
  const [error, setError] = useState("");
  useEffect(() => {
    const update = () => setChoice(readConsent());
    window.addEventListener(CONSENT_EVENT, update);
    const sync = (e: StorageEvent) => { if (e.key === CONSENT_KEY || e.key === null) location.reload(); };
    window.addEventListener("storage", sync);
    trackPage(location.pathname);
    return () => { window.removeEventListener(CONSENT_EVENT, update); window.removeEventListener("storage", sync); };
  }, []);
  const save = (a: boolean, m: boolean) => {
    if (!saveConsent(a, m)) { setError("تعذر حفظ اختيارك. الأدوات الاختيارية تظل متوقفة؛ تحقق من إعدادات تخزين المتصفح."); return; }
    setChoice(readConsent()); setOpen(false); setError("");
  };
  return <div dir="rtl">
    {!choice && !open && <section className="cookie-banner" aria-label="خيارات ملفات الارتباط">
      <div><h2>خصوصيتك، باختيارك</h2><p>نستخدم إحصاءات Vercel بدون Cookies. يمكنك السماح بتحليلات إضافية وقياس الإعلانات عند تفعيلها، أو رفضها والاستمرار في التصفح. <a href="/privacy">سياسة الخصوصية</a></p></div>
      <div className="cookie-actions"><button className="button button--outline" onClick={() => save(false, false)}>رفض الاختياري</button><button className="button button--outline" onClick={() => setOpen(true)}>تخصيص</button><button className="button button--primary" onClick={() => save(true, true)}>قبول الكل</button></div>
      {error && <p role="alert">{error}</p>}
    </section>}
    <button className="cookie-settings-button" onClick={() => { const c = readConsent(); setAnalytics(c?.analytics || false); setMarketing(c?.marketing || false); setOpen(true); }}>إعدادات Cookies</button>
    <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="cookie-overlay"/><Dialog.Content dir="rtl" className="cookie-dialog">
      <Dialog.Title>إعدادات ملفات الارتباط</Dialog.Title><Dialog.Description>غيّر موافقتك في أي وقت. رفض الأدوات الاختيارية لا يمنع تصفح الكوبونات. الأدوات غير المربوطة بحساباتنا لن تعمل حتى بعد الموافقة.</Dialog.Description>
      <p>الضروري: حفظ اختيار الخصوصية على هذا المتصفح لمدة 180 يوماً.</p>
      <label><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)}/> التحليلات الإضافية — Google Analytics عند تفعيله</label>
      <label><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}/> قياس الإعلانات — Google Ads وMeta لفيسبوك وإنستغرام عند تفعيلها</label>
      <p>تغيير الموافقة لإيقاف أداة سبق تشغيلها سيعيد تحميل الصفحة. لا يحذف ذلك البيانات التي سبق إرسالها إلى مزوّد الأداة.</p>
      {error && <p role="alert">{error}</p>}
      <div className="cookie-actions"><button className="button button--outline" onClick={() => save(false,false)}>رفض الاختياري</button><button className="button button--primary" onClick={() => save(analytics,marketing)}>حفظ اختياراتي</button><Dialog.Close className="button button--outline">إغلاق</Dialog.Close></div>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
