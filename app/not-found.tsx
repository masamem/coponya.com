import App from "@/App";
import { loadCatalog } from "@/lib/serverCatalog";

export const metadata = { title: "الصفحة غير موجودة — Coponya · كوبونيا", robots: { index: false, follow: true } };

/** Real 404 status, rendered with the site's own "page not found" view. */
export default async function NotFound() {
  return <App ssrPath="/404" initialCatalog={await loadCatalog()} />;
}
