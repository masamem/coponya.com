import { parseFaq } from "@/lib/storeSeo";
import { StoreLogo } from "./StoreLogo";
import { Link } from "wouter";
import { ArrowUpLeft, Tag, BookOpen } from "lucide-react";
import type { Store } from "@/lib/catalog";

function Paragraphs({text}: {text: string}) {
  return <>{text.trim().split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</>;
}
export function StoreOverview({store,couponCount}: {store: Store; couponCount: number}) {
  return <header className="store-overview">
    <StoreLogo initial={store.initial} tone={store.tone} logoUrl={store.logoUrl} className="store-profile-logo"/>
    <div className="store-overview-copy"><span className="eyebrow">دليل متاجر كوبونيا</span><h1>كوبونات {store.name}</h1>
      <p>{store.summary||`تصفح كوبونات ${store.name} واقرأ شروط العرض قبل استخدامه.`}</p>
      <div className="store-overview-actions"><a href="#store-coupons" className="button button--primary"><Tag size={18}/>الكوبونات المتاحة ({couponCount})</a>{store.websiteUrl&&<a className="button button--outline" href={store.websiteUrl} target="_blank" rel="noopener noreferrer sponsored">زيارة المتجر<ArrowUpLeft size={18}/></a>}{store.about&&<a href="#store-about" className="text-link"><BookOpen size={17}/>عن المتجر</a>}</div>
    </div>
  </header>;
}
export function StoreArticle({store,related}: {store: Store; related: Store[]}) {
  const sections = [{id:"store-about",title:`نبذة عن ${store.name}`,text:store.about},{id:"store-products",title:"المنتجات والأقسام",text:store.products},{id:"store-shipping",title:"الشحن والتوصيل",text:store.shipping},{id:"store-payment",title:"طرق الدفع",text:store.payment},{id:"store-returns",title:"الاستبدال والاسترجاع",text:store.returnsPolicy}].filter(s=>s.text?.trim());
  const faq = parseFaq(store.faq);
  return <div className="store-guide-layout">
    <aside className="store-guide-nav" aria-label="دليل صفحة المتجر"><span className="eyebrow">تعرّف على المتجر</span><h2>دليلك للتسوق</h2><a href="#store-coupons">الكوبونات المتاحة</a>{sections.map(s=><a key={s.id} href={`#${s.id}`}>{s.title}</a>)}<a href="#store-how">طريقة استخدام الكوبون</a>{faq.length>0&&<a href="#store-faq">الأسئلة الشائعة</a>}</aside>
    <article className="store-article" aria-label={`دليل ${store.name}`}>
      {sections.map(s=><section key={s.id} id={s.id}><h2>{s.title}</h2><Paragraphs text={s.text!}/></section>)}
      <section id="store-how"><h2>كيف تستخدم كوبون {store.name}؟</h2><ol><li>اختر كوبوناً متاحاً واقرأ شروطه وتاريخ انتهائه.</li><li>انسخ الكود وانتقل إلى موقع المتجر.</li><li>أضف المنتجات المشمولة بالعرض إلى السلة.</li><li>أدخل الكود في خانة الخصم عند الدفع، وتأكد من تغير الإجمالي قبل إتمام الطلب.</li></ol><p className="store-guide-note">قبول الكود يعتمد على شروط المتجر والمنتجات والطلب. راجع سياسة المتجر الحالية قبل الشراء.</p></section>
      {faq.length>0&&<section id="store-faq"><h2>الأسئلة الشائعة عن {store.name}</h2><div className="faq-list">{faq.map((f,i)=><details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div></section>}
      {related.length>0&&<section><h2>اكتشف متاجر أخرى</h2><div className="store-related">{related.map(s=><Link key={s.name} href={`/stores/${encodeURIComponent(s.slug || s.name)}`} className="store-related-card"><StoreLogo initial={s.initial} tone={s.tone} logoUrl={s.logoUrl}/><strong>{s.name}</strong><span>{s.count}</span></Link>)}</div></section>}
    </article>
  </div>;
}
