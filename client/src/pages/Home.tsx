import { storePath } from "@/lib/storeSlug";
import { CategoryIcon } from "@/components/CategoryIcon";
import SupermarketStores from "@/components/SupermarketStores";
import OperatorFooter from "@/components/OperatorFooter";
import { operatorAddress } from "@/lib/legal";
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
  ArrowUpLeft,
  BadgeCheck,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Heart,
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
  MapPin,
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

      </Link>
    </div>
  );
}

/** The homepage promo banners, one at a time: each shows for 5 seconds, pauses while hovered
 * or focused, and stays put for visitors who ask for reduced motion. */
const promoBanners = [
  {
    href: "/coupons",
    desktop: "/brand/banners/coponya-banner-desktop.webp?v=2",
    mobile: "/brand/banners/coponya-banner-mobile.webp?v=2",
    alt: "كل توفير يبدأ بكوبونيا — ليش تدفع السعر كامل؟ كودك جاهز، انسخه ووفّر في ثوانٍ. اكتشف كوبونك الآن",
  },
  {
    href: "/stores/noon",
    desktop: "/brand/banners/coponya-noon-ring-desktop.webp?v=1",
    mobile: "/brand/banners/coponya-noon-ring-mobile.webp?v=1",
    alt: "كود خصم نون على كوبونيا — استرداد نقدي 10% بحد أقصى 75 ريال بالكود CPY10، ينتهي 31 ديسمبر 2026. انسخ كود نون",
  },
];

function PromoBanners() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % promoBanners.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);
  return (
    <div className="promo-slider" aria-roledescription="عرض شرائح" aria-label="بنرات كوبونيا"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div className="promo-slider__track">
      {promoBanners.map((banner, index) => (
        <Link key={banner.href} href={banner.href} className="promo-banner__link" data-active={active === index ? "true" : "false"} aria-hidden={active !== index} tabIndex={active === index ? undefined : -1}>
          <picture>
            <source media="(max-width: 700px)" srcSet={banner.mobile} width={1500} height={840} />
            <img src={banner.desktop} width={2712} height={632} fetchPriority={index === 0 ? "high" : "low"} loading={index === 0 ? "eager" : "lazy"} decoding="async" alt={banner.alt} />
          </picture>
        </Link>
      ))}
      </div>
      <div className="promo-slider__dots" role="group" aria-label="اختيار البنر">
        {promoBanners.map((banner, index) => (
          <button key={banner.href} type="button" aria-label={`البنر ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />
        ))}
      </div>
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
                  <div className="festive-slide__heading"><span>اختيارات الموسم مع كوبونيا</span><h2>كل موسم<br/>له اختياراته</h2><span className="festive-slide__cta">استكشف العروض</span></div>
                  <div className="festive-slide__brands" aria-label="نون، ماتش للعطور، أمازون، ترينديول">{[{id:"noon",name:"نون"},{id:"match",name:"ماتش للعطور"},{id:"amazon",name:"أمازون"},{id:"trendyol",name:"ترينديول"}].map(brand => <span key={brand.id}><img src={`/brand/merchants/${brand.id}.png`} alt="" width="32" height="32"/><strong>{brand.name}</strong></span>)}</div>
                </Link>
              <Link href={storePath("noon - نون")} className="hero-slide discovery-banner noon-slide" hidden={active !== 1}>
                <img className="noon-slide__logo" src="/brand/merchants/noon.png" alt="نون" width="64" height="64"/>
                <span className="discovery-banner__eyebrow">كوبونات نون على كوبونيا</span>
                <h2>استرداد نقدي 10% من نون بحد أقصى 75 ريال</h2>
                <p>تعرّف على تفاصيل الكوبون وشروط الاستخدام.</p>
                <span className="discovery-banner__cta">شاهد كوبونات نون</span>
              </Link>
              <Link href="/categories/المنزل" className="hero-slide discovery-banner discovery-banner--orange" hidden={active !== 2}>
                <span className="discovery-banner__eyebrow">وقت اللمسات الدافئة</span>
                <h2>جدّد أجواء بيتك للموسم</h2>
                <p>قارن الاختيارات وتصفح كوبونات المنزل المتاحة.</p>
                <span className="discovery-banner__cta">كوبونات المنزل</span>
                <Store className="discovery-banner__art" aria-hidden="true" />
              </Link>
              <Link href="/categories/السفر" className="hero-slide discovery-banner discovery-banner--cream" hidden={active !== 3}>
                <span className="discovery-banner__eyebrow">طلعات وأجواء ألطف</span>
                <h2>خطّط لرحلتك القادمة بذكاء</h2>
                <p>استكشف كوبونات السفر وراجع التفاصيل قبل الحجز.</p>
                <span className="discovery-banner__cta">كوبونات السفر</span>
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

  // Favorites live in this browser only: read them after hydration so the server and
  // first client render match, and write back only once they have been loaded.
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  useEffect(() => {
    const saved = readSaved<unknown>("sahm-favorites", []);
    setFavorites(Array.isArray(saved) ? saved.filter((v): v is string => typeof v === "string") : []);
    setFavoritesLoaded(true);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (favoritesLoaded) saveLocal("sahm-favorites", favorites);
  }, [favorites, favoritesLoaded]);
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
                ابحث عن كوبون
              </button>
            </form>
            {query.trim() && (
              <div className="search-discovery">
                <p role="status">{matchingStores.length} متجر · {filteredCoupons.length} كوبون مطابق</p>
                {matchingStores.length > 0 && (
                  <nav aria-label="المتاجر المطابقة للبحث">
                    {matchingStores.map((store) => (
                      <Link key={store.name} href={storePath(store.name)}>
                        <Store size={16} /> {store.name}
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
              <PromoBanners />
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
                          مشاهدة العرض
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
            <Link href="/submit-coupon" className="footer-add-store">أضف متجرك</Link>
          </div>
          <div className="signature-footer__main">
            <div className="footer-brand"><BrandMark inverse /><p>كوبونيا (Coponya) منصة سعودية تساعدك على إيجاد أكواد الخصم والعروض لمتاجرك المفضلة وبخطوات واضحة</p><address className="footer-address"><MapPin size={18} aria-hidden="true" />{operatorAddress()}</address></div>
            <nav className="signature-footer__links" aria-labelledby="footer-links-title">
              <h2 id="footer-links-title" className="footer-links-title">روابط تهمك</h2>
              <div className="footer-links-list">
                <Link href="/about">من نحن</Link><Link href="/privacy">سياسة الخصوصية</Link><Link href="/contact">تواصل معنا</Link>
              </div>
            </nav>
            <div className="signature-footer__social">            <nav aria-label="حسابات كوبونيا على التواصل الاجتماعي" className="footer-socials">
              <a href="https://www.instagram.com/coponya.sa/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Instagram — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M 18.354,4.285 c -0.777,0 -1.406,0.629 -1.406,1.406 s 0.629,1.407 1.406,1.407 s 1.407,-0.629 1.407,-1.407 S 19.132,4.285 18.354,4.285 Z M 12.098,6.089 c -3.259,0 -5.911,2.651 -5.911,5.911 s 2.652,5.911 5.911,5.911 s 5.911,-2.652 5.911,-5.911 S 15.357,6.089 12.098,6.089 Z M 12.098,15.786 c -2.088,0 -3.786,-1.698 -3.786,-3.786 s 1.698,-3.786 3.786,-3.786 s 3.786,1.698 3.786,3.786 S 14.186,15.786 12.098,15.786 Z M 16.791,24 l -9.582,0 c -3.975,0 -7.209,-3.234 -7.209,-7.209 l 0,-9.582 c 0,-3.976 3.234,-7.209 7.209,-7.209 l 9.582,0 c 3.975,0 7.209,3.233 7.209,7.209 l 0,9.582 C 24,20.766 20.766,24 16.791,24 Z M 7.209,2.258 c -2.73,0 -4.951,2.221 -4.951,4.951 l 0,9.582 c 0,2.73 2.221,4.951 4.951,4.951 l 9.582,0 c 2.73,0 4.952,-2.221 4.952,-4.951 l 0,-9.582 c 0,-2.73 -2.222,-4.951 -4.952,-4.951 L 7.209,2.258 Z"/></svg></a>
              <a href="https://www.tiktok.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على TikTok — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M 22.266,9.71 q -0.295,0.028 -0.59,0.03 c -2.161,0 -4.177,-1.089 -5.36,-2.897 l 0,9.865 c 0,4.027 -3.265,7.292 -7.292,7.292 s -7.292,-3.265 -7.292,-7.292 s 3.264,-7.292 7.292,-7.292 l 0,0 c 0.152,0 0.301,0.014 0.451,0.024 l 0,3.593 c -0.15,-0.018 -0.297,-0.045 -0.451,-0.045 c -2.056,0 -3.722,1.666 -3.722,3.722 s 1.666,3.722 3.722,3.722 s 3.871,-1.62 3.871,-3.676 l 0.036,-16.755 l 3.437,0 c 0.324,3.083 2.81,5.49 5.901,5.716 l 0,3.994"/></svg></a>
              <a href="https://www.snapchat.com/add/coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Snapchat — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M 0,18.3 l 0,-0.375 c 0.154,-0.178 0.316,-0.33 0.566,-0.379 c 1.968,-0.39 3.285,-1.645 4.279,-3.293 c 0.834,-1.385 0.701,-1.702 -0.838,-2.247 c -0.089,-0.031 -0.179,-0.057 -0.265,-0.092 c -0.333,-0.137 -0.662,-0.283 -0.936,-0.522 c -0.689,-0.599 -0.282,-1.462 0.531,-1.657 c 0.594,-0.143 1.111,0.239 1.688,0.311 c 0.385,0.048 0.539,-0.082 0.493,-0.492 c -0.122,-1.057 -0.119,-2.12 -0.069,-3.181 c 0.095,-2.023 1.09,-3.565 2.775,-4.564 c 2.462,-1.459 5.034,-1.477 7.514,-0.023 c 1.548,0.908 2.546,2.282 2.763,4.125 c 0.141,1.199 0.085,2.4 -0.01,3.6 c -0.041,0.521 0.066,0.617 0.581,0.496 c 0.64,-0.15 1.176,-0.479 1.841,-0.188 c 0.356,0.157 0.666,0.493 0.656,0.881 c -0.006,0.266 -0.162,0.511 -0.362,0.686 c -0.307,0.268 -0.708,0.416 -1.081,0.567 c -0.289,0.117 -0.59,0.208 -0.871,0.34 c -0.582,0.273 -0.749,0.633 -0.477,1.207 c 0.942,1.991 2.325,3.502 4.564,4.027 c 0.273,0.064 0.492,0.175 0.658,0.397 l 0,0.375 c -0.213,0.437 -0.592,0.677 -1.023,0.841 c -0.437,0.166 -0.877,0.351 -1.347,0.381 c -0.648,0.042 -0.99,0.325 -1.089,1 c -0.095,0.643 -0.288,0.734 -0.943,0.681 c -0.155,-0.012 -0.309,-0.042 -0.462,-0.068 c -1.283,-0.229 -2.488,-0.098 -3.543,0.754 c -0.206,0.167 -0.434,0.305 -0.657,0.449 c -1.797,1.167 -3.638,1.3 -5.515,0.206 c -0.512,-0.299 -0.997,-0.643 -1.494,-0.967 c -0.411,-0.268 -0.853,-0.418 -1.347,-0.493 c -0.778,-0.118 -1.524,0.057 -2.281,0.141 c -0.389,0.043 -0.765,-0.068 -0.787,-0.471 c -0.053,-0.97 -0.648,-1.207 -1.464,-1.297 c -0.38,-0.042 -0.756,-0.197 -1.114,-0.346 C 0.542,18.946 0.187,18.714 0,18.3 Z"/></svg></a>
              <a href="https://www.pinterest.com/coponya/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Pinterest — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" clipRule="evenodd" aria-hidden="true" focusable="false"><path d="M 10.479,15.656 c -0.02,0.068 -0.04,0.126 -0.054,0.185 c -0.882,3.454 -0.98,4.22 -1.886,5.825 c -0.432,0.762 -0.919,1.485 -1.457,2.175 c -0.061,0.079 -0.118,0.179 -0.239,0.155 c -0.132,-0.029 -0.143,-0.148 -0.157,-0.255 c -0.146,-1.049 -0.225,-2.102 -0.19,-3.162 c 0.045,-1.38 0.216,-1.853 1.995,-9.336 c 0.026,-0.114 -0.003,-0.209 -0.04,-0.311 c -0.426,-1.149 -0.51,-2.315 -0.139,-3.497 c 0.806,-2.552 3.699,-2.748 4.205,-0.642 c 0.311,1.303 -0.513,3.007 -1.146,5.526 c -0.525,2.079 1.922,3.557 4.013,2.039 c 1.928,-1.399 2.678,-4.753 2.535,-7.13 c -0.281,-4.738 -5.477,-5.763 -8.774,-4.237 c -3.779,1.747 -4.638,6.432 -2.932,8.573 c 0.217,0.273 0.384,0.439 0.311,0.715 c -0.11,0.428 -0.206,0.86 -0.325,1.287 c -0.088,0.316 -0.354,0.432 -0.674,0.302 c -0.63,-0.255 -1.153,-0.656 -1.578,-1.182 c -1.449,-1.794 -1.864,-5.345 0.052,-8.349 c 2.122,-3.33 6.072,-4.676 9.676,-4.268 c 4.306,0.49 7.028,3.433 7.537,6.77 c 0.232,1.521 0.066,5.27 -2.069,7.919 c -2.455,3.045 -6.435,3.247 -8.271,1.378 C 10.731,15.994 10.617,15.826 10.479,15.656 Z"/></svg></a>
              <a href="https://www.youtube.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على YouTube — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M 24,8.867 c 0,-2.908 -2.357,-5.267 -5.267,-5.267 l -13.467,0 c -2.908,0 -5.267,2.358 -5.267,5.267 l 0,6.267 c 0,2.909 2.358,5.267 5.267,5.267 l 13.467,0 c 2.909,0 5.267,-2.357 5.267,-5.267 L 24,8.867 Z M 16.081,12.47 l -6.039,2.988 c -0.237,0.128 -1.042,-0.044 -1.042,-0.313 l 0,-6.133 c 0,-0.272 0.811,-0.443 1.048,-0.309 l 5.781,3.145 C 16.071,11.986 16.326,12.337 16.081,12.47 Z"/></svg></a>
            </nav></div>
          </div>
          <p className="footer-tagline">كل طلب فرصة للتوفير. مع كوبونيا تجدون أكواد الخصم والعروض المناسبة لأشهر المتاجر الإلكترونية في السعودية، بخطوات واضحة وبدون تسجيل أو رسوم.</p>
          <OperatorFooter />
          <div className="signature-footer__bottom">
            <p>جميع الحقوق محفوظة <Link href="/" className="footer-copyright-link">كوبونيا</Link> ©</p>
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
