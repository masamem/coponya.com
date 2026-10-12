export type Consent = { analytics: boolean; marketing: boolean; savedAt: number; version: 1 };
export const CONSENT_KEY = "coponya-cookie-consent";
export const CONSENT_EVENT = "coponya-consent-change";
const duration = 180 * 24 * 60 * 60 * 1000;
export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const c = JSON.parse(raw || "null");
    return c && c.version === 1 && typeof c.analytics === "boolean" && typeof c.marketing === "boolean"
      && typeof c.savedAt === "number" && Number.isFinite(c.savedAt) && c.savedAt <= now && now - c.savedAt < duration ? c : null;
  } catch { return null; }
}
export function readConsent(): Consent | null { try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return null; } }
type Queue = ((...args: unknown[]) => void) & { queue?: unknown[][]; push?: Queue; loaded?: boolean; version?: string; callMethod?: (...args: unknown[]) => void };
declare global { interface Window { dataLayer?: unknown[]; gtag?: Queue; fbq?: Queue; _fbq?: Queue; } }
const ga = /^G-[A-Z0-9]+$/.test(import.meta.env.VITE_GA_MEASUREMENT_ID || "") ? import.meta.env.VITE_GA_MEASUREMENT_ID : "";
const ads = /^AW-\d+$/.test(import.meta.env.VITE_GOOGLE_ADS_ID || "") ? import.meta.env.VITE_GOOGLE_ADS_ID : "";
const meta = /^\d+$/.test(import.meta.env.VITE_META_PIXEL_ID || "") ? import.meta.env.VITE_META_PIXEL_ID : "";
let googleStarted = false, metaStarted = false;
let lastPage = "";
function loadScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script"); script.id = id; script.src = src; script.async = true; document.head.append(script);
}
function googleConsent(c: Consent | null) {
  return { analytics_storage: c?.analytics ? "granted" : "denied", ad_storage: c?.marketing ? "granted" : "denied",
    ad_user_data: c?.marketing ? "granted" : "denied", ad_personalization: c?.marketing ? "granted" : "denied" };
}
export function applyTrackingConsent() {
  const c = readConsent();
  // Basic consent mode: no Google or Meta script is requested before permission.
  if ((ga && c?.analytics || ads && c?.marketing) && !googleStarted) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag("consent", "default", googleConsent(null));
    window.gtag("consent", "update", googleConsent(c));
    window.gtag("js", new Date());
    loadScript("coponya-google-tag", `https://www.googletagmanager.com/gtag/js?id=${ga && c?.analytics ? ga : ads}`);
    googleStarted = true;
  }
  if (googleStarted) {
    window.gtag?.("consent", "update", googleConsent(c));
    if (ga && c?.analytics) window.gtag?.("config", ga, { send_page_view: false });
    if (ads && c?.marketing) window.gtag?.("config", ads, { send_page_view: false });
  }
  if (meta && c?.marketing && !metaStarted) {
    const fbq: Queue = function (...args: unknown[]) { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue!.push(args); };
    fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
    window.fbq = fbq; window._fbq = fbq;
    fbq("consent", "grant"); fbq("init", meta);
    loadScript("coponya-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js"); metaStarted = true;
  }
  if (metaStarted) window.fbq?.("consent", c?.marketing ? "grant" : "revoke");
}
export function publicTrackingPath(path: string) {
  // Never transmit searches, coupon codes in query strings, admin or account pages.
  const clean = path.split(/[?#]/)[0];
  return /^\/(?:$|stores(?:\/.*)?$|coupons$|categories(?:\/.*)?$|deals$|blog(?:\/.*)?$)/.test(clean) ? clean : null;
}
export function trackPage(path: string, force = false) {
  const clean = publicTrackingPath(path), c = readConsent();
  if (!c && (googleStarted || metaStarted)) { applyTrackingConsent(); location.reload(); return; }
  if (!clean || !c || (!c.analytics && !c.marketing)) return;
  applyTrackingConsent();
  const key = `${clean}:${c.analytics}:${c.marketing}`;
  if (!force && key === lastPage) return; lastPage = key;
  const url = `https://coponya.com${clean}`;
  if (ga && c.analytics) window.gtag?.("event", "page_view", { send_to: ga, page_location: url, page_title: document.title });
  if (meta && c.marketing && !location.search && !location.hash) window.fbq?.("track", "PageView");
}
export function saveConsent(analytics: boolean, marketing: boolean) {
  const previous = readConsent();
  const c: Consent = { analytics, marketing, savedAt: Date.now(), version: 1 };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch { return false; }
  applyTrackingConsent(); window.dispatchEvent(new Event(CONSENT_EVENT));
  if (previous && (previous.analytics && !analytics || previous.marketing && !marketing)) {
    // Remove known first-party tracking cookies and unload already executing tags.
    const domains = ["", location.hostname, `.${location.hostname}`, ".coponya.com"];
    document.cookie.split(";").forEach(part => {
      const name = part.trim().split("=")[0];
      if (/^(?:_ga(?:_|$)|_gid$|_gat|_gcl_|_fbp$|_fbc$)/.test(name)) domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
      });
    });
    location.reload();
  } else trackPage(location.pathname, true);
  return true;
}
