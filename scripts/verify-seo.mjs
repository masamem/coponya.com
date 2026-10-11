// Run after pnpm build. Public REST fixtures exercise the actual production handler.
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
const store = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "متجر اختبار",
  slug: "test-store",
  previous_slugs: ["old-store"],
  initial: "م",
  tone: "olive",
  website_url: "https://example.com",
  active: true,
  summary: "نبذة مفيدة",
  about: "وصف فريد للمتجر",
  faq: "كيف أستخدم الكود؟\nأدخله قبل الدفع.",
  seo_title: "عنوان المتجر",
  meta_description: "وصف البحث للمتجر",
};
const coupon = {
  id: "22222222-2222-4222-8222-222222222222",
  store_id: store.id,
  title: "عرض اختبار",
  description: "وصف العرض",
  discount: "10%",
  code: "TEST",
  category: "أزياء",
  terms: "شروط العرض الفعلية",
  expires_at: "2099-01-01",
  published: true,
  seo_title: "عنوان الكوبون",
  meta_description: "وصف البحث للكوبون",
};
const article = {
  id: "33333333-3333-4333-8333-333333333333",
  slug: "test-guide",
  previous_slugs: ["old-guide"],
  title: "دليل اختبار",
  description: "وصف المقال",
  body: "محتوى المقال الفريد\n\n</script><script>alert(1)</script>",
  seo_title: "عنوان المقال",
  meta_description: "وصف البحث للمقال",
  keywords: "تحرير فقط",
  store_id: store.id,
  published: true,
  created_at: "2026-10-01T00:00:00Z",
};
let fail = false;
const backend = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (fail) {
    res.statusCode = 500;
    return res.end("{}");
  }
  const table = new URL(req.url, "http://localhost").pathname.split("/").at(-1);
  res.end(
    JSON.stringify(
      { stores: [store], coupons: [coupon], articles: [article] }[table] || [],
    ),
  );
});
backend.listen(0, "127.0.0.1");
await once(backend, "listening");
process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${backend.address().port}`;
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "public-fixture";
const { default: app } = await import("../dist/index.js");
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const [path, title, body] of [
    [`/stores/${store.slug}`, store.seo_title, store.about],
    [`/coupons/${coupon.id}`, coupon.seo_title, coupon.terms],
    [
      `/articles/${article.slug}`,
      article.seo_title,
      article.body.split("\n")[0],
    ],
  ]) {
    const mobile = await fetch(base + path, {
      headers: { "User-Agent": "Mobile Googlebot" },
    });
    const m = await mobile.text();
    const desktop = await fetch(base + path, {
      headers: { "User-Agent": "Desktop Googlebot" },
    });
    const d = await desktop.text();
    assert.equal(mobile.status, 200);
    assert.equal(m, d, "same mobile and desktop HTML");
    assert.match(m, new RegExp(`<title>${title}</title>`));
    assert.ok(m.includes(body));
    assert.ok(m.includes(`https://coponya.com${path}`));
    assert.ok(m.includes("application/ld+json"));
    assert.ok(m.includes("index,follow"));
    assert.ok(
      !m.includes("</script><script>alert(1)</script>"),
      "escaped admin content and initial JSON",
    );
  }
  for (const [path, target] of [
    ["/stores/old-store", "/stores/test-store"],
    ["/articles/old-guide", "/articles/test-guide"],
    ["/stores/test-store/", "/stores/test-store"],
    ["/index.html", "/"],
  ]) {
    const r = await fetch(base + path, { redirect: "manual" });
    assert.equal(r.status, 301);
    assert.equal(r.headers.get("location"), target);
  }
  const missing = await fetch(base + "/articles/nonexistent");
  assert.equal(missing.status, 404);
  assert.ok((await missing.text()).includes("noindex,follow"));
  const privatePage = await fetch(base + "/favorites");
  assert.ok((await privatePage.text()).includes("noindex,follow"));
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  assert.ok(sitemap.includes("/stores/test-store"));
  assert.ok(sitemap.includes(`/coupons/${coupon.id}`));
  assert.ok(sitemap.includes("/articles/test-guide"));
  assert.ok(!sitemap.includes("old-store"));
  assert.ok(!sitemap.includes("/admin"));
  const robots = await (await fetch(base + "/robots.txt")).text();
  assert.ok(robots.includes("Sitemap: https://coponya.com/sitemap.xml"));
  delete process.env.VITE_SUPABASE_URL;
  const demo = await fetch(base + "/");
  assert.ok((await demo.text()).includes("noindex,follow"));
  assert.ok(
    !(await (await fetch(base + "/sitemap.xml")).text()).includes("<loc>"),
  );
  process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${backend.address().port}`;
  fail = true;
  const { default: outageApp } = await import("../dist/index.js?outage-test");
  const outageServer = outageApp.listen(0, "127.0.0.1");
  await once(outageServer, "listening");
  try {
    const outage = await fetch(
      `http://127.0.0.1:${outageServer.address().port}/stores/test-store`,
    );
    assert.equal(outage.status, 503);
    assert.equal(outage.headers.get("retry-after"), "60");
  } finally {
    outageServer.close();
  }
  console.log(
    "PASS: initial HTML content/metadata/schema, mobile-desktop parity, XSS escaping, canonical redirects, HTTP 404/noindex, sitemap, robots",
  );
} finally {
  server.close();
  backend.close();
}
