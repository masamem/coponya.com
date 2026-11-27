import { describe, it, expect, vi } from "vitest";
import { copyCouponCode, couponCopyOpensUrl } from "./couponAffiliate";

const noon = { code: "XXRMG", isDemo: false, store: "noon - نون", id: "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90", websiteUrl: "https://s.noon.com/OoQcrZA2gGg?x=1" };
const tracked = "/go/noon?c=3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";

describe("copy button opens Noon", () => {
  it("opens the counted /go path for real Noon coupons only", () => {
    expect(couponCopyOpensUrl(noon)).toBe(tracked);
    expect(couponCopyOpensUrl({ ...noon, id: undefined })).toBe("/go/noon");
    expect(couponCopyOpensUrl({ ...noon, isDemo: true })).toBeNull();
    expect(couponCopyOpensUrl({ ...noon, isDemo: undefined })).toBeNull();
    expect(couponCopyOpensUrl({ ...noon, websiteUrl: "https://www.noon.com/saudi-ar/" })).toBeNull();
    expect(couponCopyOpensUrl({ ...noon, websiteUrl: "http://s.noon.com/OoQcrZA2gGg" })).toBeNull();
    expect(couponCopyOpensUrl({ ...noon, websiteUrl: "https://shein.com" })).toBeNull();
  });

  it("starts the copy before opening the tab, and reports both", async () => {
    const calls: string[] = [];
    const writeText = vi.fn(async (t: string) => { calls.push(`copy:${t}`); });
    const open = vi.fn((u: string) => { calls.push(`open:${u}`); });
    expect(await copyCouponCode(noon, { writeText, open })).toEqual({ copied: true, opened: true });
    expect(calls).toEqual(["copy:XXRMG", `open:${tracked}`]);
  });

  it("only copies for other stores", async () => {
    const open = vi.fn();
    expect(await copyCouponCode({ ...noon, websiteUrl: "https://shein.com" }, { writeText: async () => {}, open })).toEqual({ copied: true, opened: false });
    expect(open).not.toHaveBeenCalled();
  });

  it("still opens Noon when the clipboard fails, including a synchronous throw", async () => {
    const open = vi.fn();
    expect(await copyCouponCode(noon, { writeText: () => { throw new Error("no clipboard"); }, open })).toEqual({ copied: false, opened: true });
    expect(await copyCouponCode(noon, { writeText: () => Promise.reject(new Error("denied")), open })).toEqual({ copied: false, opened: true });
    expect(open).toHaveBeenCalledTimes(2);
  });
});
