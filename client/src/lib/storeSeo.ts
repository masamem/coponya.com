import type { Store } from "./catalog";

export type StoreSeo = {
  seoTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  supportingKeywords?: string;
  longTailKeywords?: string;
  articleIdeas?: string;
};

export function parseFaq(text = "") {
  return text.trim().split(/\n\s*\n/).map(block => {
    const [question, ...lines] = block.split("\n");
    return { question: question.trim(), answer: lines.join("\n").trim() };
  }).filter(item => item.question && item.answer);
}

export function storeSeoDefaults(name: string) {
  const primaryKeyword = `كود خصم ${name}`;
  return {
    primaryKeyword,
    supportingKeywords: `كوبون ${name}\nكوبونات ${name}\nعروض ${name}`,
    longTailKeywords: `طريقة استخدام كود خصم ${name}\nلماذا لا يعمل كوبون ${name}\nشروط استخدام كوبونات ${name} في السعودية`,
    seoTitle: `${primaryKeyword} وكوبونات المتجر | كوبونيا`.slice(0, 120),
    metaDescription: `تصفح كوبونات ${name} على كوبونيا، واقرأ شروط كل عرض وتاريخ انتهائه. انسخ كود الخصم وتحقق من تطبيقه على طلبك لدى المتجر قبل الدفع.`,
    articleIdeas: `دليل استخدام كوبونات ${name} خطوة بخطوة\nأسباب عدم قبول كود خصم ${name} وكيف تتحقق منها\nكيف تقارن عروض ${name} قبل إتمام الطلب؟`,
    about: `يجمع هذا الدليل كوبونات ${name} المتاحة على كوبونيا مع شروطها وتواريخ انتهائها. راجع تفاصيل العرض وسياسات المتجر الحالية، وتأكد من تطبيق الخصم على طلبك قبل الدفع.`,
    faq: `كيف أستخدم كود خصم ${name}؟\nانسخ الكود وأدخله في خانة الخصم لدى المتجر، ثم تأكد من تغير الإجمالي قبل الدفع.\n\nلماذا قد لا يعمل كوبون ${name}؟\nقد يكون العرض منتهياً أو لا تنطبق شروطه على المنتجات أو قيمة الطلب. راجع تفاصيل الكوبون وشروط المتجر.`,
  };
}

export function storeMetadata(store: Store) {
  const defaults = storeSeoDefaults(store.name);
  return {
    title: store.seoTitle?.trim() || defaults.seoTitle,
    description: store.metaDescription?.trim() || store.summary?.trim() || defaults.metaDescription,
  };
}

export function storeStructuredData(store: Store, origin: string) {
  const url = `${origin}/stores/${encodeURIComponent(store.slug || store.name)}`;
  const faq = parseFaq(store.faq);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: storeMetadata(store).title, description: storeMetadata(store).description, inLanguage: "ar" },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: "المتاجر", item: `${origin}/stores` },
        { "@type": "ListItem", position: 3, name: store.name, item: url },
      ] },
      ...(faq.length ? [{ "@type": "FAQPage", "@id": `${url}#store-faq`, mainEntity: faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }] : []),
    ],
  };
}
