export const siteBrand = {
  name: "كوبونيا",
  englishName: "Coponya",
  origin: "https://coponya.com",
  title: "كوبونيا | Coponya — أكواد خصم وكوبونات متاجر السعودية",
  description: "كوبونيا (Coponya) منصة عربية لاكتشاف أكواد الخصم وكوبونات المتاجر في السعودية. تصفح العروض، واقرأ شروط الكوبون، وانسخ الكود لاستخدامه لدى المتجر.",
  socialProfiles: ["https://www.instagram.com/coponya.sa/", "https://www.tiktok.com/@coponya"],
} as const;

export function siteBrandStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteBrand.origin}/#website`,
        url: `${siteBrand.origin}/`,
        name: siteBrand.name,
        alternateName: [siteBrand.englishName, "كوبونيا Coponya"],
        description: siteBrand.description,
        inLanguage: "ar",
        publisher: { "@id": `${siteBrand.origin}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteBrand.origin}/#organization`,
        url: `${siteBrand.origin}/`,
        name: siteBrand.name,
        alternateName: siteBrand.englishName,
        sameAs: [...siteBrand.socialProfiles],
      },
    ],
  };
}
