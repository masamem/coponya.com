import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
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
  if (phone && !/^[0-9+ ()-]{7,20}$/.test(phone)) return { ok: false, error: "أدخل رقم جوال صحيحاً." };
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
    if (clean(data.get("cp_hp_9f3"))) { setState("sent"); return; } // spam trap
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
        <p className="contact-lead">نسعد بخدمتكم دائماً في <Link href="/" className="legal-link contact-brand">كوبونيا</Link>. نرحب بجميع استفساراتكم واقتراحاتكم، وللتواصل مع فريقنا يرجى تعبئة البيانات أدناه:</p>
        <form className="support-form submission-form contact-form" onSubmit={e => { e.preventDefault(); void submit(e.currentTarget); }}>
          <input className="submission-trap" name="cp_hp_9f3" tabIndex={-1} autoComplete="one-time-code" data-lpignore="true" data-1p-ignore="true" aria-hidden="true" />
          <input name="name" aria-label="الاسم" placeholder="الاسم" autoComplete="name" required minLength={2} maxLength={80} />
          <input name="email" type="email" aria-label="البريد الإلكتروني" placeholder="البريد الإلكتروني" autoComplete="email" required maxLength={120} />
          <input name="phone" type="tel" aria-label="رقم الجوال (اختياري)" placeholder="رقم الجوال" autoComplete="tel" maxLength={20} />
          <input name="subject" aria-label="الموضوع" placeholder="الموضوع" required minLength={2} maxLength={120} />
          <textarea name="message" aria-label="رسالتك" placeholder="رسالتك" rows={7} required minLength={5} maxLength={3000} />
          <p className="contact-note"><strong>ملاحظة:</strong> في حال طلب تسجيل متجر <Link href="/submit-coupon" className="legal-link">اضغط هنا</Link>.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--primary contact-submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "جارٍ الإرسال…" : <>إرسال</>}
          </button>
        </form>
      </>}
    </div>
  );
}
