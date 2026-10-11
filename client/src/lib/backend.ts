export const backendUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
export const backendConfigured = Boolean(backendUrl && publicKey);
export type StoreRecord = { id: string; name: string; initial: string; tone: string; website_url: string; active: boolean; summary?: string; about?: string; products?: string; shipping?: string; payment?: string; returns_policy?: string; faq?: string; logo_url?: string; seo_title?: string; meta_description?: string; primary_keyword?: string; supporting_keywords?: string; long_tail_keywords?: string; article_ideas?: string; slug?: string; previous_slugs?: string[] };
export type CouponRecord = { seo_title?: string; meta_description?: string; id: string; store_id: string; title: string; description: string; discount: string; code: string; category: string; terms: string; expires_at: string | null; published: boolean; verified_at: string | null };
export type ArticleRecord = { id: string; title: string; slug: string; description: string; body: string; seo_title: string; meta_description: string; keywords: string; store_id: string | null; published: boolean; created_at?: string; previous_slugs?: string[] };
export class BackendError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function backendRequest<T>(path: string, options: { method?: string; body?: unknown; token?: string; signal?: AbortSignal } = {}): Promise<T> {
  if (!backendConfigured) throw new Error("ربط قاعدة البيانات لم يُفعّل بعد.");
  const response = await fetch(`${backendUrl}${path}`, {
    method: options.method || "GET", signal: options.signal,
    headers: { apikey: publicKey, ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), "Content-Type": "application/json", Prefer: "return=representation" },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) {
    if (response.status === 401) throw new BackendError("انتهت الجلسة أو بيانات الدخول غير صحيحة. سجل الدخول مجدداً.", 401);
    if (response.status === 403) throw new Error("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
    if (response.status === 409) throw new Error("الاسم أو كود الخصم موجود بالفعل.");
    throw new Error("تعذر تنفيذ الطلب. تحقق من الاتصال وإعدادات قاعدة البيانات.");
  }
  return response.status === 204 ? undefined as T : response.json();
}

export async function backendRows<T>(path: string, options: { token?: string; signal?: AbortSignal } = {}): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const batch = await backendRequest<T[]>(`${path}${path.includes('?') ? '&' : '?'}limit=500&offset=${offset}`, options);
    result.push(...batch);
    if (batch.length < 500) return result;
  }
}
