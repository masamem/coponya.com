import { fetchStoreSitemapPaths, sitemapXml } from "./storeSitemap";
import { siteBrand, siteBrandStructuredData } from "../client/src/lib/siteBrand";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { articles } from "../client/src/lib/articles";
const origin = siteBrand.origin;
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const shell = readFileSync("dist/public/index.html", "utf8");
const routes = [
  { path: "/", title: siteBrand.title, description: siteBrand.description, body: "" },
  { path: "/stores", title: "المتاجر — كوبونيا", description: "ابحث عن متجرك المفضل وتصفح كوبوناته وشروطه.", body: "" },
  { path: "/coupons", title: "الكوبونات — كوبونيا", description: "اكتشف أكواد الخصم واقرأ الشروط قبل استخدام الكوبون.", body: "" },
  { path: "/categories", title: "تصنيفات التسوق — كوبونيا", description: "تصفح الكوبونات حسب اهتماماتك.", body: "" },
  { path: "/deals", title: "العروض — كوبونيا", description: "تصفح العروض المتاحة وتحقق من تفاصيلها قبل الشراء.", body: "" },
  { path: "/blog", title: "المدونة — كوبونيا", description: "أدلة أصلية تساعدك على استخدام الكوبونات ومقارنة العروض.", body: articles.map(a => `<article><h2><a href="/blog/${a.slug}">${escape(a.title)}</a></h2><p>${escape(a.description)}</p></article>`).join("") },
  ...articles.map(a => ({ path: `/blog/${a.slug}`, title: `${a.title} — كوبونيا`, description: a.description,
    body: a.sections.map(([h, p]) => `<section><h2>${escape(h)}</h2><p>${escape(p)}</p></section>`).join("") })),
];
const nav = '<nav aria-label="التنقل الرئيسي"><a href="/">كوبونيا</a> · <a href="/stores">المتاجر</a> · <a href="/coupons">الكوبونات</a> · <a href="/categories">التصنيفات</a> · <a href="/blog">المدونة</a></nav>';
for (const route of routes) {
  const url = origin + route.path;
  const article = articles.find(a => route.path === `/blog/${a.slug}`);
  const schema = article ? { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, inLanguage: "ar", author: { "@type": "Organization", name: "كوبونيا" }, mainEntityOfPage: url } : { "@context": "https://schema.org", "@type": "WebPage", name: route.title, url, inLanguage: "ar" };
  const brandMarkup = route.path === "/" ? `<script id="site-brand-schema" type="application/ld+json">${JSON.stringify(siteBrandStructuredData()).replace(/</g, "\\u003c")}</script>` : "";
  const html = shell.replace(/<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(route.description)}"/>`)
    .replace("</head>", `${brandMarkup}<meta property="og:site_name" content="${escape(siteBrand.name)}"/><link rel="canonical" href="${url}"/><meta property="og:title" content="${escape(route.title)}"/><meta property="og:description" content="${escape(route.description)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="${article ? "article" : "website"}"/><meta property="og:locale" content="ar_SA"/><script id="store-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root"><div dir="rtl" class="container catalog-page">${nav}<main><h1>${escape(route.title)}</h1><p>${escape(route.description)}</p>${route.body}</main></div></div>`);
  const directory = `dist/public${route.path === "/" ? "" : route.path}`;
  mkdirSync(directory, { recursive: true }); writeFileSync(`${directory}/index.html`, html);
}
const storePaths = await fetchStoreSitemapPaths(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
writeFileSync("dist/public/sitemap.xml", sitemapXml(origin, [...routes.map(route => route.path), ...storePaths]));
console.log(`Included ${storePaths.length} active store URLs in sitemap.`);

writeFileSync("dist/public/robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /favorites\nDisallow: /search\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated ${routes.length} public HTML pages and sitemap.`);
