import Discovery, { ArticleCards } from "@/components/Discovery";
import CouponDialog from "@/components/CouponDialog";
import { applyPageMetadata } from "@/lib/pageMetadata";
import { StoreLogo } from "@/components/StoreLogo";
import { RiyalAmount } from "@/components/RiyalAmount";
/* سوق الضوء: Arabic editorial commerce, Coponya Olive + apricot, verification-led hierarchy, RTL-first. */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

import { toast } from "sonner";
import CatalogPage from "./CatalogPage";
import { CouponCard } from "@/components/CouponCard";
import { useCatalog } from "@/contexts/CatalogContext";
const Admin = lazy(() => import("./Admin"));
import { matchesSearch, readSaved, saveLocal } from "@/lib/catalog";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Ticket,
  TrendingUp,
  Twitter,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const logoUrl = "/brand/coponya-logo.svg?v=20261019-1";
const heroUrl = "/brand/seasonal/merchant-gifts-2026.webp";
const spotlightUrl =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663890167905/YhatHEeNFLBL9m3u6y3Nwp/sahm-savings-spotlight-knrB4G87CxRHwAHAo2WEjz.webp";

function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand-mark ${compact ? "brand-mark--compact" : ""} ${inverse ? "brand-mark--inverse" : ""}`}
      aria-label="كوبونيا، الرئيسية"
    >
      <img className="brand-mark__logo" src={inverse ? "/brand/coponya-footer.svg?v=20261019-1" : logoUrl} alt="كوبونيا Coponya" width="1356" height="535" />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  link = "عرض الكل",
  href = "/coupons",
}: {
  eyebrow?: string;
  title: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div className="heading-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      <Link className="text-link" href={href}>
        {link}
        <ArrowLeft size={16} />
      </Link>
    </div>
  );
}

function BannerSlideshow() {
  const [active, setActive] = useState(1);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const changeSlide = (direction: number) => setActive((current) => (current + direction + 4) % 4);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % 4), 3000);
    return () => window.clearInterval(timer);
  }, [paused]);
  return (
    <section className="hero-visual hero-slideshow" aria-label="بنرات كوبونيا" aria-roledescription="عرض شرائح"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={(event) => { if (touchStart !== null) { const distance = event.changedTouches[0].clientX - touchStart; if (Math.abs(distance) > 45) changeSlide(distance > 0 ? 1 : -1); } setTouchStart(null); }}>
                <Link href="/deals" className="hero-slide hero-slide--original seasonal-slide festive-slide" hidden={active !== 0}>
                  <img src={heroUrl} alt="" width="1200" height="600" fetchPriority="high"/>
                  <div className="festive-slide__heading"><span>اختيارات الموسم مع كوبونيا</span><h2>كل موسم<br/>له اختياراته</h2><span className="festive-slide__cta">استكشف العروض <ArrowLeft size={15}/></span></div>
                  <div className="festive-slide__brands" aria-label="نون، ماتش للعطور، أمازون، ترينديول">{[{id:"noon",name:"نون"},{id:"match",name:"ماتش للعطور"},{id:"amazon",name:"أمازون"},{id:"trendyol",name:"ترينديول"}].map(brand => <span key={brand.id}><img src={`/brand/merchants/${brand.id}.png`} alt="" width="32" height="32"/><strong>{brand.name}</strong></span>)}</div>
                </Link>
              <Link href="/stores/noon%20-%20%D9%86%D9%88%D9%86" className="hero-slide discovery-banner noon-slide" hidden={active !== 1}>
                <img className="noon-slide__logo" src="/brand/merchants/noon.png" alt="نون" width="64" height="64"/>
                <span className="discovery-banner__eyebrow">كوبونات نون على كوبونيا</span>
                <h2>استرداد نقدي 10% من نون بحد أقصى 75 ريال</h2>
                <p>تعرّف على تفاصيل الكوبون وشروط الاستخدام.</p>
                <span className="discovery-banner__cta">شاهد كوبونات نون <ArrowLeft size={17}/></span>
              </Link>
              <Link href="/categories/المنزل" className="hero-slide discovery-banner discovery-banner--orange" hidden={active !== 2}>
                <span className="discovery-banner__eyebrow">وقت اللمسات الدافئة</span>
                <h2>جدّد أجواء بيتك للموسم</h2>
                <p>قارن الاختيارات وتصفح كوبونات المنزل المتاحة.</p>
                <span className="discovery-banner__cta">كوبونات المنزل <ArrowLeft size={17} /></span>
                <Store className="discovery-banner__art" aria-hidden="true" />
              </Link>
              <Link href="/categories/السفر" className="hero-slide discovery-banner discovery-banner--cream" hidden={active !== 3}>
                <span className="discovery-banner__eyebrow">طلعات وأجواء ألطف</span>
                <h2>خطّط لرحلتك القادمة بذكاء</h2>
                <p>استكشف كوبونات السفر وراجع التفاصيل قبل الحجز.</p>
                <span className="discovery-banner__cta">كوبونات السفر <ArrowLeft size={17} /></span>
                <Heart className="discovery-banner__art" aria-hidden="true" />
              </Link>

      <div className="hero-slideshow__controls">
        <button type="button" aria-label="البنر السابق" onClick={() => changeSlide(-1)}><ChevronRight size={18} /></button>
        <div className="hero-slideshow__dots" role="group" aria-label="اختيار البنر">
          {["اختيارات الموسم", "عرض نون", "المنزل", "السفر"].map((label, index) => (
            <button key={label} type="button" aria-label={label} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />
          ))}
        </div>
        <button type="button" aria-label="البنر التالي" onClick={() => changeSlide(1)}><ChevronLeft size={18} /></button>
      </div>
    </section>
  );
}

export default function Home() {
  const [location, navigate] = useLocation();
  const { stores, coupons, categories, deals, isLive, loading, error, reload } = useCatalog();
  const [query, setQuery] = useState("");
  const [modalCoupon, setModalCoupon] = useState<
    (typeof coupons)[number] | null
  >(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = readSaved<unknown>("sahm-favorites", []);
    return Array.isArray(saved)
      ? saved.filter((v): v is string => typeof v === "string")
      : [];
  });
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    saveLocal("sahm-favorites", favorites);
  }, [favorites]);
  useEffect(() => {
    setMenuOpen(false);
    setModalCoupon(null);
    setQuery("");
    window.scrollTo(0, 0);
    if (location === "/" || location === "/admin") {
      applyPageMetadata(location === "/admin" ? "إدارة كوبونيا" : "Coponya — كوبونيا | كوبونات وعروض السعودية",
        "كوبونيا — اكتشف الكوبونات والعروض وتصفح المتاجر واحفظ اختياراتك المفضلة.", location,
        { noindex: location === "/admin" });
    }
  }, [location]);
  const couponTrigger = useRef<HTMLElement | null>(null);
  const openCoupon = (coupon: (typeof coupons)[number]) => {

    couponTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalCoupon(coupon);
  };
  const goSearch = () => {
    navigate("/search");
    window.setTimeout(() => document.getElementById("discovery-search")?.focus(), 100);
  };

  const filteredCoupons = useMemo(
    () =>
      query.trim()
        ? coupons.filter((coupon) =>
            matchesSearch(
              `${coupon.store} ${coupon.title} ${coupon.code}`,
              query,
            ),
          )
        : coupons,
    [query, coupons],
  );
  const matchingStores = query.trim()
    ? stores.filter((store) => matchesSearch(store.name, query))
    : [];
  const toggleFavorite = (name: string) =>
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  if (location === "/admin") return <Suspense fallback={<p className="container" role="status">جارٍ تحميل لوحة الإدارة…</p>}><Admin /></Suspense>;
  return (
    <div dir="rtl" className="app-shell">
      <a className="skip-link" href="#main-content">
        تجاوز إلى المحتوى
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <button
            className="mobile-menu-button icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <BrandMark />
          <nav
            id="main-nav"
            className={`main-nav ${menuOpen ? "main-nav--open" : ""}`}
            aria-label="التنقل الرئيسي"
          >
            <Link href="/" aria-current={location === "/" ? "page" : undefined}>
              الرئيسية
            </Link>
            <Link
              href="/stores"
              aria-current={location === "/stores" ? "page" : undefined}
            >
              المتاجر
            </Link>
            <Link
              href="/coupons"
              aria-current={location === "/coupons" ? "page" : undefined}
            >
              الكوبونات
            </Link>
            <Link
              href="/deals"
              aria-current={location === "/deals" ? "page" : undefined}
            >
              العروض <span className="nav-new">جديد</span>
            </Link>
            <Link
              href="/categories"
              aria-current={location === "/categories" ? "page" : undefined}
            >
              التصنيفات
            </Link>
            <Link href="/blog" aria-current={location.startsWith("/blog") ? "page" : undefined}>المدونة</Link>
          </nav>
          <div className="header-actions">
            <Link
              href="/submit-coupon"
              className="button button--primary button--small submit-nav-link"
            >
              أضف كوبونك
            </Link>
            <button
              className="header-search-button"
              onClick={goSearch}
              aria-label="ابحث عن متجر أو كوبون"
            >
              <Search size={18} />
              <span>ابحث عن متجر أو كوبون...</span>
            </button>
            <button
              className="icon-button header-icon"
              aria-label="المفضلة"
              onClick={() => navigate("/favorites")}
            >
              <Heart size={19} />
            </button>
            <button
              className="icon-button header-icon"
              aria-label="الحساب"
              onClick={() => navigate("/account")}
            >
              <UserRound size={19} />
            </button>
          </div>
        </div>
      </header>

      {!isLive && <div className="demo-banner">نسخة تجريبية — المتاجر والأكواد أمثلة للتصفح وليست عروضاً مؤكدة.</div>}
      {loading && <p className="catalog-notice" role="status">جارٍ تحميل المتاجر والكوبونات…</p>}
      {error && <div className="catalog-notice" role="alert">{error} <button onClick={reload} className="text-link">إعادة المحاولة</button></div>}
      <main id="main-content" tabIndex={-1}>
        {location === "/search" || location === "/blog" || location.startsWith("/blog/") ? (
          <Discovery key={location} location={location} favorites={favorites} onFavorite={toggleFavorite} onReveal={openCoupon}/>
        ) : location !== "/" ? (
          <CatalogPage
            location={location}
            favorites={favorites}
            onFavorite={toggleFavorite}
            onReveal={openCoupon}
          />
        ) : (
          <>
            <section className="hero-section">
              <div className="hero-texture" />
              <div className="container hero-grid">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <Sparkles size={15} /> وجهتك الأذكى للتوفير
                  </span>
                  <h1>
                    وفر أكثر مع
                    <br />
                    <em>أحدث أكواد الخصم</em>
                  </h1>
                  <p>
                    اكتشف أفضل كوبونات وأكواد الخصم لمتاجرك المفضلة في السعودية،
                    في تجربة سهلة وواضحة.
                  </p>
                  <form
                    className="hero-search"
                    role="search"
                    onSubmit={(e) => {
                      e.preventDefault();
                      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                  >
                    <Search size={21} />
                    <input
                      aria-label="ابحث عن متجر أو كوبون"
                      id="hero-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="ابحث عن متجر أو كود خصم..."
                    />
                    <button type="submit">
                      ابحث عن كوبون <ArrowLeft size={17} />
                    </button>
                  </form>
                  {query.trim() && (
                    <div className="search-discovery">
                      <p role="status">{matchingStores.length} متجر · {filteredCoupons.length} كوبون مطابق</p>
                      {matchingStores.length > 0 && (
                        <nav aria-label="المتاجر المطابقة للبحث">
                          {matchingStores.map((store) => (
                            <Link key={store.name} href={`/stores/${encodeURIComponent(store.name)}`}>
                              <Store size={16} /> {store.name} <ArrowLeft size={14} />
                            </Link>
                          ))}
                        </nav>
                      )}
                      <button className="text-link" onClick={() => setQuery("")}>مسح البحث <X size={14} /></button>
                    </div>
                  )}
                  <div className="hero-proof">
                    <div className="proof-avatars">
                      <span>أ</span>
                      <span>ر</span>
                      <span>ن</span>
                      <span>+</span>
                    </div>
                    <span>
                      <strong>بخطوة واحدة</strong> احفظ كوبونك المفضل
                    </span>
                  </div>
                </div>
                <BannerSlideshow />
              </div>
              <div className="hero-stats container">
                <div>
                  <strong>{coupons.length}</strong>
                  <span>{isLive ? "كوبونات متاحة" : "أكواد تجريبية"}</span>
                </div>
                <div>
                  <strong>{stores.length}</strong>
                  <span>{isLive ? "متاجر متاحة" : "متاجر تجريبية"}</span>
                </div>
                <div>
                  <strong>{categories.length}</strong>
                  <span>تصنيفات</span>
                </div>
                <div>
                  <strong>بسهولة</strong>
                  <span>بحث وحفظ</span>
                </div>
              </div>
            </section>

            <section className="section stores-section">
              <div className="container">
                <SectionHeading
                  eyebrow="ابدأ من هنا"
                  title="أشهر المتاجر"
                  link="عرض جميع المتاجر"
                  href="/stores"
                />
                <div className="store-rail">
                  {stores.map((store) => (
                    <Link
                      href={`/stores/${encodeURIComponent(store.name)}`}
                      className="store-card"
                      key={store.name}
                    >
                      <div className="store-card__head">
                        <div className="store-visual">
                          <StoreLogo
                            initial={store.initial}
                            logoUrl={store.logoUrl}
                            tone={store.tone}
                          />
                          <span className="store-mini-badge">
                            <Tag size={10} /> {isLive ? "متجر" : "تجريبي"}
                          </span>
                        </div>
                        <ChevronLeft size={18} className="store-arrow" />
                      </div>
                      <strong>{store.name}</strong>
                      <span>
                        {coupons.filter((c) => c.store === store.name).length}{" "}
                        كوبون
                      </span>
                      <small>
                        خصم يصل إلى <b>{store.discount}</b>
                      </small>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="section coupons-section" id="coupons">
              <div className="container">
                <div className="coupon-intro">
                  <div>
                    <SectionHeading
                      eyebrow="مختارة لك اليوم"
                      title="أفضل كوبونات اليوم"
                      link="كل الكوبونات"
                    />
                    <p>
                      {isLive ? "اقرأ الشروط واختر الكوبون المناسب، واحفظه للوصول إليه بسرعة." : "استكشف الأكواد التجريبية، واحفظ اختياراتك للوصول إليها بسرعة."}
                    </p>
                  </div>
                  <img src={spotlightUrl} alt="رسوم تجريدية لقسائم التوفير" />
                </div>
                <div className="coupon-grid">
                  {filteredCoupons.length ? (
                    filteredCoupons.map((coupon) => (
                      <CouponCard
                        key={coupon.code}
                        coupon={coupon}
                        onReveal={openCoupon}
                        favorite={favorites.includes(coupon.code)}
                        onFavorite={() => toggleFavorite(coupon.code)}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <Search size={28} />
                      <strong>{loading ? "جارٍ تحميل الكوبونات" : "لا توجد كوبونات متاحة"}</strong>
                      <span>جرّب البحث باسم متجر آخر.</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="section categories-section">
              <div className="container">
                <SectionHeading
                  eyebrow="تسوّق على طريقتك"
                  title="تصفح حسب التصنيف"
                  link="جميع التصنيفات"
                  href="/categories"
                />
                <div className="category-grid">
                  {categories.map(([name, count, icon]) => (
                    <Link
                      href={`/categories/${encodeURIComponent(name)}`}
                      className="category-card"
                      key={name}
                    >
                      <span className="category-icon">
                        {icon}
                        <i>كوبونيا</i>
                      </span>
                      <strong>{name}</strong>
                      <small>
                        {coupons.filter((c) => c.category === name).length}{" "}
                        كوبون
                      </small>
                      <ArrowLeft size={15} />
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="section deals-section">
              <div className="container">
                <SectionHeading
                  eyebrow="فرص لا تفوّت"
                  title="أحدث العروض"
                  link="مشاهدة كل العروض"
                  href="/deals"
                />
                <div className="deal-grid">
                  {deals.map((deal) => (
                    <article
                      className={`deal-card deal-card--${deal.tone}`}
                      key={deal.title}
                    >
                      <div className="deal-art">
                        <div className="deal-art__disc" />
                        <span className="deal-art__ticket">
                          <Tag size={18} />
                        </span>
                      </div>
                      <div className="deal-content">
                        <span>{deal.brand}</span>
                        <h3>
                          {deal.title} <b>{deal.discount}</b>
                        </h3>
                        <div className="price-row">
                          <strong><RiyalAmount value={deal.newPrice} /></strong>
                          <del><RiyalAmount value={deal.oldPrice} /></del>
                        </div>
                        <button
                          className="button button--outline button--small"
                          onClick={() =>
                            navigate(
                              `/stores/${encodeURIComponent(deal.brand)}`,
                            )
                          }
                        >
                          مشاهدة العرض <ArrowLeft size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="how-section">
              <div className="container">
                <div className="how-copy">
                  <span className="eyebrow">ثلاث خطوات فقط</span>
                  <h2>التوفير صار أسهل</h2>
                  <p>
                    من أول بحث إلى آخر خطوة عند الدفع، نخلّي تجربة الكوبون واضحة
                    وسريعة.
                  </p>
                  <Link href="/coupons" className="button button--light">
                    استكشف الكوبونات <ArrowLeft size={16} />
                  </Link>
                </div>
                <div className="steps">
                  <div className="step">
                    <span>01</span>
                    <Store size={23} />
                    <strong>اختر المتجر</strong>
                    <p>ابحث عن متجرك المفضل وتصفح عروضه.</p>
                  </div>
                  <div className="step">
                    <span>02</span>
                    <Copy size={23} />
                    <strong>انسخ كود الخصم</strong>
                    <p>اختر الكود الأنسب لك وانسخه بضغطة.</p>
                  </div>
                  <div className="step">
                    <span>03</span>
                    <ShoppingBagIcon />
                    <strong>استخدمه عند الدفع</strong>
                    <p>الصق الكود واستمتع بتوفيرك.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section"><div className="container"><SectionHeading title="اقرأ قبل أن تتسوق" eyebrow="المدونة" href="/blog" link="كل الأدلة"/><ArticleCards limit={3}/></div></section>
            <section className="newsletter-section">
              <div className="container newsletter-inner">
                <div>
                  <span className="eyebrow">عروضك في مكان واحد</span>
                  <h2>احتفظ بالكوبونات التي تهمك</h2>
                  <p>
                    اضغط على القلب للعودة إلى اختياراتك لاحقاً من هذا الجهاز.
                  </p>
                </div>
                <Link href="/favorites" className="button button--primary">
                  المفضلة <Heart size={18} />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <BrandMark inverse />
            <p>
              كوبونيا يساعدك تجد الكوبون المناسب في الوقت المناسب، لتتسوق بذكاء
              وتوفّر أكثر.
            </p>
            <nav aria-label="حسابات كوبونيا على التواصل الاجتماعي" className="flex flex-wrap gap-4">
              <a href="https://www.instagram.com/coponya.sa/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Instagram — يفتح في نافذة جديدة">Instagram <span dir="ltr">@coponya.sa</span></a>
              <a href="https://www.tiktok.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على TikTok — يفتح في نافذة جديدة">TikTok <span dir="ltr">@coponya</span></a>
            </nav>
          </div>
          <div>
            <h3>عن الموقع</h3>
            <Link href="/about">من نحن</Link>
            <Link href="/contact">تواصل معنا</Link>
            <Link href="/submit-coupon">أضف كوبونك</Link>
            <Link href="/privacy">سياسة الخصوصية</Link>
            <Link href="/terms">الشروط والأحكام</Link>
          </div>
          <div>
            <h3>الكوبونات</h3>
            <Link href="/coupons">أحدث الكوبونات</Link>
            <Link href="/stores">أشهر المتاجر</Link>
            <Link href="/deals">العروض</Link>
            <Link href="/categories">التصنيفات</Link>
          </div>
          <div>
            <h3>مساعدة</h3>
            <Link href="/blog">المدونة</Link>
            <Link href="/search">البحث الشامل</Link>
            <Link href="/faq">الأسئلة الشائعة</Link>
            <Link href="/how-it-works">طريقة استخدام الكوبونات</Link>
            <Link href="/report">الإبلاغ عن كوبون</Link>
            <Link href="/admin">لوحة الإدارة</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} كوبونيا. جميع الحقوق محفوظة.
          </span>
          <span>
            صُنع في السعودية <span className="saudi-dot" />
          </span>
        </div>
      </footer>

      <div className="mobile-bottom-nav">
        <Link href="/" aria-current={location === "/" ? "page" : undefined}>
          <Store size={18} />
          <span>الرئيسية</span>
        </Link>
        <Link href="/stores" aria-current={(location === "/stores" || location.startsWith("/stores/")) ? "page" : undefined}>
          <Tag size={18} />
          <span>المتاجر</span>
        </Link>
        <button onClick={goSearch}>
          <Search size={22} />
          <span>بحث</span>
        </button>
        <Link href="/favorites" aria-current={(location === "/favorites" || location.startsWith("/favorites/")) ? "page" : undefined}>
          <Heart size={18} />
          <span>المفضلة</span>
        </Link>
        <Link href="/account" aria-current={(location === "/account" || location.startsWith("/account/")) ? "page" : undefined}>
          <UserRound size={18} />
          <span>حسابي</span>
        </Link>
      </div>

      <CouponDialog coupon={modalCoupon} onClose={() => setModalCoupon(null)} returnFocusTo={couponTrigger.current}/>
    </div>
  );
}

function ShoppingBagIcon() {
  return <span className="custom-step-icon">⌂</span>;
}
