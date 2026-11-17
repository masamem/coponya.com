import { describe, expect, it } from "vitest";
import { parseRichText, richToPlain } from "./richText";

describe("parseRichText", () => {
  it("keeps plain paragraphs as before", () => {
    expect(parseRichText("سطر أول\nسطر ثاني\n\nفقرة ثانية")).toEqual([
      { type: "p", text: "سطر أول\nسطر ثاني" },
      { type: "p", text: "فقرة ثانية" },
    ]);
  });

  it("reads headings, lists and tables", () => {
    const blocks = parseRichText([
      "### كيف تستخدم كود خصم نون؟",
      "1. انسخ الكود",
      "2. ألصقه في السلة",
      "",
      "- **فئات مستثناة:** بعض الماركات",
      "- كود للعملاء الجدد",
      "",
      "| القسم | أبرز ما فيه |",
      "| --- | --- |",
      "| الإلكترونيات | جوالات |",
      "| الجمال | عطور |",
    ].join("\n"));
    expect(blocks).toEqual([
      { type: "h3", text: "كيف تستخدم كود خصم نون؟" },
      { type: "ol", items: ["انسخ الكود", "ألصقه في السلة"] },
      { type: "ul", items: ["**فئات مستثناة:** بعض الماركات", "كود للعملاء الجدد"] },
      { type: "table", head: ["القسم", "أبرز ما فيه"], rows: [["الإلكترونيات", "جوالات"], ["الجمال", "عطور"]] },
    ]);
  });

  it("strips marks for plain text", () => {
    expect(richToPlain("### عنوان\n**مهم** في [كوبونيا](/stores)")).toBe("عنوان\nمهم في كوبونيا");
  });
});
