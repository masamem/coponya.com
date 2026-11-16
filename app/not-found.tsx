import App from "@/App";

export const metadata = { title: "الصفحة غير موجودة — Coponya · كوبونيا", robots: { index: false, follow: true } };

/**
 * Real 404 status, rendered with the site's own "page not found" view. It gets no
 * server catalog on purpose: Next embeds this fallback in every page's payload, and
 * the app loads the catalog in the browser if the visitor navigates on from here.
 */
export default function NotFound() {
  return <App ssrPath="/404" initialCatalog={null} />;
}
