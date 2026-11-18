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
              <a href="https://www.instagram.com/coponya.sa/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Instagram — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg></a>
              <a href="https://www.tiktok.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على TikTok — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
              <a href="https://www.snapchat.com/add/coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Snapchat — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg></a>
              <a href="https://www.pinterest.com/coponya/" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على Pinterest — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg></a>
              <a href="https://www.youtube.com/@coponya" target="_blank" rel="noopener noreferrer" aria-label="كوبونيا على YouTube — يفتح في نافذة جديدة"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
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
