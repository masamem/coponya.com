import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Search, Tag } from "lucide-react";

const slides = [
  { label: "اكتشف الكوبونات", title: "قبل الدفع، مرّ على كوبونيا", text: "ابحث عن كود متجرك واطّلع على شروطه.", href: "/coupons", action: "استكشف الكوبونات", icon: Tag },
  { label: "تصفح المتاجر", title: "متاجرك المفضلة، في مكان واحد", text: "ابدأ باسم المتجر واكتشف كوبوناته المتاحة.", href: "/stores", action: "تصفح المتاجر", icon: Search },
  { label: "احفظ المفضلة", title: "اختياراتك تنتظرك", text: "احفظ الكوبونات وارجع لها وقت الشراء.", href: "/favorites", action: "افتح المفضلة", icon: Heart },
];

export default function HeroBannerVisual() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const Icon = slide.icon;
  const change = (step: number) => setActive(v => (v + step + slides.length) % slides.length);
  return <section className={`campaign-visual campaign-visual--${active}`} aria-label="بنرات كوبونيا" aria-roledescription="عرض شرائح">
    <div className="campaign-browser" aria-hidden="true">
      <div className="campaign-browser__bar"><span/><span/><span/><div>coponya.com</div></div>
      <div className="campaign-browser__page"><span className="campaign-browser__category">اختيارات للتسوق</span><img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663890167905/YhatHEeNFLBL9m3u6y3Nwp/sahm-hero-fixpfM4RqYnrUecg2f4VDV.webp" alt="" width="960" height="640" fetchPriority="high"/><div className="campaign-browser__lines"><i/><i/><i/></div></div>
    </div>
    <div className="campaign-coupon" aria-live="polite" aria-atomic="true">
      <img className="campaign-coupon__logo" src="/brand/coponya-logo.svg?v=20261018-3" alt="كوبونيا" width="1356" height="535"/>
      <span className="campaign-coupon__icon"><Icon size={24} aria-hidden="true"/></span>
      <h2>{slide.title}</h2><p>{slide.text}</p>
      <Link href={slide.href} className="campaign-coupon__action">{slide.action}<ArrowLeft size={16} aria-hidden="true"/></Link>
    </div>
    <div className="campaign-visual__note"><span/><span>خطوة صغيرة، تسوّق أذكى</span></div>
    <div className="campaign-controls">
      <button type="button" aria-label="البنر السابق" onClick={() => change(-1)}><ChevronRight size={17}/></button>
      <div role="group" aria-label="اختيار البنر">{slides.map((s, index) => <button key={s.href} type="button" aria-label={s.label} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)}/>)}</div>
      <button type="button" aria-label="البنر التالي" onClick={() => change(1)}><ChevronLeft size={17}/></button>
    </div>
  </section>;
}
