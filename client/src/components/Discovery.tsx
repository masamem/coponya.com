import { useEffect, useState } from "react";
import { Link } from "wouter";
import { articles } from "@/lib/articles";
import { applyPageMetadata } from "@/lib/pageMetadata";
import { useCatalog } from "@/contexts/CatalogContext";
import { matchesSearch, type Coupon } from "@/lib/catalog";
import { CouponCard } from "./CouponCard";

export function ArticleCards({ items = articles }: { items?: typeof articles }) {
  return <div className="article-grid">{items.map(a => <article className="article-card" key={a.slug}>
    <span className="eyebrow">{a.category} · دليل كوبونيا</span><h2><Link href={`/blog/${a.slug}`}>{a.title}</Link></h2>
    <p>{a.description}</p><Link className="text-link" href={`/blog/${a.slug}`}>اقرأ الدليل ←</Link>
  </article>)}</div>;
}

export default function Discovery({ location, favorites, onFavorite, onReveal }: {
  location: string; favorites: string[]; onFavorite: (code: string) => void; onReveal: (coupon: Coupon) => void;
}) {
  const { stores, coupons, categories } = useCatalog();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const article = articles.find(a => location === `/blog/${a.slug}`);
  const search = location === "/search";
  const title = search ? "ابحث في كوبونيا" : article?.title || (location === "/blog" ? "دليل التوفير" : "الصفحة غير موجودة");
  const description = search ? "اعثر على متجر أو كوبون أو تصنيف أو دليل في مكان واحد." : article?.description || "أدلة أصلية تساعدك على فهم الكوبونات ومقارنة العروض.";
  useEffect(() => {
    applyPageMetadata(`${title} — كوبونيا`, description, location, {
      noindex: search || (location !== "/blog" && !article),
      structuredData: article ? { "@context": "https://schema.org", "@type": "Article", headline: article.title,
        description: article.description, inLanguage: "ar", author: { "@type": "Organization", name: "كوبونيا" },
        mainEntityOfPage: `https://coponya.com/blog/${article.slug}` } : undefined,
    });
  }, [title, description, location, article, search]);
  const foundStores = query.trim() ? stores.filter(s => matchesSearch(s.name, query)) : [];
  const foundCoupons = query.trim() ? coupons.filter(c => matchesSearch(`${c.store} ${c.title} ${c.code} ${c.category}`, query)) : [];
  const foundCategories = query.trim() ? categories.filter(c => matchesSearch(c[0], query)) : [];
  const foundArticles = articles.filter(a => matchesSearch(`${a.title} ${a.description} ${a.category}`, query));
  const count = foundStores.length + foundCoupons.length + foundCategories.length + (query.trim() ? foundArticles.length : 0);
  return <section className="catalog-page container">
    <nav className="breadcrumbs" aria-label="مسار التصفح"><Link href="/">الرئيسية</Link><span>/</span>{article && <><Link href="/blog">دليل التوفير</Link><span>/</span></>}<span aria-current="page">{title}</span></nav>
    <div className="page-heading"><span className="eyebrow">كوبونيا · اختيارات أوضح</span><h1>{title}</h1><p>{description}</p></div>
    {search ? <>
      <form role="search" onSubmit={e => { e.preventDefault(); window.history.replaceState(null, "", `/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }}>
        <label className="catalog-search"><input id="discovery-search" type="search" aria-label="البحث الشامل" placeholder="اسم متجر، كود، تصنيف أو دليل" value={query} onChange={e => setQuery(e.target.value)} maxLength={120}/><button className="button button--primary">بحث</button></label>
      </form>
      <p className="results-count" role="status">{query.trim() ? `${count} نتيجة` : "اكتب كلمة للبحث في جميع الأقسام"}</p>
      {foundStores.length > 0 && <><h2>المتاجر</h2><div className="discovery-links">{foundStores.map(s => <Link key={s.name} href={`/stores/${encodeURIComponent(s.name)}`}>{s.name} ←</Link>)}</div></>}
      {foundCategories.length > 0 && <><h2>التصنيفات</h2><div className="discovery-links">{foundCategories.map(c => <Link key={c[0]} href={`/categories/${encodeURIComponent(c[0])}`}>{c[0]} ←</Link>)}</div></>}
      {foundCoupons.length > 0 && <><h2>الكوبونات</h2><div className="coupon-grid">{foundCoupons.map(c => <CouponCard key={`${c.store}:${c.code}`} coupon={c} favorite={favorites.includes(c.code)} onFavorite={() => onFavorite(c.code)} onReveal={onReveal}/>)}</div></>}
      {query.trim() && foundArticles.length > 0 && <><h2>الأدلة</h2><ArticleCards items={foundArticles}/></>}
      {query.trim() && count === 0 && <div className="catalog-empty"><h2>لا توجد نتائج مطابقة</h2><p>جرّب اسم المتجر أو كلمة أقصر.</p><button className="button button--outline" onClick={() => { setQuery(""); window.history.replaceState(null, "", "/search"); }}>مسح البحث</button></div>}
    </> : article ? <>
      <article className="guide-article"><nav aria-label="محتويات الدليل"><h2>في هذا الدليل</h2>{article.sections.map(([heading], i) => <a key={heading} href={`#section-${i}`}>{heading}</a>)}</nav>
        {article.sections.map(([heading, body], i) => <section id={`section-${i}`} key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
        <Link className="button button--primary" href="/coupons">تصفح الكوبونات</Link>
      </article><h2>أدلة أخرى</h2><ArticleCards items={articles.filter(a => a.slug !== article.slug)}/>
    </> : location === "/blog" ? <ArticleCards/> : <Link href="/blog" className="button button--primary">تصفح الأدلة</Link>}
  </section>;
}
