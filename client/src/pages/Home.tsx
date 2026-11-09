import { storePath } from "@/lib/storeSlug";
import { CategoryIcon } from "@/components/CategoryIcon";
import SupermarketStores from "@/components/SupermarketStores";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import OperatorFooter from "@/components/OperatorFooter";
import { siteBrand } from "@/lib/siteBrand";
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

/** The earlier header is hidden for now; flip to true to restore it. */
const SHOW_LEGACY_HEADER = false;
/** The earlier homepage hero is hidden for now; flip to true to restore it. */
const SHOW_LEGACY_HERO = false;

const logoUrl = "/brand/coponya-logo.svg?v=20261030-colors";
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
              <Link href={storePath("noon - نون")} className="hero-slide discovery-banner noon-slide" hidden={active !== 1}>
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
      applyPageMetadata(location === "/admin" ? "إدارة كوبونيا" : siteBrand.title,
        siteBrand.description, location,
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
      <header className="site-header topbar">
        <div className="container topbar__main">
          <BrandMark />
          <div className="topbar__search-wrap">
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
                      <Link key={store.name} href={storePath(store.name)}>
                        <Store size={16} /> {store.name} <ArrowLeft size={14} />
                      </Link>
                    ))}
                  </nav>
                )}
                <button className="text-link" onClick={() => setQuery("")}>مسح البحث <X size={14} /></button>
              </div>
            )}
          </div>
          <div className="topbar__mobile-actions">
            <button type="button" className="topbar__round" onClick={goSearch} aria-label="البحث عن المتاجر">
              <Search size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="topbar__round"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
              aria-controls="topbar-nav"
            >
              {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <nav id="topbar-nav" className={`topbar__nav ${menuOpen ? "topbar__nav--open" : ""}`} aria-label="التنقل الرئيسي">
          <div className="container topbar__links">
            <div>
              <Link href="/stores" aria-current={location === "/stores" ? "page" : undefined}>جميع المتاجر</Link>
              <Link href="/coupons" aria-current={location === "/coupons" ? "page" : undefined}>الكوبونات</Link>
            </div>
            <div>
              <Link href="/deals" aria-current={location === "/deals" ? "page" : undefined}>العروض</Link>
              <Link href="/blog" aria-current={location.startsWith("/blog") ? "page" : undefined}>المدونة</Link>
            </div>
          </div>
        </nav>
      </header>
      {/* Previous header (home, categories, favorites and account icons, mobile menu) kept for later: set SHOW_LEGACY_HEADER to true to bring it back. */}
      {SHOW_LEGACY_HEADER && (
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
      )}

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
            {/* Previous hero (headline, slideshow, stats) kept for later: set SHOW_LEGACY_HERO to true to bring it back. */}
            {SHOW_LEGACY_HERO && (
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
                      {siteBrand.description}
                    </p>
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
            )}

            <section className="promo-banner container" aria-labelledby="home-title">
              <h1 id="home-title" className="sr-only">كل توفير يبدأ بكوبونيا — أكواد خصم وكوبونات متاجر السعودية</h1>
              <Link href="/coupons" className="promo-banner__link">
                <picture>
                  <source media="(max-width: 700px)" srcSet="/brand/banners/coponya-banner-mobile.webp" width={1500} height={840} />
                  <img
                    src="/brand/banners/coponya-banner-desktop.webp"
                    width={2712}
                    height={632}
                    fetchPriority="high"
                    decoding="async"
                    alt="كل توفير يبدأ بكوبونيا — ليش تدفع السعر كامل؟ كودك جاهز، انسخه ووفّر في ثوانٍ. اكتشف كوبونك الآن"
                  />
                </picture>
              </Link>
            </section>

            <SupermarketStores />

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
                      href={storePath(store.name)}
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
                  {categories.map(([name]) => (
                    <Link
                      href={`/categories/${encodeURIComponent(name)}`}
                      className="category-card"
                      key={name}
                    >
                      <CategoryIcon name={name} />
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
                              storePath(deal.brand),
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

            <section className="savings-guide" aria-labelledby="savings-guide-title">
              <div className="container">
                <header className="savings-guide__heading">
                  <h2 id="savings-guide-title">كيف تساعدك كوبونيا في التوفير؟</h2>
                  <p>ثلاث خطوات بسيطة تساعدك على مقارنة العروض واختيار ما يناسب مشترياتك.</p>
                </header>
                <ol className="savings-guide__cards">
                  <li className="savings-guide__card">
                    <span className="savings-guide__number" aria-hidden="true" dir="ltr">01</span>
                    <h3>ابحث عن متجرك المفضّل</h3>
                    <p>استعرض المتاجر الإلكترونية وتصفّح أكواد الخصم والعروض المتاحة مع شروط استخدامها.</p>
                  </li>
                  <li className="savings-guide__card">
                    <span className="savings-guide__number" aria-hidden="true" dir="ltr">02</span>
                    <h3>قارن العروض والأسعار</h3>
                    <p>قارن التكلفة النهائية لسلتك، بما فيها الشحن، وتأكد من شروط الكوبون قبل الشراء.</p>
                  </li>
                  <li className="savings-guide__card">
                    <span className="savings-guide__number" aria-hidden="true" dir="ltr">03</span>
                    <h3>طبّق الخصم وتحقّق من الإجمالي</h3>
                    <p>انسخ الكود وأدخله في صفحة الدفع لدى المتجر، ثم تأكد من تطبيق الخصم قبل إتمام الطلب.</p>
                  </li>
                </ol>
              </div>
            </section>

            <section className="section"><div className="container"><SectionHeading title="اقرأ قبل أن تتسوق" eyebrow="المدونة" href="/blog" link="كل الأدلة"/><ArticleCards limit={3}/></div></section>
            <section className="newsletter-section" data-nosnippet>
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

      <footer className="site-footer signature-footer">
        <div className="container signature-footer__content">
          <div className="signature-footer__tools">
            <Link href="/submit-coupon" className="footer-submit">أضف كوبونك</Link>
            <button type="button" className="footer-search" onClick={goSearch} aria-label="ابحث عن متجر أو كوبون"><Search size={18} aria-hidden="true"/><span>ابحث عن متجر أو كوبون...</span></button>
          </div>
          <div className="signature-footer__main">
            <div className="footer-brand"><BrandMark inverse /><p>كوبونيا (Coponya) منصة سعودية تساعدك على إيجاد أكواد الخصم والعروض لمتاجرك المفضلة وبخطوات واضحة.</p></div>
            <nav className="signature-footer__links" aria-labelledby="footer-links-title">
              <h2 id="footer-links-title" className="footer-links-title">روابط تهمك</h2>
              <div className="footer-links-list">
                <Link href="/about">من نحن</Link><Link href="/privacy">سياسة الخصوصية</Link><Link href="/contact">تواصل معنا</Link>
              </div>
            </nav>
            <div className="signature-footer__social">            <nav aria-label="حسابات كوبونيا على التواصل الاجتماعي" className="footer-socials">
              <a href="https://www.instagram.com/coponya.sa/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Instagram — يفتح في نافذة جديدة"><Instagram size={21} aria-hidden="true"/></a>
              <a href="https://www.tiktok.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على TikTok — يفتح في نافذة جديدة"><svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.05.86.13V9.4a6.34 6.34 0 0 0-5.12 10.73 6.34 6.34 0 0 0 10.6-4.72V8.42a8.16 8.16 0 0 0 4.77 1.53V6.53a4.85 4.85 0 0 1-1-.16Z"/></svg></a>
              <a href="https://www.snapchat.com/add/coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Snapchat — يفتح في نافذة جديدة"><svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.21 1.5c1.08 0 4.25.3 5.75 3.65.5 1.12.38 3.03.29 4.56l-.01.18c.08.04.22.1.44.1.33-.02.72-.13 1.13-.33.13-.07.27-.08.37-.08.15 0 .3.03.43.08.37.13.6.4.61.69.01.37-.32.69-.98.95-.07.03-.16.06-.25.09-.37.12-.93.3-1.08.66-.08.18-.05.42.09.71l.01.01c.05.11 1.25 2.85 3.93 3.29.21.03.36.22.35.43 0 .06-.02.12-.04.18-.2.46-1.04.8-2.57 1.03-.05.07-.1.32-.13.47-.03.15-.07.31-.12.47-.06.22-.22.32-.45.32h-.02c-.11 0-.26-.02-.45-.06-.3-.06-.64-.11-1.07-.11-.25 0-.51.02-.77.06-.51.09-.95.39-1.45.74-.72.51-1.53 1.08-2.77 1.08h-.15c-1.24 0-2.04-.57-2.75-1.08-.5-.35-.94-.66-1.45-.74-.27-.04-.53-.06-.78-.06-.46 0-.82.07-1.08.12-.17.03-.32.06-.44.06-.3 0-.42-.18-.47-.33-.05-.16-.08-.33-.11-.48-.03-.15-.08-.4-.13-.47-1.53-.23-2.37-.57-2.57-1.03a.56.56 0 0 1-.04-.18c-.01-.21.14-.4.35-.43 2.68-.44 3.88-3.18 3.93-3.3v-.01c.15-.29.18-.53.1-.71-.15-.36-.71-.54-1.08-.66-.09-.03-.18-.06-.25-.09-.89-.35-1.01-.75-.96-1.03.07-.38.54-.64.95-.64.11 0 .21.02.29.06.45.21.85.32 1.19.32.26 0 .41-.07.48-.11l-.01-.21c-.09-1.53-.21-3.44.29-4.56C7.96 1.81 11.12 1.5 12.21 1.5Z"/></svg></a>
              <a href="https://www.pinterest.com/coponya/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Pinterest — يفتح في نافذة جديدة"><svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2 .03-2.86.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.58 0-2.39-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.35 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.32-.25 1-.28 1.14-.04.18-.15.22-.34.13-1.25-.58-2.03-2.42-2.03-3.89 0-3.17 2.3-6.08 6.64-6.08 3.49 0 6.2 2.49 6.2 5.81 0 3.47-2.19 6.26-5.22 6.26-1.02 0-1.98-.53-2.31-1.16l-.63 2.39c-.23.87-.84 1.97-1.25 2.63.94.29 1.94.45 2.98.45 5.52 0 10-4.48 10-10S17.52 2 12 2Z"/></svg></a>
            </nav></div>
          </div>
          <AffiliateDisclosure />
          <OperatorFooter />
          <div className="signature-footer__bottom">
            <p>© {new Date().getFullYear()} كوبونيا. جميع الحقوق محفوظة.</p>
            <nav aria-label="السياسات والمساعدة"><Link href="/privacy">الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/complaints">الشكاوى والمقترحات</Link><Link href="/faq">المساعدة</Link></nav>
          </div>
        </div>
      </footer>  <div className="mobile-bottom-nav">
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
