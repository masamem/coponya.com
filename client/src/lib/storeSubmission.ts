/** Validation for the public "أضف متجرك" form; mirrors the store_submissions table checks. */
export type StoreSubmissionInput = {
  store_name?: string; website_url?: string; category?: string; registration?: string;
  contact_name?: string; email?: string; phone?: string;
  offer_type?: string; code?: string; offer?: string; terms?: string; expires_on?: string; affiliate?: string;
};
export type StoreSubmission = {
  store_name: string; website_url: string; category: string; registration: string | null;
  contact_name: string; email: string; phone: string | null;
  offer_type: "code" | "deal"; code: string | null; offer: string; terms: string | null;
  expires_on: string | null; affiliate: "yes" | "no" | "unsure";
};

const clean = (v?: string) => (v || "").replace(/\s+/g, " ").trim();
const optional = (v?: string) => clean(v) || null;
const toLatinDigits = (v: string) => v.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function buildStoreSubmission(input: StoreSubmissionInput): { ok: true; value: StoreSubmission } | { ok: false; error: string } {
  const store_name = clean(input.store_name);
  if (store_name.length < 2) return { ok: false, error: "أدخل اسم المتجر." };
  const website_url = clean(input.website_url);
  try {
    const url = new URL(website_url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) throw new Error();
  } catch { return { ok: false, error: "أدخل رابط متجر صحيحاً يبدأ بـ https://" }; }
  const category = clean(input.category);
  if (!category) return { ok: false, error: "اختر تصنيف المتجر." };
  const contact_name = clean(input.contact_name);
  if (contact_name.length < 2) return { ok: false, error: "أدخل اسمك." };
  const email = clean(input.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "أدخل بريداً إلكترونياً صحيحاً." };
  const phone = optional(toLatinDigits(input.phone || ""));
  if (phone && !/^[0-9+ ()-]{7,20}$/.test(phone)) return { ok: false, error: "أدخل رقم جوال صحيحاً." };
  const offer_type = input.offer_type === "deal" ? "deal" : "code";
  const code = offer_type === "code" ? clean(input.code) : "";
  if (offer_type === "code" && code.length < 2) return { ok: false, error: "أدخل كود الخصم، أو اختر «عرض بدون كود»." };
  const offer = clean(input.offer);
  if (offer.length < 3) return { ok: false, error: "اكتب تفاصيل العرض." };
  const expires_on = optional(input.expires_on);
  if (expires_on && !/^\d{4}-\d{2}-\d{2}$/.test(expires_on)) return { ok: false, error: "تاريخ الانتهاء غير صحيح." };
  const affiliate = input.affiliate === "yes" || input.affiliate === "no" ? input.affiliate : "unsure";
  return { ok: true, value: {
    store_name, website_url, category, registration: optional(input.registration),
    contact_name, email, phone, offer_type, code: code || null, offer,
    terms: optional(input.terms), expires_on, affiliate,
  } };
}
