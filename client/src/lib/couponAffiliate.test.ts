import { describe, it, expect, vi } from "vitest";
import { copyCouponCode, couponCopyOpensUrl } from "./couponAffiliate";

const noon = { code: "XXRMG", isDemo: false, websiteUrl: "https://s.noon.com/OoQcrZA2gGg?x=1" };

describe("copy button opens Noon", () => {
  it("opens the tracked Noon link unchanged for real coupons only", () => {
    expect(couponCopyOpensUrl(noon)).toBe(noon.websiteUrl);
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
    expect(calls).toEqual(["copy:XXRMG", `open:${noon.websiteUrl}`]);
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
