import { applyPageMetadata } from "@/lib/pageMetadata";
import { storeMetadata, storeStructuredData } from "@/lib/storeSeo";
import { StoreLogo } from "@/components/StoreLogo";
import { RiyalAmount } from "@/components/RiyalAmount";
/* سوق الضوء: searchable store pages and readable Arabic metadata. */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Heart, SlidersHorizontal } from "lucide-react";
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
  "/submit-coupon": [
    "أضف كوبونك",
    "شارك عرضك مع فريق كوبونيا ليصل إلى المزيد من المتسوقين.",
  ],
  "/stores": ["كل المتاجر", "ابدأ بمتجرك المفضل واكتشف الكوبونات المتاحة."],
  "/coupons": [
    "تصفح الكوبونات",
    "ابحث عن كود أو متجر، واختر التصنيف المناسب لك.",
  ],
  "/deals": ["العروض", "استكشف العروض التجريبية وتفاصيل كل متجر."],
  "/categories": ["التصنيفات", "كل اهتماماتك، في مكان واحد."],
  "/favorites": [
    "كوبوناتك المفضلة",
    "اختياراتك محفوظة في هذا المتصفح على هذا الجهاز.",
  ],
  "/account": [
    "مساحتك الشخصية",
    "خصص تجربتك واحفظ اسمك محلياً على هذا الجهاز.",
  ],
  "/about": ["عن كوبونيا", "تجربة عربية تساعدك على اكتشاف فرص التوفير."],
  "/contact": [
    "تواصل معنا",
    "جهز رسالتك ثم انسخها لإرسالها عبر قناة الدعم عند توفرها.",
  ],
  "/report": [
    "الإبلاغ عن كوبون",
    "جهز تفاصيل المشكلة لمشاركتها مع فريق الدعم.",
  ],
  "/privacy": ["سياسة الخصوصية", "كيف تعمل هذه النسخة التجريبية مع بياناتك."],
  "/terms": ["الشروط والأحكام", "يرجى قراءة هذه المعلومات قبل استخدام الموقع."],
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
  const { coupons, stores, categories, deals, isLive, loading } = useCatalog();
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
  const store = location.startsWith("/stores/")
    ? stores.find((s) => s.name === detail)
    : undefined;
  const categoryDetail = location.startsWith("/categories/")
    ? categories.find((c) => c[0] === detail)
    : undefined;
  const livePages: Record<string, [string,string]> = {
    "/deals": ["العروض", "العروض المباشرة ستظهر عند إضافتها."],
    "/privacy": ["سياسة الخصوصية", "معلومات عن البيانات والخدمات المستخدمة."],
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
      {store ? <StoreOverview store={store} couponCount={coupons.filter(c=>c.store===store.name).length}/> : <div className="page-heading">
        <span className="eyebrow">كوبونيا · أوفر لك، أسرع لك</span>
        <h1>{info?.[0] || "الصفحة غير موجودة"}</h1>
        <p>
          {info?.[1] || "ربما تغير الرابط. عد إلى الرئيسية أو تصفح الكوبونات."}
        </p>
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
                  href={`/stores/${encodeURIComponent(s.name)}`}
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
          {categories.map(([name, , icon]) => (
            <Link
              href={`/categories/${encodeURIComponent(name)}`}
              className="category-card"
              key={name}
            >
              <span className="category-icon">{icon}</span>
              <strong>{name}</strong>
              <small>
                {coupons.filter((c) => c.category === name).length} كوبون
              </small>
              <ArrowLeft size={15} />
            </Link>
          ))}
        </div>
      )}
      {location === "/deals" && (
        <div className="deal-grid">
          {!deals.length && <p>لا توجد عروض مباشرة متاحة حالياً.</p>}
          {deals.map((d) => (
            <article className={`deal-card deal-card--${d.tone}`} key={d.brand}>
              <div className="deal-art">
                <div className="deal-art__disc" />
              </div>
              <div className="deal-content">
                <span>{d.brand} · عرض تجريبي</span>
                <h2>
                  {d.title} {d.discount}
                </h2>
                <div className="price-row">
                  <strong><RiyalAmount value={d.newPrice} /></strong>
                  <del><RiyalAmount value={d.oldPrice} /></del>
                </div>
                <Link
                  className="button button--outline"
                  href={`/stores/${encodeURIComponent(d.brand)}`}
                >
                  تفاصيل المتجر <ArrowLeft size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
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
      {location === "/about" && (
        <div className="content-panel">
          <h2>التوفير يبدأ باختيار واضح</h2>
          <p>
            كوبونيا واجهة عربية لتصفح المتاجر والكوبونات والعروض، والبحث حسب
            اهتماماتك، وحفظ اختياراتك المفضلة.
          </p>
          <p>
            {isLive ? "ينشر فريق الإدارة الكوبونات وشروطها. تحقق من الخصم النهائي لدى المتجر قبل الدفع." : "هذه نسخة تجريبية. بيانات المتاجر والأكواد أمثلة توضيحية ولم يتم ربط قاعدة البيانات بعد."}
          </p>
          <Link href="/coupons" className="button button--primary">
            ابدأ التصفح <ArrowLeft size={16} />
          </Link>
        </div>
      )}
      {location === "/privacy" && (
        <div className="content-panel">
          <h2>ملفات تعريف الارتباط (Cookies) وتحليل الزيارات</h2>
          <p>
            نستخدم Vercel Web Analytics لفهم أداء الموقع بشكل عام، مثل عدد
            الزوار والصفحات الأكثر زيارة، بهدف تحسين تجربتك. هذه الأداة لا
            تستخدم ملفات تعريف الارتباط (Cookies) للتحليل، ولا تجمع معرّفات
            شخصية لتتبّعك عبر المواقع المختلفة.
          </p>
          <h2>التحليلات الإضافية وقياس الإعلانات</h2>
          <p>عند ربط Google Analytics أو Google Ads أو Meta Pixel لفيسبوك وإنستغرام، لا تُشغّل هذه الأدوات إلا بعد موافقتك على الفئة المناسبة. قد تستخدم هذه الأدوات Cookies لقياس الزيارات ونتائج الإعلانات، وقد تعالج بيانات المتصفح والزيارة. حالياً، الأدوات التي لم تُربط بمعرّفات الحسابات تظل متوقفة حتى إذا وافقت عليها.</p>
          <p>يمكنك قبول الأدوات الاختيارية أو رفضها أو تخصيصها من إعدادات Cookies. يُحفظ اختيارك في التخزين المحلي لهذا المتصفح لمدة 180 يوماً، ويمكنك تغييره في أي وقت. سحب الموافقة يوقف التشغيل اللاحق، ولا يحذف البيانات التي سبق إرسالها إلى مزوّد الخدمة.</p>
          <h2>التخزين على جهازك</h2>
          <p>
            يحفظ الموقع أكواد المفضلة والاسم الاختياري في التخزين المحلي
            للمتصفح. هذا التخزين يختلف عن ملفات تعريف الارتباط، ويمكنك حذفه من
            إعدادات بيانات الموقع. لا تتم مزامنة هذه الاختيارات بين الأجهزة.
          </p>
          <h2>النماذج والخدمات الخارجية</h2>
          <p>
            نماذج التواصل والبلاغات تجهز رسالة فقط ولا ترسلها إلى خادم. يتم
            تحميل بعض الصور من خدمات خارجية، وقد تستقبل هذه الخدمات عنوان
            الشبكة ومعلومات المتصفح عند تحميل الملفات.
          </p>
          {isLive && <><h2>قاعدة البيانات والإدارة</h2><p>تُحمّل بيانات المتاجر والكوبونات من Supabase. تسجيل دخول الإدارة يُعالج بواسطة Supabase Auth، والجلسة محفوظة مؤقتاً في ذاكرة الصفحة. لا تُحفظ كلمة المرور محلياً.</p></>}
          <h2>قبل الإطلاق</h2>
          <p>
            تُحدّث هذه السياسة عند إضافة خدمات جديدة، مثل إرسال البريد أو
            حسابات المستخدمين، أو تغيير أدوات التحليل، مع إضافة بيانات المشغل
            وقناة التواصل.
          </p>
        </div>
      )}
      {location === "/terms" && (
        <div className="content-panel">
          <h2>طبيعة هذه النسخة</h2>
          <p>
            {isLive ? "يعرض الموقع الكوبونات التي ينشرها فريق الإدارة. تسري شروط المتجر ولا يضمن الموقع قبول الكود لكل طلب." : "الموقع عرض تجريبي. المتاجر والأكواد والأسعار الحالية أمثلة، ولا تمثل وعداً بخصم أو اتفاقاً مع متجر."}
          </p>
          <h2>استخدام العروض</h2>
          <p>
            عند إضافة عروض حقيقية، تسري شروط المتجر وتواريخ الصلاحية
            والاستثناءات. تحقق من السعر النهائي قبل إتمام أي طلب.
          </p>
          <h2>المحتوى والتواصل</h2>
          <p>
            قد تتغير البيانات والخصائص. لا توجد خدمة شراء أو دفع داخل الموقع،
            ونماذج الدعم الحالية لا ترسل رسائل.
          </p>
        </div>
      )}
    </section>
  );
}

