import { findStoreBySegment, storePath } from "@/lib/storeSlug";
import { legalPages, legalUpdated, type LegalPage } from "@/lib/legal";
import { navigate } from "wouter/use-browser-location";
import { CategoryIcon } from "@/components/CategoryIcon";
import { applyPageMetadata } from "@/lib/pageMetadata";
import { storeMetadata, storeStructuredData } from "@/lib/storeSeo";
import { StoreLogo } from "@/components/StoreLogo";
import TopOffers from "@/components/TopOffers";
/* سوق الضوء: searchable store pages and readable Arabic metadata. */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Heart, SlidersHorizontal, Tag, BadgeCheck, Target, type LucideIcon } from "lucide-react";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  type Coupon,
  matchesSearch,
  readSaved,
  saveLocal,
} from "@/lib/catalog";
import { CouponCard } from "@/components/CouponCard";
import { StoreOverview, StoreArticle } from "@/components/StoreProfile";
import SubmitCoupon from "@/components/SubmitCoupon";

const pages: Record<string, [string, string]> = {
  ...Object.fromEntries(Object.entries(legalPages).map(([path, page]) => [path, [page.title, page.description] as [string, string]])),
  "/submit-coupon": [
    "أضف كوبونك",
    "شارك عرضك مع فريق كوبونيا ليصل إلى المزيد من المتسوقين.",
  ],
  "/stores": ["كل المتاجر", "ابدأ بمتجرك المفضل واكتشف الكوبونات المتاحة."],
  "/coupons": [
    "تصفح الكوبونات",
    "ابحث عن كود أو متجر، واختر التصنيف المناسب لك.",
  ],
  "/deals": ["عروض تستحقّ المشاهدة", "اكتشف العروض والكوبونات، وتعرّف على التفاصيل قبل التسوق."],
  "/categories": ["التصنيفات", "كل اهتماماتك، في مكان واحد."],
  "/favorites": [
    "كوبوناتك المفضلة",
    "اختياراتك محفوظة في هذا المتصفح على هذا الجهاز.",
  ],
  "/account": [
    "مساحتك الشخصية",
    "خصص تجربتك واحفظ اسمك محلياً على هذا الجهاز.",
  ],
  "/contact": [
    "تواصل معنا",
    "جهز رسالتك ثم انسخها لإرسالها عبر قناة الدعم عند توفرها.",
  ],
  "/report": [
    "الإبلاغ عن كوبون",
    "جهز تفاصيل المشكلة لمشاركتها مع فريق الدعم.",
  ],
  "/faq": ["الأسئلة الشائعة", "إجابات سريعة لتجربة أوضح."],
  "/how-it-works": [
    "طريقة استخدام الكوبونات",
    "من البحث إلى الدفع، خطوة بخطوة.",
  ],
};
const faqs = [
  [
    "كيف أنسخ الكود؟",
    "اضغط على عرض الكود ثم نسخ الكود. إذا منع المتصفح النسخ، حدد النص وانسخه يدوياً.",
  ],
  [
    "هل هذه الأكواد حقيقية؟",
    "الأكواد والمتاجر الحالية أمثلة توضيحية لتجربة الموقع. لا توجد عروض فعلية مؤكدة في هذه النسخة.",
  ],
  [
    "أين تحفظ المفضلة؟",
    "تحفظ محلياً في هذا المتصفح. لا تنتقل إلى جهاز آخر، وقد تختفي عند حذف بيانات الموقع.",
  ],
  [
    "لماذا لا أجد كوبوناً في تصنيف ما؟",
    "يعرض الموقع الكوبونات المتاحة فقط. بعض التصنيفات لا تحتوي على أمثلة حالياً.",
  ],
  [
    "هل أحتاج إلى إنشاء حساب؟",
    "لا. التصفح والبحث والحفظ متاحة مباشرة. صفحة حسابي تحفظ الاسم محلياً ولا تنشئ حساباً على خادم.",
  ],
];

const sectionIcons: Record<string, LucideIcon> = { "كوبونيا": Tag, "ما تقدّمه كوبونيا": BadgeCheck, "أهدافنا": Target };

function LegalContent({ page, icons }: { page: LegalPage; icons?: Record<string, LucideIcon> }) {
  return (
    <div className="content-panel legal-content">
      <p className="legal-updated">آخر تحديث: {legalUpdated}</p>
      {page.sections.map(([heading, blocks]) => (
        <section key={heading}>
          {(() => { const Icon = icons?.[heading]; return Icon
            ? <h2 className="legal-heading--icon"><span className="legal-heading__icon" aria-hidden="true"><Icon size={18} /></span>{heading}</h2>
            : <h2>{heading}</h2>; })()}
          {blocks.map((block, i) => Array.isArray(block)
            ? <ul key={i}>{block.map(item => <li key={item}>{item}</li>)}</ul>
            : <p key={i}>{block}</p>)}
        </section>
      ))}
    </div>
  );
}

function SupportForm({ report }: { report: boolean }) {
  const [ready, setReady] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <div className="content-panel">
      <p>
        لم يتم ربط قناة إرسال في هذه النسخة. هذا النموذج يجهز نص الرسالة فقط ولا
        يرسل بياناتك.
      </p>
      <form
        className="support-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setCopied(false);
          setReady(
            `${report ? "بلاغ عن كوبون" : "رسالة إلى كوبونيا"}\nالاسم: ${form.get("name")}\nالبريد: ${form.get("email")}\n${report ? `الكود: ${form.get("code")}\n` : ""}الرسالة: ${form.get("message")}`,
          );
        }}
      >
        <label>
          الاسم
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          البريد الإلكتروني
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
          />
        </label>
        {report && (
          <label>
            كود الخصم
            <input
              name="code"
              required
              dir="ltr"
              maxLength={80}
              defaultValue={
                new URLSearchParams(window.location.search).get("code") || ""
              }
            />
          </label>
        )}
        <label>
          {" "}
          {report ? "ما المشكلة؟" : "رسالتك"}
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
          />
        </label>
        <button className="button button--primary">
          تجهيز الرسالة <ArrowLeft size={16} />
        </button>
      </form>
      {ready && (
        <div className="prepared-message" role="status">
          <h2>الرسالة جاهزة — لم تُرسل بعد</h2>
          <textarea
            aria-label="الرسالة الجاهزة"
            readOnly
            value={ready}
            rows={7}
          />
          <button
            className="button button--outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(ready);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "تم النسخ" : "نسخ الرسالة"}
          </button>
          <p>يمكنك أيضاً تحديد النص ونسخه يدوياً.</p>
        </div>
      )}
    </div>
  );
}

function Profile() {
  const [name, setName] = useState(() => {
    const saved = readSaved<unknown>("sahm-name", "");
    return typeof saved === "string" ? saved : "";
  });
  const [notice, setNotice] = useState("");
  return (
    <div className="content-panel">
      <h2>أهلاً {name || "بك"} 👋</h2>
      <p>
        يمكنك استخدام المفضلة بدون تسجيل. الاسم محفوظ محلياً فقط، ولا توجد
        مزامنة أو خدمة تسجيل دخول.
      </p>
      <form
        className="support-form"
        onSubmit={(e) => {
          e.preventDefault();
          setNotice(
            saveLocal("sahm-name", name.trim())
              ? "تم حفظ الاسم على هذا الجهاز."
              : "تعذر الحفظ. تحقق من إعدادات المتصفح.",
          );
        }}
      >
        <label>
          اسمك
          <input
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button className="button button--primary">حفظ الاسم</button>
      </form>
      <p role="status">{notice}</p>
      <Link className="button button--outline" href="/favorites">
        تصفح المفضلة <Heart size={16} />
      </Link>
    </div>
  );
}

export default function CatalogPage({
  location,
  favorites,
  onFavorite,
  onReveal,
}: {
  location: string;
  favorites: string[];
  onFavorite: (code: string) => void;
  onReveal: (coupon: Coupon) => void;
}) {
  const { coupons, stores, categories, isLive, loading } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  useEffect(() => {
    setQuery("");
    setCategory("all");
    setSort("default");
  }, [location]);
  let detail = "";
  try {
    detail = decodeURIComponent(location.split("/")[2] || "");
  } catch {
    /* handled as missing page */
  }
  const storeMatch = location.startsWith("/stores/")
    ? findStoreBySegment(stores, detail)
    : { store: undefined, legacy: false };
  const store = storeMatch.store;
  useEffect(() => {
    // Old links used the full encoded store name; move them to the short URL.
    if (store && storeMatch.legacy) navigate(storePath(store.name), { replace: true });
  }, [store, storeMatch.legacy]);
  const categoryDetail = location.startsWith("/categories/")
    ? categories.find((c) => c[0] === detail)
    : undefined;
  const livePages: Record<string, [string,string]> = {
    "/deals": ["عروض تستحقّ المشاهدة", "اكتشف العروض والكوبونات، وتعرّف على التفاصيل قبل التسوق."],
  };
  const info = store
    ? [store.name, isLive ? "الكوبونات المتاحة لهذا المتجر وشروط استخدامها." : "الكوبونات والعروض المتاحة لهذا المتجر التجريبي."]
    : categoryDetail
      ? [categoryDetail[0], "تصفح الكوبونات المتاحة في هذا التصنيف."]
      : (loading && location.startsWith("/stores/") ? ["جارٍ تحميل المتجر", "نحمّل معلومات المتجر وكوبوناته…"] : (isLive && livePages[location]) || pages[location]);
  useEffect(() => {
    const metadata = store ? storeMetadata(store) : {
      title: `${info?.[0] || "الصفحة غير موجودة"} — Coponya · كوبونيا`,
      description: `${info?.[0] || "كوبونيا"}: ${info?.[1] || "تصفح المتاجر والكوبونات والعروض."}`,
    };
    applyPageMetadata(metadata.title, metadata.description, location, {
      noindex: !info || ["/favorites", "/account", "/report", "/submit-coupon"].includes(location) || !!store && !isLive,
      structuredData: store && isLive ? storeStructuredData(store, window.location.origin) : undefined,
    });
  }, [location, isLive, store, info?.[0], info?.[1]]);
  const isCoupons =
    ["/coupons", "/favorites"].includes(location) ||
    !!store ||
    !!categoryDetail;
  const filtered = coupons
    .filter(
      (c) =>
        (location !== "/favorites" || favorites.includes(c.code)) &&
        (!store || c.store === store.name) &&
        (!categoryDetail || c.category === categoryDetail[0]) &&
        (category === "all" || c.category === category) &&
        matchesSearch(`${c.store} ${c.title} ${c.code}`, query),
    )
    .sort((a, b) =>
      sort === "discount" ? parseFloat(b.discount) - parseFloat(a.discount) : 0,
    );
  return (
    <section className="catalog-page container">
      <nav className="breadcrumbs" aria-label="مسار التصفح">
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        {store&&<><Link href="/stores">المتاجر</Link><span>/</span></>}
        <span>{info?.[0] || "الصفحة غير موجودة"}</span>
      </nav>
      {location === "/about" ? <div className="about-hero">
        <img className="about-hero__logo" src="/brand/coponya-logo.svg?v=20261030-colors" alt="كوبونيا Coponya" width="1356" height="535" />
        <h1 className="sr-only">من نحن</h1>
      </div> : store ? <StoreOverview store={store} couponCount={coupons.filter(c=>c.store===store.name).length}/> : <div className="page-heading">
        {location !== "/about" && <span className="eyebrow">كوبونيا · أوفر لك، أسرع لك</span>}
        <h1>{info?.[0] || "الصفحة غير موجودة"}</h1>
        {location !== "/about" && <p>
          {info?.[1] || "ربما تغير الرابط. عد إلى الرئيسية أو تصفح الكوبونات."}
        </p>}
      </div>}
      {!info && (
        <Link href="/" className="button button--primary">
          العودة للرئيسية
        </Link>
      )}
      {isCoupons && (
        <>
          {store&&<h2 id="store-coupons" className="store-section-title">كوبونات {store.name}</h2>}
          <div className="catalog-toolbar">
            <label className="catalog-search">
              <Search size={20} />
              <input
                id="catalog-search"
                aria-label="ابحث عن كوبون"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اسم المتجر أو كود الخصم"
              />
            </label>
            <label className="filter-label">
              <SlidersHorizontal size={17} />
              <select
                aria-label="التصنيف"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">كل التصنيفات</option>
                {categories.map((c) => (
                  <option key={c[0]}>{c[0]}</option>
                ))}
              </select>
            </label>
            <select
              aria-label="ترتيب الكوبونات"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="discount">الأعلى خصماً</option>
            </select>
          </div>
          <p className="results-count" aria-live="polite">
            {filtered.length} كوبون
          </p>
          <div className="coupon-grid">
            {filtered.map((c) => (
              <CouponCard
                key={c.code}
                coupon={c}
                favorite={favorites.includes(c.code)}
                onFavorite={() => onFavorite(c.code)}
                onReveal={onReveal}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="catalog-empty">
              <Search size={32} />
              <h2>
                {location === "/favorites" && !favorites.length
                  ? "لم تحفظ أي كوبون بعد"
                  : store ? "لا توجد كوبونات متاحة لهذا المتجر حالياً" : "لا توجد كوبونات مطابقة"}
              </h2>
              <p>
                {location === "/favorites" && !favorites.length
                  ? "اضغط على القلب بجانب الكوبون لإضافته هنا."
                  : store ? "يمكنك قراءة دليل المتجر أدناه أو تصفح كوبونات المتاجر الأخرى." : "جرّب كلمة أخرى أو تصنيفاً مختلفاً."}
              </p>
              <button
                className="button button--outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                مسح البحث والفلاتر
              </button>
              <Link className="text-link" href="/coupons">
                تصفح كل الكوبونات <ArrowLeft size={16} />
              </Link>
            </div>
          )}
        </>
      )}
      {store&&<StoreArticle store={store} related={stores.filter(s=>s.name!==store.name).slice(0,4)}/>}
      {location === "/stores" && (
        <>
          <p className="results-count">{stores.length} متجر · {coupons.length} كوبون متاح</p>
          <label className="catalog-search">
            <Search size={20} />
            <input
              id="catalog-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المتجر"
              aria-label="ابحث باسم المتجر"
            />
          </label>
          <label className="filter-label">ترتيب المتاجر
            <select aria-label="ترتيب المتاجر" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">حسب الاسم</option><option value="available">الأكثر كوبونات</option>
            </select>
          </label>
          <div className="all-stores">
            {stores
              .filter((s) => matchesSearch(s.name, query))
              .sort((a, b) => sort === "available"
                ? coupons.filter(c => c.store === b.name).length - coupons.filter(c => c.store === a.name).length
                : a.name.localeCompare(b.name, "ar"))
              .map((s) => (
                <Link
                  href={storePath(s.name)}
                  key={s.name}
                  className="store-card"
                >
                  <StoreLogo initial={s.initial} tone={s.tone} logoUrl={s.logoUrl}/>
                  <strong>{s.name}</strong>
                  <span>
                    {coupons.filter((c) => c.store === s.name).length} كوبون
                  </span>
                  <small>
                    تصفح الكوبونات <ArrowLeft size={14} />
                  </small>
                </Link>
              ))}
          </div>
          {!stores.some((s) => matchesSearch(s.name, query)) && (
            <div className="catalog-empty">
              <h2>لم نجد هذا المتجر</h2>
              <button
                className="button button--outline"
                onClick={() => setQuery("")}
              >
                مسح البحث
              </button>
            </div>
          )}
        </>
      )}
      {location === "/categories" && (
        <div className="category-grid">
          {categories.map(([name]) => (
            <Link
              href={`/categories/${encodeURIComponent(name)}`}
              className="category-card"
              key={name}
            >
              <CategoryIcon name={name} />
              <strong>{name}</strong>
              <small>
                {coupons.filter((c) => c.category === name).length} كوبون
              </small>
              <ArrowLeft size={15} />
            </Link>
          ))}
        </div>
      )}
      {location === "/deals" && <TopOffers onReveal={onReveal}/>}
      {location === "/submit-coupon" && <SubmitCoupon />}
      {location === "/account" && <Profile />}
      {["/contact", "/report"].includes(location) && (
        <SupportForm key={location} report={location === "/report"} />
      )}
      {location === "/faq" && (
        <div className="faq-list">
          {(isLive ? [
            ["كيف أنسخ الكود؟", "اضغط نسخ الكود من البطاقة. اقرأ الشروط قبل استخدامه، وتحقق من الخصم عند الدفع."],
            ["كيف تتم مراجعة الأكواد؟", "تظهر علامة المراجعة فقط عندما يحدد فريق الإدارة أنه راجع الكود. صلاحية الخصم النهائية تعتمد على شروط المتجر."],
            ["أين تحفظ المفضلة؟", "تحفظ على هذا المتصفح والجهاز، وقد تختفي عند حذف بيانات الموقع."],
            ["هل أحتاج إلى حساب؟", "لا تحتاج إلى حساب للتصفح أو النسخ. تسجيل الدخول مخصص للإدارة حالياً."],
          ] : faqs).map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      )}
      {location === "/how-it-works" && (
        <div className="content-panel">
          <ol className="guide-list">
            <li>
              <h2>اختر المتجر أو التصنيف</h2>
              <p>تصفح المتاجر أو استخدم البحث للوصول إلى الكوبون المناسب.</p>
            </li>
            <li>
              <h2>اقرأ التفاصيل وانسخ الكود</h2>
              <p>
                افتح الكوبون، واقرأ الشروط، ثم انسخ الكود. يمكنك حفظه في
                المفضلة.
              </p>
            </li>
            <li>
              <h2>تحقق من العرض عند الدفع</h2>
              <p>
                في العروض الحقيقية، أدخل الكود لدى المتجر وتأكد من ظهور الخصم
                قبل الدفع. {!isLive && "الأكواد الحالية تجريبية."}
              </p>
            </li>
          </ol>
          <Link href="/coupons" className="button button--primary">
            استكشف الكوبونات
          </Link>
        </div>
      )}
      {legalPages[location] && <LegalContent page={legalPages[location]} icons={location === "/about" ? sectionIcons : undefined} />}
    </section>
  );
}

