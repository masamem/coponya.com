import { useEffect } from "react";
import { Link } from "wouter";
import { useCatalog } from "@/contexts/CatalogContext";
import { applyPageMetadata } from "@/lib/pageMetadata";
import { articleMetadata, articlePath, articleSchema } from "@/lib/seo";
export default function Articles({ location }: { location: string }) {
  const { articles, stores, loading, isLive } = useCatalog();
  let slug = "";
  try {
    slug = decodeURIComponent(location.split("/")[2] || "");
  } catch {}
  const article = articles.find(
    (a) =>
      location.split("/").length === 3 &&
      (a.slug === slug || a.previous_slugs?.includes(slug)),
  );
  const store = stores.find((s) => s.id === article?.store_id);
  useEffect(() => {
    const meta = article
      ? articleMetadata(article)
      : {
          title: "دليل التوفير والمقالات | كوبونيا",
          description:
            "اقرأ أدلة التسوق واستخدام الكوبونات، وتعرّف على شروط العروض قبل الشراء.",
        };
    applyPageMetadata(
      meta.title,
      meta.description,
      article ? articlePath(article) : location,
      {
        noindex: !isLive || (!!slug && !article),
        structuredData: article ? articleSchema(article) : undefined,
      },
    );
  }, [location, article, isLive]);
  return (
    <section className="catalog-page container" dir="rtl">
      <nav className="breadcrumbs">
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/articles">المقالات</Link>
      </nav>
      {article ? (
        <article className="store-article">
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          {article.body
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          {store && (
            <Link
              className="text-link"
              href={`/stores/${encodeURIComponent(store.slug || store.name)}`}
            >
              كوبونات {store.name}
            </Link>
          )}
        </article>
      ) : (
        <>
          <div className="page-heading">
            <h1>
              {loading
                ? "جارٍ التحميل…"
                : slug
                  ? "المقال غير موجود"
                  : "دليل التوفير والمقالات"}
            </h1>
          </div>
          {!slug &&
            articles.map((a) => (
              <article className="content-panel" key={a.id}>
                <h2>
                  <Link href={articlePath(a)}>{a.title}</Link>
                </h2>
                <p>{a.description}</p>
              </article>
            ))}
        </>
      )}
    </section>
  );
}
