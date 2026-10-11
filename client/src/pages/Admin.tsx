import SeoManager from "./SeoManager";
import { storeSeoDefaults, storeMetadata } from "@/lib/storeSeo";
/* سوق الضوء: readable RTL administration with explicit publish controls. */
import { uploadStoreLogo } from "@/lib/storeLogo";
import { StoreLogo } from "@/components/StoreLogo";
import { StoreOverview, StoreArticle } from "@/components/StoreProfile";
import { useState } from "react";
import { Link } from "wouter";
import { BackendError, backendConfigured, backendRequest, backendRows, type StoreRecord, type CouponRecord } from "@/lib/backend";
import { categories } from "@/lib/data";
import { useCatalog } from "@/contexts/CatalogContext";
const blankStore = { id: "", name: "", initial: "", tone: "olive", website_url: "", active: false, summary: "", about: "", products: "", shipping: "", payment: "", returns_policy: "", faq: "", logo_url: "", slug: "", seo_title: "", meta_description: "", primary_keyword: "", supporting_keywords: "", long_tail_keywords: "", article_ideas: "" };
const blankCoupon = { seo_title: "", meta_description: "", id: "", store_id: "", title: "", description: "", discount: "10%", code: "", category: categories[0][0], terms: "", expires_at: "", published: false, verified_at: null as string | null };
function editorValues<T extends Record<string, unknown>>(defaults: T, record: object): T {
  const values = record as Record<string, unknown>;
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, values[key] ?? fallback])) as T;
}
export default function Admin() {
  const { reload } = useCatalog();
  const [token, setToken] = useState("");
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [store, setStore] = useState(blankStore);
  const [coupon, setCoupon] = useState(blankCoupon);
  const [tab, setTab] = useState("stores");
  const [preview, setPreview] = useState(false);
  const profile = {name:store.name||"اسم المتجر",initial:store.initial,tone:store.tone,count:"",discount:"",websiteUrl:store.website_url,summary:store.summary,about:store.about,products:store.products,shipping:store.shipping,payment:store.payment,returnsPolicy:store.returns_policy,faq:store.faq,logoUrl:store.logo_url,seoTitle:store.seo_title,metaDescription:store.meta_description};
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function load(accessToken: string) {
    const [s,c] = await Promise.all([backendRows<StoreRecord>("/rest/v1/stores?select=*&order=name", {token:accessToken}), backendRows<CouponRecord>("/rest/v1/coupons?select=*&order=created_at.desc", {token:accessToken})]);
    setStores(s); setCoupons(c); reload();
  }
  async function run(action: () => Promise<void>) { setBusy(true); setNotice(""); try { await action(); } catch(e) { if(e instanceof BackendError && e.status === 401) { setToken(""); setStores([]); setCoupons([]); } setNotice(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء."); } finally { setBusy(false); } }
  return <section className="catalog-page container admin-page" dir="rtl">
    <Link href="/" className="text-link">العودة إلى كوبونيا</Link>
    <div className="page-heading"><span className="eyebrow">إدارة المحتوى</span><h1>لوحة إدارة كوبونيا</h1><p>أضف المتاجر والكوبونات، وراجع التفاصيل قبل نشرها.</p></div>
    {!backendConfigured ? <div className="content-panel"><h2>ربط قاعدة البيانات قيد الإعداد</h2><p>اللوحة جاهزة للربط. يلزم إعداد مشروع Supabase وحساب المدير لتفعيل الحفظ والنشر.</p></div> : !token ? <form className="content-panel support-form" onSubmit={e => {e.preventDefault(); const f = new FormData(e.currentTarget); const email=String(f.get("email")); const password=String(f.get("password")); e.currentTarget.reset(); void run(async()=>{
      const session = await backendRequest<{access_token:string; user:{id:string}}>("/auth/v1/token?grant_type=password", {method:"POST",body:{email,password}});
      try {
        const membership = await backendRequest<{user_id:string}[]>(`/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,{token:session.access_token});
        if (!membership.length) throw new Error("هذا الحساب غير مخوّل لإدارة الموقع.");
        await load(session.access_token); setToken(session.access_token);
      } catch(error) { await backendRequest("/auth/v1/logout",{method:"POST",token:session.access_token}).catch(()=>{}); throw error; }
    });}}><h2>تسجيل دخول الإدارة</h2><label>البريد الإلكتروني<input name="email" type="email" dir="ltr" required autoComplete="username" /></label><label>كلمة المرور<input name="password" type="password" required autoComplete="current-password" /></label><button disabled={busy} className="button button--primary">{busy?"جارٍ الدخول…":"تسجيل الدخول"}</button><p>الجلسة مؤقتة في هذه الصفحة؛ بعد إعادة تحميلها يلزم تسجيل الدخول مجدداً.</p></form> : <>
      <div className="admin-toolbar"><button className="button button--outline" disabled={busy} onClick={()=>setTab("seo")}>SEO Manager والمقالات</button><button className="button button--outline" disabled={busy} aria-pressed={tab==="stores"} onClick={()=>setTab("stores")}>المتاجر ({stores.length})</button><button className="button button--outline" disabled={busy} aria-pressed={tab==="coupons"} onClick={()=>setTab("coupons")}>الكوبونات ({coupons.length})</button><button disabled={busy} className="button button--outline" onClick={()=>void run(async()=>{try { await backendRequest("/auth/v1/logout",{method:"POST",token}); } finally { setToken("");setStores([]);setCoupons([]); }})}>تسجيل الخروج</button></div>
      <div className="admin-layout">
      {tab === "seo" ? <SeoManager token={token} stores={stores}/> : tab==="stores" ? <>
        <form className="content-panel support-form" onSubmit={e=>{e.preventDefault();void run(async()=>{ const {id,...body}=store; body.initial = Array.from(body.name.trim()).slice(0,2).join("") || "م"; const url = new URL(body.website_url); if(url.protocol!=="https:" || url.username || url.password) throw new Error("استخدم رابط متجر آمن يبدأ بـ https:// بدون بيانات دخول."); if(body.logo_url) { const logo = new URL(body.logo_url); if(logo.protocol!=="https:" || logo.username || logo.password) throw new Error("استخدم رابط شعار يبدأ بـ https:// بدون بيانات دخول."); } await backendRequest(`/rest/v1/stores${id?`?id=eq.${id}`:""}`,{method:id?"PATCH":"POST",token,body});setStore(blankStore);await load(token);setNotice("تم حفظ المتجر.");});}}>
          <h2>{store.id?"تعديل المتجر":"متجر جديد"}</h2>
          <label>اسم المتجر<input value={store.name} required maxLength={120} onChange={e=>setStore({...store,name:e.target.value})}/></label>
          <div className="store-logo-upload">
            <StoreLogo initial={Array.from(store.name.trim()).slice(0,2).join("")||"م"} tone={store.tone} logoUrl={store.logo_url} className="store-profile-logo"/>
            <label>شعار المتجر<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)void run(async()=>{const logoUrl=await uploadStoreLogo(file,token);setStore(s=>({...s,logo_url:logoUrl}));setNotice("تم رفع الشعار. اضغط حفظ المتجر لاعتماده.");});}}/><small>PNG أو JPG أو WebP، حتى 2 ميجابايت. يُرفع الشعار ثم يُعتمد عند حفظ المتجر.</small></label>
            {store.logo_url&&<button type="button" disabled={busy} className="text-link" onClick={()=>setStore({...store,logo_url:""})}>إزالة الشعار من المتجر</button>}
          </div>
          <label>رابط المتجر<input value={store.website_url} type="url" dir="ltr" required pattern="https://.*" onChange={e=>setStore({...store,website_url:e.target.value})}/></label>
          <label>لون البطاقة<select value={store.tone} onChange={e=>setStore({...store,tone:e.target.value})}>{["olive","apricot","ink","mint","sand"].map(t=><option key={t}>{t}</option>)}</select></label>
          <fieldset className="store-editor"><legend>الصفحة التعريفية للمتجر</legend>
            <p>أضف معلومات مؤكدة من المتجر. الحقول الفارغة لا تظهر للزوار. افصل الفقرات بسطر فارغ.</p>
            <label>أو رابط شعار موجود (اختياري)<input type="url" dir="ltr" pattern="https://.*" maxLength={2048} value={store.logo_url} onChange={e=>setStore({...store,logo_url:e.target.value})}/></label>
            <label>نبذة مختصرة<textarea rows={3} maxLength={300} value={store.summary} onChange={e=>setStore({...store,summary:e.target.value})}/><small>{store.summary.length}/300</small></label>
            {([['about','نبذة عن المتجر'],['products','المنتجات والأقسام'],['shipping','الشحن والتوصيل'],['payment','طرق الدفع'],['returns_policy','الاستبدال والاسترجاع'],['faq','الأسئلة الشائعة']] as const).map(([key,label])=><label key={key}>{label}<textarea rows={key==='about'?6:4} maxLength={key==='about'?12000:4000} value={store[key]} onChange={e=>setStore({...store,[key]:e.target.value})}/>{key==='faq'&&<small>اكتب السؤال في أول سطر والإجابة تحته. افصل كل سؤال وإجابته عن التالي بسطر فارغ.</small>}</label>)}
            <button type="button" className="button button--outline" aria-expanded={preview} onClick={()=>setPreview(!preview)}>{preview?"إغلاق المعاينة":"معاينة المحتوى قبل النشر"}</button>
            {preview&&<div className="store-editor-preview"><StoreOverview store={profile} couponCount={coupons.filter(c=>c.store_id===store.id&&c.published).length}/><StoreArticle store={profile} related={[]}/></div>}
            {store.name&&<Link className="text-link" href={`/stores/${encodeURIComponent(store.slug || store.name)}`} target="_blank">عرض صفحة المتجر بعد الحفظ</Link>}
          </fieldset>
          <fieldset className="store-editor"><legend>تحسين ظهور المتجر في البحث</legend>
            <p>الكلمات المفتاحية خطة تحريرية، ولا تُضاف كحشو إلى الصفحة. أضف معلومات مؤكدة في وصف المتجر والأسئلة الشائعة أعلاه.</p>
            <button type="button" className="button button--outline" disabled={!store.name.trim()} onClick={()=>{
              const defaults=storeSeoDefaults(store.name.trim());
              setStore(current=>({...current,
                seo_title:current.seo_title||defaults.seoTitle,meta_description:current.meta_description||defaults.metaDescription,
                primary_keyword:current.primary_keyword||defaults.primaryKeyword,supporting_keywords:current.supporting_keywords||defaults.supportingKeywords,
                long_tail_keywords:current.long_tail_keywords||defaults.longTailKeywords,article_ideas:current.article_ideas||defaults.articleIdeas,
                about:current.about||defaults.about,faq:current.faq||defaults.faq}));
            }}>تعبئة الحقول الفارغة بمقترحات أولية</button>
            <label>الكلمة المفتاحية الرئيسية<input maxLength={160} value={store.primary_keyword} onChange={e=>setStore({...store,primary_keyword:e.target.value})}/></label>
            {([['supporting_keywords','الكلمات المساندة'],['long_tail_keywords','عبارات البحث الطويلة'],['article_ideas','اقتراحات مقالات']] as const).map(([key,label])=><label key={key}>{label}<textarea rows={3} maxLength={4000} value={store[key]} onChange={e=>setStore({...store,[key]:e.target.value})}/><small>عبارة واحدة في كل سطر. المقترحات تحتاج مراجعة وليست بيانات حجم بحث.</small></label>)}
            <label>الرابط المختصر<input dir="ltr" maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={store.slug} onChange={e=>setStore({...store,slug:e.target.value})}/><small>اختياري؛ الروابط السابقة تتحول إلى الرابط المعتمد.</small></label>
            <label>SEO title<input maxLength={120} value={store.seo_title} placeholder={storeSeoDefaults(store.name||'المتجر').seoTitle} onChange={e=>setStore({...store,seo_title:e.target.value})}/><small>{store.seo_title.length}/120 — استهدف عنواناً واضحاً ومختصراً.</small></label>
            <label>Meta description<textarea rows={3} maxLength={300} value={store.meta_description} onChange={e=>setStore({...store,meta_description:e.target.value})}/><small>{store.meta_description.length}/300 — اكتب وصفاً طبيعياً دون وعود بخصم غير مؤكد.</small></label>
            <div className="seo-preview" aria-label="معاينة نتيجة البحث"><small>معاينة تقريبية — قد يغيّر محرك البحث النص</small><p dir="ltr">coponya.com/stores/{encodeURIComponent(store.slug || store.name)}</p><h3>{storeMetadata(profile).title}</h3><p>{storeMetadata(profile).description}</p></div>
          </fieldset>
          <label className="admin-checkbox"><input type="checkbox" checked={store.active} onChange={e=>setStore({...store,active:e.target.checked})}/>إظهار المتجر للزوار</label>
          <button disabled={busy} className="button button--primary">حفظ المتجر</button><button type="button" disabled={busy} className="text-link" onClick={()=>setStore(blankStore)}>إلغاء التعديل</button>
        </form>
        <div className="admin-list">{!stores.length&&<p>لا توجد متاجر بعد. أضف أول متجر.</p>}{stores.map(s=><article className="content-panel" key={s.id}><h2>{s.name}</h2><p>{s.active?"ظاهر للزوار":"مخفي"}</p><button disabled={busy} className="button button--outline" onClick={()=>setStore(editorValues(blankStore,s))}>تعديل</button></article>)}</div>
      </> : <>
        <form className="content-panel support-form" onSubmit={e=>{e.preventDefault();void run(async()=>{const {id,...values}=coupon;if(!stores.some(s=>s.id===values.store_id)) throw new Error("اختر متجراً أولاً."); if(!/^(100|\d{1,2})(\.\d{1,2})?%$/.test(values.discount)||parseFloat(values.discount)>100) throw new Error("أدخل نسبة صحيحة بين 0% و100%."); const body={...values,expires_at:values.expires_at||null}; await backendRequest(`/rest/v1/coupons${id?`?id=eq.${id}`:""}`,{method:id?"PATCH":"POST",token,body});setCoupon(blankCoupon);await load(token);setNotice("تم حفظ الكوبون.");});}}>
          <h2>{coupon.id?"تعديل الكوبون":"كوبون جديد"}</h2>
          <label>المتجر<select required value={coupon.store_id} onChange={e=>setCoupon({...coupon,store_id:e.target.value})}><option value="">اختر المتجر</option>{stores.map(s=><option key={s.id} value={s.id}>{s.name}{s.active?"":" (مخفي)"}</option>)}</select></label>
          <label>العنوان<input required maxLength={160} value={coupon.title} onChange={e=>setCoupon({...coupon,title:e.target.value})}/></label>
          <label>وصف العرض<textarea rows={3} maxLength={2000} value={coupon.description} onChange={e=>setCoupon({...coupon,description:e.target.value})}/></label>
          <label>SEO title<input maxLength={120} value={coupon.seo_title} onChange={e=>setCoupon({...coupon,seo_title:e.target.value})}/></label><label>Meta description<textarea maxLength={300} value={coupon.meta_description} onChange={e=>setCoupon({...coupon,meta_description:e.target.value})}/></label>
          <label>كود الخصم<input required maxLength={80} pattern="\S+" dir="ltr" value={coupon.code} onChange={e=>setCoupon({...coupon,code:e.target.value})}/></label>
          <label>نسبة الخصم — مثال 20%<input required dir="ltr" value={coupon.discount} onChange={e=>setCoupon({...coupon,discount:e.target.value})}/></label>
          <label>التصنيف<select value={coupon.category} onChange={e=>setCoupon({...coupon,category:e.target.value})}>{categories.map(c=><option key={c[0]}>{c[0]}</option>)}</select></label>
          <label>الشروط والاستثناءات<textarea required rows={4} maxLength={3000} value={coupon.terms} onChange={e=>setCoupon({...coupon,terms:e.target.value})}/></label>
          <label>تاريخ الانتهاء — اختياري<input type="date" value={coupon.expires_at} onChange={e=>setCoupon({...coupon,expires_at:e.target.value})}/></label>
          <label className="admin-checkbox"><input type="checkbox" checked={!!coupon.verified_at} onChange={e=>setCoupon({...coupon,verified_at:e.target.checked?new Date().toISOString():null})}/>راجعت الكود وشروطه فعلياً</label>
          <label className="admin-checkbox"><input type="checkbox" checked={coupon.published} onChange={e=>setCoupon({...coupon,published:e.target.checked})}/>نشر الكوبون للزوار</label>
          <p>الكوبون المنتهي أو التابع لمتجر مخفي لا يظهر للزوار.</p>
          <button disabled={busy||!stores.length} className="button button--primary">حفظ الكوبون</button><button type="button" className="text-link" onClick={()=>setCoupon(blankCoupon)}>إلغاء التعديل</button>
        </form>
        <div className="admin-list">{!coupons.length&&<p>لا توجد كوبونات بعد.</p>}{coupons.map(c=><article className="content-panel" key={c.id}><h2>{c.title}</h2><p>{stores.find(s=>s.id===c.store_id)?.name} · {c.published?"محدد للنشر":"مسودة"}</p><p dir="ltr">{c.code} · {c.discount}</p><button className="button button--outline" onClick={()=>setCoupon(editorValues(blankCoupon,c))}>تعديل</button></article>)}</div>
      </>}
      </div>
    </>}
    {notice&&<p className="admin-notice" role="status">{notice}</p>}
  </section>;
}
