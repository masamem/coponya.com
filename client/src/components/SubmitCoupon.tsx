import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BadgeCheck, CheckCircle2, Megaphone, ShieldCheck, Store, Users } from "lucide-react";
import { categories } from "@/lib/data";
import { backendConfigured, backendRequest } from "@/lib/backend";
import { buildStoreSubmission, type StoreSubmissionInput } from "@/lib/storeSubmission";

/* "أضف متجرك": merchants send their store and first offer; requests are saved for admin review. */
export default function SubmitCoupon() {
  const [offerType, setOfferType] = useState<"code" | "deal">("code");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(form: HTMLFormElement) {
    setError("");
    const data = new FormData(form);
    if (String(data.get("company_site") || "")) { setState("sent"); return; } // spam trap
    const raw = Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v)])) as unknown as StoreSubmissionInput;
    const result = buildStoreSubmission(raw);
    if (!result.ok) { setError(result.error); return; }
    if (!backendConfigured) { setError("استقبال الطلبات غير متاح حالياً. راسلنا على hello@coponya.com."); return; }
    setState("sending");
    try {
      await backendRequest("/rest/v1/store_submissions", { method: "POST", body: result.value, prefer: "return=minimal" });
      form.reset(); setOfferType("code"); setState("sent");
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
        <Link className="text-link" href="/contact">لديك سؤال؟ تواصل معنا <ArrowLeft size={16} /></Link>
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
          <form className="support-form submission-form" noValidate={false} onSubmit={e => { e.preventDefault(); void submit(e.currentTarget); }}>
            <input className="submission-trap" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <fieldset>
              <legend>بيانات المتجر</legend>
              <div className="form-row">
                <label>اسم المتجر<input name="store_name" required minLength={2} maxLength={100} /></label>
                <label>رابط المتجر<input name="website_url" type="url" placeholder="https://example.com" dir="ltr" required maxLength={200} /></label>
              </div>
              <div className="form-row">
                <label>التصنيف
                  <select name="category" required defaultValue="">
                    <option value="" disabled>اختر التصنيف</option>
                    {categories.map(([name]) => <option key={name}>{name}</option>)}
                    <option>أخرى</option>
                  </select>
                </label>
                <label><span>السجل التجاري أو رقم التوثيق <small>(اختياري)</small></span><input name="registration" maxLength={120} /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>بيانات التواصل</legend>
              <label>الاسم<input name="contact_name" autoComplete="name" required minLength={2} maxLength={80} /></label>
              <div className="form-row">
                <label>البريد الإلكتروني<input name="email" type="email" autoComplete="email" dir="ltr" required maxLength={120} /></label>
                <label><span>رقم الجوال <small>(اختياري)</small></span><input name="phone" type="tel" autoComplete="tel" dir="ltr" placeholder="05xxxxxxxx" maxLength={20} /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>العرض</legend>
              <div className="submission-choice" role="radiogroup" aria-label="نوع العرض">
                <label><input type="radio" name="offer_type" value="code" checked={offerType === "code"} onChange={() => setOfferType("code")} /> كود خصم</label>
                <label><input type="radio" name="offer_type" value="deal" checked={offerType === "deal"} onChange={() => setOfferType("deal")} /> عرض بدون كود</label>
              </div>
              <div className="form-row">
                {offerType === "code" && <label>كود الخصم<input name="code" dir="ltr" placeholder="SAVE20" required minLength={2} maxLength={60} /></label>}
                <label>تفاصيل العرض<input name="offer" placeholder="مثال: خصم 20% على الطلب الأول" required minLength={3} maxLength={180} /></label>
              </div>
              <label><span>الشروط والاستثناءات <small>(اختياري)</small></span>
                <textarea name="terms" rows={3} placeholder="الحد الأدنى للطلب، المنتجات المستثناة، وأي شروط أخرى..." maxLength={700} />
              </label>
              <div className="form-row">
                <label><span>تاريخ انتهاء العرض <small>(اختياري)</small></span><input name="expires_on" type="date" min={minDate} lang="ar" /></label>
                <label>هل لدى متجرك برنامج تسويق بالعمولة؟
                  <select name="affiliate" defaultValue="unsure">
                    <option value="yes">نعم</option>
                    <option value="no">لا</option>
                    <option value="unsure">لا أعرف</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <label className="consent-label">
              <input name="consent" type="checkbox" required />
              <span>أؤكد صحة المعلومات وأنني مخوّل بنشر هذا العرض، وأوافق على التواصل معي بخصوص الطلب وفق <Link href="/privacy">سياسة الخصوصية</Link>.</span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "جارٍ الإرسال…" : <>إرسال الطلب <ArrowLeft size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
