import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { backendConfigured, backendRequest } from "@/lib/backend";

const clean = (v: FormDataEntryValue | null) => String(v || "").replace(/\s+/g, " ").trim();
const latin = (v: string) => v.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** "تواصل معنا": messages are saved for the admin team (contact_messages, insert-only for visitors). */
export function buildContactMessage(data: FormData): { ok: true; value: { name: string; email: string; phone: string | null; subject: string; message: string } } | { ok: false; error: string } {
  const name = clean(data.get("name"));
  if (name.length < 2) return { ok: false, error: "أدخل اسمك." };
  const email = clean(data.get("email")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "أدخل بريداً إلكترونياً صحيحاً." };
  const phone = latin(clean(data.get("phone"))) || null;
  if (phone && !/^[0-9+ ()-]{7,20}$/.test(phone)) return { ok: false, error: "أدخل رقم هاتف صحيحاً." };
  const subject = clean(data.get("subject"));
  if (subject.length < 2) return { ok: false, error: "اكتب موضوع الرسالة." };
  const message = String(data.get("message") || "").trim();
  if (message.length < 5) return { ok: false, error: "اكتب رسالتك." };
  return { ok: true, value: { name, email, phone, subject, message } };
}

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    setError("");
    const data = new FormData(form);
    if (clean(data.get("company_site"))) { setState("sent"); return; } // spam trap
    const result = buildContactMessage(data);
    if (!result.ok) { setError(result.error); return; }
    if (!backendConfigured) { setError("الإرسال غير متاح حالياً. راسلنا على info@coponya.com."); return; }
    setState("sending");
    try {
      await backendRequest("/rest/v1/contact_messages", { method: "POST", body: result.value, prefer: "return=minimal" });
      form.reset(); setState("sent");
    } catch {
      setState("idle");
      setError("تعذر إرسال الرسالة الآن. حاول مرة أخرى أو راسلنا على info@coponya.com.");
    }
  }

  return (
    <div className="content-panel legal-content legal-content--about contact-panel">
      <h1 className="legal-title">تواصل معنا</h1>
      {state === "sent" ? (
        <div className="submission-success" role="status">
          <CheckCircle2 size={44} />
          <h2>وصلتنا رسالتك، شكراً لك</h2>
          <p>سيرد عليك فريق كوبونيا على بريدك الإلكتروني في أقرب وقت.</p>
          <button className="button button--outline" type="button" onClick={() => setState("idle")}>إرسال رسالة أخرى</button>
        </div>
      ) : <>
        <p className="contact-lead">نسعد بخدمتك دائماً. إذا كان لديك أي استفسار أو اقتراح، أو ترغب في التواصل مع فريق <strong className="contact-brand">كوبونيا</strong>، يرجى تعبئة البيانات أدناه:</p>
        <form className="support-form submission-form contact-form" onSubmit={e => { e.preventDefault(); void submit(e.currentTarget); }}>
          <input className="submission-trap" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>الاسم<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>
          <label>البريد الإلكتروني<input name="email" type="email" autoComplete="email" dir="ltr" required maxLength={120} /></label>
          <label><span>رقم الهاتف <small>(اختياري)</small></span><input name="phone" type="tel" autoComplete="tel" dir="ltr" placeholder="05xxxxxxxx" maxLength={20} /></label>
          <label>الموضوع<input name="subject" required minLength={2} maxLength={120} /></label>
          <label>رسالتك<textarea name="message" rows={7} required minLength={5} maxLength={3000} /></label>
          <p className="contact-note"><strong>ملاحظة:</strong> إذا كانت رسالتك عن متجر، يرجى إضافة رابط المتجر إن كان متاحاً، وذلك لتسهيل وصول فريق كوبونيا إليه.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--primary contact-submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "جارٍ الإرسال…" : <>إرسال <ArrowLeft size={16} /></>}
          </button>
        </form>
      </>}
    </div>
  );
}
