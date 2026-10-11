import { useCatalog } from "@/contexts/CatalogContext";
import { useEffect, useState } from "react";
import {
  backendRequest,
  backendRows,
  type ArticleRecord,
  type StoreRecord,
} from "@/lib/backend";
import { articleMetadata, articlePath } from "@/lib/seo";
const blank: ArticleRecord = {
  id: "",
  title: "",
  slug: "",
  description: "",
  body: "",
  seo_title: "",
  meta_description: "",
  keywords: "",
  store_id: null,
  published: false,
};
export default function SeoManager({
  token,
  stores,
}: {
  token: string;
  stores: StoreRecord[];
}) {
  const { reload } = useCatalog();
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [article, setArticle] = useState(blank);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    setArticles(
      await backendRows<ArticleRecord>(
        "/rest/v1/articles?select=*&order=created_at.desc",
        { token },
      ),
    );
  }
  useEffect(() => {
    void load().catch(() =>
      setNotice("تعذر تحميل المقالات. تحقق من تطبيق إعدادات قاعدة البيانات."),
    );
  }, [token]);
  return (
    <>
      <form
        className="content-panel support-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setNotice("");
          try {
            const { id, created_at, previous_slugs, ...body } = article;
            await backendRequest(
              `/rest/v1/articles${id ? `?id=eq.${encodeURIComponent(id)}` : ""}`,
              { method: id ? "PATCH" : "POST", token, body },
            );
            setArticle(blank);
            await load();
            reload();
            setNotice("تم حفظ المقال.");
          } catch (e) {
            setNotice(e instanceof Error ? e.message : "تعذر الحفظ");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>SEO Manager — المقالات</h2>
        <p>
          المحتوى نفسه يظهر على الجوال والكمبيوتر. اكتب وصفاً مفيداً، وتجنب
          تكرار المقالات أو حشو الكلمات.
        </p>
        <label>
          عنوان المقال
          <input
            required
            maxLength={160}
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
          />
        </label>
        <label>
          الرابط المختصر
          <input
            required
            maxLength={120}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            dir="ltr"
            value={article.slug}
            onChange={(e) => setArticle({ ...article, slug: e.target.value })}
          />
          <small>
            حروف إنجليزية صغيرة وأرقام وشرطات. الروابط السابقة تتحول إلى
            المعتمد.
          </small>
        </label>
        {(
          [
            ["description", "وصف المقال", 300],
            ["body", "نص المقال", 40000],
            ["seo_title", "SEO title", 120],
            ["meta_description", "Meta description", 300],
            ["keywords", "كلمات مفتاحية للتخطيط التحريري", 1000],
          ] as const
        ).map(([key, label, max]) => (
          <label key={key}>
            {label}
            <textarea
              rows={key === "body" ? 12 : 3}
              required={key === "body" || key === "description"}
              maxLength={max}
              value={article[key]}
              onChange={(e) =>
                setArticle({ ...article, [key]: e.target.value })
              }
            />
          </label>
        ))}
        <label>
          متجر مرتبط
          <select
            value={article.store_id || ""}
            onChange={(e) =>
              setArticle({ ...article, store_id: e.target.value || null })
            }
          >
            <option value="">بدون متجر</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="seo-preview">
          <small>معاينة تقريبية لنتيجة البحث</small>
          <p dir="ltr">coponya.com{articlePath(article)}</p>
          <h3>{articleMetadata(article).title}</h3>
          <p>{articleMetadata(article).description}</p>
        </div>
        <fieldset>
          <legend>مقترحات AI</legend>
          <button type="button" disabled className="button button--outline">
            المزوّد غير مربوط
          </button>
          <p>
            لا يوجد مزوّد مدعوم في إعدادات المشروع. نقطة الربط المستقبلية: واجهة
            خادم موثقة تتحقق من صلاحية المدير؛ تُراجع المقترحات قبل الحفظ.
          </p>
        </fieldset>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={article.published}
            onChange={(e) =>
              setArticle({ ...article, published: e.target.checked })
            }
          />
          نشر المقال بعد مراجعة المحتوى
        </label>
        <button disabled={busy} className="button button--primary">
          حفظ المقال
        </button>
        <button
          type="button"
          className="text-link"
          onClick={() => setArticle(blank)}
        >
          إلغاء التعديل
        </button>
        {notice && <p role="status">{notice}</p>}
      </form>
      <div className="admin-list">
        {articles.map((a) => (
          <article key={a.id} className="content-panel">
            <h2>{a.title}</h2>
            <p>{a.published ? "منشور" : "مسودة"}</p>
            <button
              disabled={busy}
              className="button button--outline"
              onClick={() => setArticle(a)}
            >
              تعديل SEO والمحتوى
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
