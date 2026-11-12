import { useState } from "react";
import { Link } from "wouter";
import { BadgeCheck, CheckCircle2, Megaphone, ShieldCheck, Store, Users } from "lucide-react";
import { backendConfigured, backendRequest } from "@/lib/backend";
import { buildStoreSubmission, type StoreSubmissionInput } from "@/lib/storeSubmission";

/* "أضف متجرك": merchants send their store and first offer; requests are saved for admin review. */
export default function SubmitCoupon() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    setError("");
    const data = new FormData(form);
    if (String(data.get("cp_hp_9f3") || "")) { setState("sent"); return; } // spam trap
    const raw = Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v)])) as unknown as StoreSubmissionInput;
    const result = buildStoreSubmission(raw);
    if (!result.ok) { setError(result.error); return; }
    if (!backendConfigured) { setError("استقبال الطلبات غير متاح حالياً. راسلنا على hello@coponya.com."); return; }
    setState("sending");
    try {
      await backendRequest("/rest/v1/store_submissions", { method: "POST", body: result.value, prefer: "return=minimal" });
      form.reset(); setState("sent");
    } catch {
      setState("idle");
      setError("تعذر إرسال الطلب الآن. حاول مرة أخرى أو راسلنا على hello@coponya.com.");
    }
  }

  return (
    <div className="submission-layout">
      <aside className="submission-intro">
        <span className="submission-icon"><Store size={30} /></span>
        <h2>اعرض متجرك على كوبونيا</h2>
        <p>صاحب متجر إلكتروني في السعودية؟ أرسل بيانات متجرك وأول عرض، ونراجعه وننشره ليصل إلى متسوقين يبحثون عن أكواد الخصم.</p>
        <ul>
          <li><Megaphone size={18} /> ظهور مجاني لمتجرك وعروضه في صفحة خاصة به.</li>
          <li><Users size={18} /> وصول إلى متسوقين جاهزين للشراء.</li>
          <li><BadgeCheck size={18} /> نراجع كل عرض قبل نشره ونتواصل معك عند الحاجة.</li>
          <li><ShieldCheck size={18} /> بياناتك تُستخدم للتواصل بخصوص طلبك فقط.</li>
        </ul>
        <p className="submission-note">يبقى المتجر مسؤولاً عن صحة العرض وشروطه وفق نظام التجارة الإلكترونية، وإرسال الطلب لا يضمن النشر.</p>
        <Link className="text-link" href="/contact">لديك سؤال؟ تواصل معنا</Link>
      </aside>

      <div className="content-panel submission-panel">
        {state === "sent" ? (
          <div className="submission-success" role="status">
            <CheckCircle2 size={44} />
            <h2>وصلنا طلبك، شكراً لك</h2>
            <p>سيراجع فريق كوبونيا بيانات متجرك وعرضك، ونتواصل معك على البريد أو الجوال الذي أرسلته.</p>
            <button className="button button--outline" type="button" onClick={() => setState("idle")}>إرسال طلب آخر</button>
          </div>
        ) : (
          <form className="support-form submission-form contact-form" onSubmit={e => { e.preventDefault(); void submit(e.currentTarget); }}>
            <input className="submission-trap" name="cp_hp_9f3" tabIndex={-1} autoComplete="one-time-code" data-lpignore="true" data-1p-ignore="true" aria-hidden="true" />
            <input name="store_name" aria-label="اسم المتجر" placeholder="اسم المتجر" required minLength={2} maxLength={100} />
            <input name="website_url" type="text" inputMode="url" dir="auto" aria-label="رابط المتجر" placeholder="رابط المتجر" required maxLength={200} />
            <input name="contact_name" aria-label="اسمك" placeholder="اسمك" autoComplete="name" required minLength={2} maxLength={80} />
            <input name="email" type="email" aria-label="البريد الإلكتروني" placeholder="البريد الإلكتروني" autoComplete="email" required maxLength={120} />
            <input name="phone" type="tel" aria-label="رقم الجوال (اختياري)" placeholder="رقم الجوال" autoComplete="tel" maxLength={20} />
            <textarea name="offer" aria-label="العرض أو كود الخصم" placeholder="العرض أو كود الخصم وشروطه (مثال: كود SAVE20 خصم 20% على الطلب الأول)" rows={4} required minLength={3} maxLength={700} />
            <label className="consent-label">
              <input name="consent" type="checkbox" required />
              <span>أؤكد صحة المعلومات وأنني مخوّل بنشر هذا العرض، وأوافق على التواصل معي وفق <Link href="/privacy">سياسة الخصوصية</Link>.</span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary contact-submit" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "جارٍ الإرسال…" : "إرسال الطلب"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
