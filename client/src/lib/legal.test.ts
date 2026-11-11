import { describe, expect, it } from "vitest";
import { legalPageHtml, legalPages, legalTextParts, operator, operatorLines } from "./legal";

describe("legal pages", () => {
  it("covers the pages the Ministry of Commerce checklist expects", () => {
    expect(Object.keys(legalPages).sort()).toEqual(["/about", "/complaints", "/privacy", "/terms"]);
    for (const page of Object.values(legalPages)) {
      expect(page.title).toBeTruthy();
      expect(page.description.length).toBeGreaterThan(30);
      expect(page.sections.length).toBeGreaterThan(2);
    }
  });
  it("only shows registration details that have been filled in", () => {
    const lines = operatorLines({ ...operator, legalName: "", commercialRegistration: "", vatNumber: "" });
    expect(lines.join(" ")).not.toMatch(/السجل التجاري|الرقم الضريبي|اسم المنشأة/);
    expect(lines.join(" ")).toContain(operator.supportEmail);
    const full = operatorLines({ ...operator, legalName: "مؤسسة مثال", commercialRegistration: "1010000000", vatNumber: "300000000000003" });
    expect(full).toContain("رقم السجل التجاري: 1010000000");
    expect(full).toContain("الرقم الضريبي: 300000000000003");
  });
  it("discloses affiliate commissions and names the right authorities", () => {
    const all = JSON.stringify(legalPages);
    expect(all).toContain("عمولة");
    expect(all).toContain("سدايا");
    expect(all).toContain("1900");
    expect(all).toContain("أنظمة المملكة العربية السعودية");
  });
  it("escapes text in the prerendered HTML", () => {
    const html = legalPageHtml({ title: "t", description: "d", sections: [["<b>", ["a & b", ["<i>"]]]] }, s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    expect(html).toBe("<section><h2>&lt;b&gt;</h2><p>a &amp; b</p><ul><li>&lt;i&gt;</li></ul></section>");
  });
  it("renders inline links and keeps plain text", () => {
    expect(legalTextParts("تعرض [أكواد الخصم](/coupons) هنا")).toEqual(["تعرض ", { label: "أكواد الخصم", href: "/coupons" }, " هنا"]);
    const html = legalPageHtml({ title: "t", description: "d", sections: [["h", ["a [b](/x) <c>"]]] }, s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    expect(html).toContain('<a href="/x">b</a>');
    expect(html).toContain("&lt;c&gt;");
  });
});
