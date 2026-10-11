import express from "express";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import type {
  StoreRecord,
  CouponRecord,
  ArticleRecord,
} from "../client/src/lib/backend";
const app = express();
const root = process.cwd();
const staticPath = path.join(root, "dist/public");
const origin = "https://coponya.com";
let cached:
  | {
      expires: number;
      promise: Promise<[StoreRecord[], CouponRecord[], ArticleRecord[]]>;
    }
  | undefined;
function publicCatalog() {
  if (!cached || cached.expires < Date.now()) {
    const promise = Promise.all([
      rows<StoreRecord>("stores", "active=eq.true&order=id"),
      rows<CouponRecord>("coupons", "published=eq.true&order=id"),
      rows<ArticleRecord>("articles", "published=eq.true&order=id"),
    ]);
    cached = { expires: Date.now() + 60000, promise };
    promise.catch(() => {
      cached = undefined;
    });
  }
  return cached.promise;
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");
// Only anonymous/public reads: never render administrator or draft data.
async function rows<T>(table: string, query: string): Promise<T[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const response = await fetch(
      `${url}/rest/v1/${table}?select=*&${query}&limit=500&offset=${offset}`,
      { headers: { apikey: key! }, signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok)
      throw new Error(`Public catalog unavailable: ${response.status}`);
    const batch = (await response.json()) as T[];
    result.push(...batch);
    if (batch.length < 500) return result;
  }
}
app.use(
  "/assets",
  express.static(path.join(staticPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }),
);
app.get("/index.html", (_req, res) => res.redirect(301, "/"));
app.use(express.static(staticPath, { index: false }));
app.get("/robots.txt", (_req, res) =>
  res
    .type("text/plain")
    .send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
);
app.get("*", async (req, res) => {
  try {
    const entry = await import(
      pathToFileURL(path.join(root, "dist/ssr/entry.js")).href
    );
    const live = Boolean(
      process.env.VITE_SUPABASE_URL &&
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
    const [storeRows, couponRows, articles] = live
      ? await publicCatalog()
      : [[], [], []];
    const initial = {
      ...(live
        ? entry.mapCatalog(storeRows, couponRows)
        : { stores: entry.stores, coupons: entry.coupons }),
      articles,
      isLive: live,
    };
    const storePath = (s: { slug?: string; name: string }) =>
      `/stores/${encodeURIComponent(s.slug || s.name)}`;
    const publicPaths = [
      "/",
      "/stores",
      "/coupons",
      "/categories",
      "/articles",
      "/about",
      "/how-it-works",
      "/faq",
    ];
    if (req.path === "/sitemap.xml") {
      const paths = live
        ? [
            ...publicPaths,
            ...initial.stores.map(storePath),
            ...initial.coupons.map((c: { id: string }) => `/coupons/${c.id}`),
            ...articles.map((a) => `/articles/${encodeURIComponent(a.slug)}`),
            ...entry.categories.map(
              (c: string[]) => `/categories/${encodeURIComponent(c[0])}`,
            ),
          ]
        : [];
      return res
        .type("application/xml")
        .send(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map((p) => `<url><loc>${escape(origin + p)}</loc></url>`).join("")}</urlset>`,
        );
    }
    let pathname: string;
    try {
      pathname = decodeURIComponent(req.path);
    } catch {
      return res.status(400).send("Invalid URL");
    }
    const normalized = pathname.replace(/\/$/, "") || "/";
    const store = initial.stores.find(
      (s: { slug?: string; name: string; previousSlugs?: string[] }) =>
        normalized === `/stores/${s.slug || s.name}` ||
        normalized === `/stores/${s.name}` ||
        !!s.previousSlugs?.some((alias) => normalized === `/stores/${alias}`),
    );
    const article = articles.find(
      (a) =>
        normalized === `/articles/${a.slug}` ||
        a.previous_slugs?.some((alias) => normalized === `/articles/${alias}`),
    );
    const coupon = initial.coupons.find(
      (c: { id: string }) => normalized === `/coupons/${c.id}`,
    );
    const category = entry.categories.find(
      (c: string[]) => normalized === `/categories/${c[0]}`,
    );
    const canonical = store
      ? storePath(store)
      : article
        ? `/articles/${encodeURIComponent(article.slug)}`
        : category
          ? `/categories/${encodeURIComponent(category[0])}`
          : normalized;
    if (
      (store && normalized !== `/stores/${store.slug || store.name}`) ||
      (article && normalized !== `/articles/${article.slug}`) ||
      pathname !== normalized
    )
      return res.redirect(301, canonical);
    const known =
      normalized === "/" ||
      normalized === "/admin" ||
      normalized === "/articles" ||
      !!entry.pages[normalized] ||
      store ||
      article ||
      category ||
      coupon;
    const noindex =
      !live ||
      !known ||
      [
        "/admin",
        "/favorites",
        "/account",
        "/report",
        "/submit-coupon",
        "/contact",
        "/privacy",
        "/terms",
      ].includes(normalized);
    const meta = coupon
      ? entry.couponMetadata(coupon)
      : store
        ? entry.storeMetadata(store)
        : article
          ? entry.articleMetadata(article)
          : {
              title:
                normalized === "/"
                  ? "Coponya — كوبونيا | كوبونات وعروض السعودية"
                  : `${category?.[0] || entry.pages[normalized]?.[0] || (normalized === "/articles" ? "دليل التوفير والمقالات" : "الصفحة غير موجودة")} | كوبونيا`,
              description:
                entry.pages[normalized]?.[1] ||
                "كوبونيا — اكتشف الكوبونات والعروض وتصفح المتاجر واقرأ شروط كل عرض قبل الشراء.",
            };
    const schema =
      coupon && live
        ? entry.couponSchema(coupon)
        : store && live
          ? entry.storeStructuredData(store, origin)
          : article
            ? entry.articleSchema(article)
            : null;
    let html = await readFile(path.join(staticPath, "index.html"), "utf8");
    html = html
      .replace(/<title>.*?<\/title>/s, `<title>${escape(meta.title)}</title>`)
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${escape(meta.description)}" />`,
      );
    html = html.replace(
      "</head>",
      `<link rel="canonical" href="${escape(origin + canonical)}"/><meta name="robots" content="${noindex ? "noindex,follow" : "index,follow"}"/><meta property="og:title" content="${escape(meta.title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:url" content="${escape(origin + canonical)}"/><meta property="og:type" content="website"/>${schema ? `<script id="store-schema" type="application/ld+json">${json(schema)}</script>` : ""}</head>`,
    );
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${entry.render(canonical, initial)}</div><script>window.__CATALOG__=${json(initial)}</script>`,
    );
    res
      .status(known ? 200 : 404)
      .set("Cache-Control", "public, max-age=0, s-maxage=60")
      .type("html")
      .send(html);
  } catch (error) {
    console.error(
      "SEO rendering unavailable",
      error instanceof Error ? error.message : "Unknown error",
    );
    res
      .status(503)
      .set("Retry-After", "60")
      .send("الموقع غير متاح مؤقتاً. حاول مجدداً.");
  }
});
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  app.listen(Number(process.env.PORT || 3000));
export default app;
