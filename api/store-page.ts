// Server-rendered <head> and readable content for /stores/:slug.
// vercel.json rewrites /stores/:slug here so search engines receive the store's own
// title, description, canonical URL and structured data instead of the homepage shell.
// The browser still boots the normal React app from the same HTML.
//
// Self-contained on purpose: Vercel functions cannot import extensionless TypeScript
// modules from client/. storeSlug.test.ts checks these copies match the client code.

const ORIGIN = "https://coponya.com";
const SITE_NAME = "كوبونيا";

type StoreRow = {
  id: string; name: string; active: boolean; summary?: string; about?: string; faq?: string;
  logo_url?: string; seo_title?: string; meta_description?: string;
};
type CouponRow = { title: string; discount: string; category: string; expires_at: string | null };

// ---- copied from client/src/lib/storeSlug.ts ----
export function storeSlug(name: string): string {
  const clean = name.normalize("NFKC").trim().toLowerCase();
  const [first, ...rest] = clean.split(/\s+-\s+/);
  const latinPrefix = rest.length > 0 && /^[a-z0-9][a-z0-9 .&'+]*$/.test(first) ? first : clean;
  return latinPrefix
    .replace(/&/g, " and ")
    .replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "store";
}
export function storePath(name: string): string {
  return `/stores/${encodeURIComponent(storeSlug(name))}`;
}

// ---- copied from client/src/lib/storeSeo.ts (defaults used by storeMetadata) ----
export function storeMetadata(store: { name: string; seoTitle?: string; metaDescription?: string; summary?: string }) {
  const name = store.name;
  const seoTitle = `كود خصم ${name} وكوبونات المتجر | كوبونيا`.slice(0, 120);
  const metaDescription = `تصفح كوبونات ${name} على كوبونيا، واقرأ شروط كل عرض وتاريخ انتهائه. انسخ كود الخصم وتحقق من تطبيقه على طلبك لدى المتجر قبل الدفع.`;
  return {
    title: store.seoTitle?.trim() || seoTitle,
    description: store.metaDescription?.trim() || store.summary?.trim() || metaDescription,
  };
}
function parseFaq(text = "") {
  return text.trim().split(/\n\s*\n/).map(block => {
    const [question, ...lines] = block.split("\n");
    return { question: question.trim(), answer: lines.join("\n").trim() };
  }).filter(item => item.question && item.answer);
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

let shellCache: { html: string; at: number } | undefined;
async function loadShell(origin: string): Promise<string> {
  if (shellCache && Date.now() - shellCache.at < 5 * 60_000) return shellCache.html;
  const response = await fetch(`${origin}/index.html`, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`Shell request failed: ${response.status}`);
  const html = await response.text();
  shellCache = { html, at: Date.now() };
  return html;
}

async function rest<T>(backend: string, key: string, path: string): Promise<T> {
  const response = await fetch(`${backend}${path}`, { headers: { apikey: key }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

/** Replaces the shell's homepage metadata with page-specific tags and readable content. */
export function renderStoreHtml(shell: string, page: { title: string; description: string; path: string; noindex?: boolean; schema?: unknown; body: string }) {
  const url = ORIGIN + page.path;
  const head = [
    `<link rel="canonical" href="${escapeHtml(url)}"/>`,
    `<meta name="robots" content="${page.noindex ? "noindex,follow" : "index,follow"}"/>`,
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:title" content="${escapeHtml(page.title)}"/>`,
    `<meta property="og:description" content="${escapeHtml(page.description)}"/>`,
    `<meta property="og:url" content="${escapeHtml(url)}"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:locale" content="ar_SA"/>`,
    `<meta name="twitter:card" content="summary"/>`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}"/>`,
    page.schema ? `<script id="store-schema" type="application/ld+json">${jsonLd(page.schema)}</script>` : "",
  ].join("");
  const withHead = shell
    // Remove tags the shell may already carry (homepage canonical, og:*, twitter:*, robots, brand schema).
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace(/<meta (?:property="og:[^"]*"|name="twitter:[^"]*"|name="robots")[^>]*>/g, "")
    .replace(/<script id="(?:site-brand-schema|store-schema)"[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(page.description)}"/>`)
    .replace("</head>", `${head}</head>`);
  return replaceRoot(withHead, page.body);
}

/** Swaps the contents of <div id="root"> by matching its own closing tag (the shell may hold nested markup). */
export function replaceRoot(html: string, body: string) {
  const open = '<div id="root">';
  const start = html.indexOf(open);
  if (start < 0) return html;
  const tags = /<div\b[^>]*>|<\/div>/g;
  tags.lastIndex = start + open.length;
  let depth = 1;
  for (let m = tags.exec(html); m; m = tags.exec(html)) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + open + body + html.slice(m.index);
  }
  return html;
}

const nav = '<nav aria-label="التنقل الرئيسي"><a href="/">كوبونيا</a> · <a href="/stores">المتاجر</a> · <a href="/coupons">الكوبونات</a> · <a href="/categories">التصنيفات</a> · <a href="/blog">المدونة</a></nav>';

export function storeBody(store: StoreRow, coupons: CouponRow[]) {
  const name = escapeHtml(store.name);
  const intro = escapeHtml(store.summary?.trim() || store.about?.trim().split("\n")[0] || `كوبونات ${store.name} المتاحة على كوبونيا مع شروطها وتواريخ انتهائها.`);
  const list = coupons.length
    ? `<ul>${coupons.map(c => `<li><strong>${escapeHtml(c.discount)}</strong> ${escapeHtml(c.title)}${c.expires_at ? ` — ينتهي ${escapeHtml(c.expires_at)}` : ""}</li>`).join("")}</ul>`
    : `<p>لا توجد كوبونات متاحة لهذا المتجر حالياً.</p>`;
  return `<div dir="rtl" class="container catalog-page">${nav}<main><nav aria-label="مسار التصفح"><a href="/">الرئيسية</a> / <a href="/stores">المتاجر</a> / ${name}</nav><h1>كوبونات ${name}</h1><p>${intro}</p><h2>الكوبونات المتاحة (${coupons.length})</h2>${list}<h2>كيف تستخدم كوبون ${name}؟</h2><ol><li>اختر كوبوناً متاحاً واقرأ شروطه وتاريخ انتهائه.</li><li>انسخ الكود وانتقل إلى موقع المتجر.</li><li>أدخل الكود في خانة الخصم عند الدفع، وتأكد من تغير الإجمالي قبل إتمام الطلب.</li></ol></main></div>`;
}

function html(body: string, status = 200, cache = "public, max-age=0, s-maxage=300, stale-while-revalidate=86400") {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": cache } });
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  let segment = "";
  try { segment = decodeURIComponent(requestUrl.searchParams.get("slug") || ""); } catch { /* treated as not found */ }

  let shell: string;
  try { shell = await loadShell(origin); }
  catch { return Response.redirect(`${origin}/`, 302); }

  const backend = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  // Preview builds without backend settings: serve the normal app shell.
  if (!backend || !key) return html(shell, 200, "no-store");

  try {
    const stores = await rest<StoreRow[]>(backend, key, "/rest/v1/stores?select=*&active=eq.true&order=name");
    const store = stores.find(s => storeSlug(s.name) === segment) || stores.find(s => s.name === segment);
    if (!store) {
      return html(renderStoreHtml(shell, {
        title: "المتجر غير موجود — كوبونيا", description: "لم نجد هذا المتجر. تصفح كل المتاجر على كوبونيا.",
        path: `/stores/${encodeURIComponent(segment)}`, noindex: true, body: "",
      }), 404, "public, max-age=0, s-maxage=60");
    }
    const path = storePath(store.name);
    if (decodeURIComponent(path.split("/")[2]) !== segment) {
      // Legacy /stores/<full encoded name> links move permanently to the short URL.
      return new Response(null, { status: 301, headers: { location: `${origin}${path}`, "cache-control": "public, s-maxage=3600" } });
    }
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Riyadh" }).format(new Date());
    const couponRows = await rest<CouponRow[]>(backend, key,
      `/rest/v1/coupons?select=title,discount,category,expires_at&published=eq.true&store_id=eq.${encodeURIComponent(store.id)}&order=created_at.desc`);
    const coupons = couponRows.filter(c => !c.expires_at || c.expires_at >= today);
    const meta = storeMetadata({ name: store.name, seoTitle: store.seo_title, metaDescription: store.meta_description, summary: store.summary });
    const url = ORIGIN + path;
    const faq = parseFaq(store.faq);
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": url, url, name: meta.title, description: meta.description, inLanguage: "ar" },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "المتاجر", item: `${ORIGIN}/stores` },
          { "@type": "ListItem", position: 3, name: store.name, item: url },
        ] },
        ...(faq.length ? [{ "@type": "FAQPage", "@id": `${url}#store-faq`, mainEntity: faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }] : []),
      ],
    };
    return html(renderStoreHtml(shell, { ...meta, path, schema, body: storeBody(store, coupons) }));
  } catch {
    // Backend trouble: fall back to the plain app shell rather than an error page.
    return html(shell, 200, "public, max-age=0, s-maxage=30");
  }
}
