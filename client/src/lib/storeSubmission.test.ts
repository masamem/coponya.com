import { describe, expect, it } from "vitest";
import { buildStoreSubmission } from "./storeSubmission";

const base = { store_name: " متجر  تجربة ", website_url: "https://shop.example.com", category: "أزياء", contact_name: "سارة", email: "Sara@Example.com", offer_type: "code", code: "SAVE20", offer: "خصم 20%" };

describe("buildStoreSubmission", () => {
  it("cleans and normalizes a valid code submission", () => {
    const r = buildStoreSubmission({ ...base, phone: "٠٥٥١٢٣٤٥٦٧", terms: "" });
    expect(r).toEqual({ ok: true, value: expect.objectContaining({ store_name: "متجر تجربة", email: "sara@example.com", phone: "0551234567", code: "SAVE20", terms: null, affiliate: "unsure" }) });
  });
  it("drops the code for deals and requires it for codes", () => {
    const deal = buildStoreSubmission({ ...base, offer_type: "deal", code: "IGNORED" });
    expect(deal.ok && deal.value.code).toBeNull();
    expect(buildStoreSubmission({ ...base, code: "" }).ok).toBe(false);
  });
  it("rejects bad urls, emails and phones", () => {
    expect(buildStoreSubmission({ ...base, website_url: "javascript:alert(1)" }).ok).toBe(false);
    expect(buildStoreSubmission({ ...base, website_url: "https://user:pw@shop.com" }).ok).toBe(false);
    expect(buildStoreSubmission({ ...base, email: "nope" }).ok).toBe(false);
    expect(buildStoreSubmission({ ...base, phone: "abc" }).ok).toBe(false);
  });
});
