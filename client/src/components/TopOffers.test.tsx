import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TopOffers from "./TopOffers";
import type { Coupon } from "@/lib/catalog";
import { Router } from "wouter";
const render = () => renderToStaticMarkup(<Router ssrPath="/deals"><TopOffers onReveal={vi.fn()}/></Router>);

const { catalog } = vi.hoisted(() => ({ catalog: { coupons: [] as Coupon[], deals: [], stores: [], isLive: true, loading: false, error: "", reload: vi.fn() } }));
vi.mock("@/contexts/CatalogContext", () => ({ useCatalog: () => catalog }));
describe("top offers", () => {
  it("renders live coupons with their store identity and code action without demo prices", () => {
    catalog.coupons = [{ store: "متجر حقيقي", code: "SAVE", discount: "10%", title: "خصم الطلب", description: "الشروط الفعلية", initial: "م", tone: "olive", uses: "", state: "published", verified: "", category: "أزياء" }];
    const html = render();
    expect(html).toContain("متجر حقيقي"); expect(html).toContain("إظهار الكود"); expect(html).toContain("10%");
    expect(html).not.toContain("عرض تجريبي"); expect(html).not.toContain("<del");
  });
  it("shows the load error instead of claiming no offers exist", () => {
    catalog.error = "network error";
    const html = render();
    expect(html).toContain("إعادة المحاولة"); expect(html).not.toContain("ترقّب العروض القادمة");
    catalog.error = "";
  });
  it("shows loading before rendering an empty state", () => {
    catalog.coupons = []; catalog.loading = true;
    expect(render()).toContain("نحمّل العروض");
    catalog.loading = false;
    expect(render()).toContain("ترقّب العروض القادمة");
  });
});
