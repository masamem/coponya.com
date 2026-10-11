import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "../client/src/App";
import type { CatalogSnapshot } from "../client/src/contexts/CatalogContext";
export { mapCatalog } from "../client/src/lib/liveCatalog";
export { storeMetadata, storeStructuredData } from "../client/src/lib/storeSeo";
export {
  articleMetadata,
  articleSchema,
  couponMetadata,
  couponSchema,
} from "../client/src/lib/seo";
export { pages } from "../client/src/pages/CatalogPage";
export { stores, coupons, categories } from "../client/src/lib/data";
export function render(location: string, initial: CatalogSnapshot) {
  return renderToString(
    <Router ssrPath={location}>
      <App initial={initial} />
    </Router>,
  );
}
