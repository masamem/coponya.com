import { afterEach, describe, expect, it, vi } from "vitest";
import { parseConsent, publicTrackingPath } from "./tracking";
describe("consent validation", () => {
  const now = Date.now();
  it("fails closed for missing, malformed, expired and future preferences", () => {
    for (const raw of [null, "bad", "{}", JSON.stringify({ version:1, analytics:true, marketing:true, savedAt:now + 1 }),
      JSON.stringify({version:1, analytics:true, marketing:true, savedAt:now - 181 * 86400000})]) expect(parseConsent(raw,now)).toBeNull();
  });
  it("preserves independent category choices", () => {
    expect(parseConsent(JSON.stringify({version:1, analytics:true, marketing:false, savedAt:now}),now)?.marketing).toBe(false);
  });
});
describe("tracking privacy", () => {
  it("excludes private and search pages", () => {
    for (const path of ["/admin", "/account", "/search?q=email", "/report", "/privacy", "/favorites", "/contact"]) expect(publicTrackingPath(path)).toBeNull();
  });
  it("strips query strings and fragments from public paths", () => {
    expect(publicTrackingPath("/stores/example?coupon=secret#code")).toBe("/stores/example");
  });
});
describe("optional tag loading", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });
  async function setup(consent: unknown) {
    vi.resetModules();
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("VITE_GOOGLE_ADS_ID", "AW-123456");
    vi.stubEnv("VITE_META_PIXEL_ID", "123456789");
    const append = vi.fn();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: () => consent ? JSON.stringify(consent) : null });
    vi.stubGlobal("document", { getElementById: () => null, createElement: () => ({}), head: { append } });
    const tracking = await import("./tracking");
    tracking.applyTrackingConsent(); return append;
  }
  it("requests no optional scripts before consent or after rejection", async () => {
    expect(await setup(null)).not.toHaveBeenCalled();
    expect(await setup({version:1, analytics:false, marketing:false, savedAt:Date.now()})).not.toHaveBeenCalled();
  });
  it("loads Google only for analytics-only consent", async () => {
    const append = await setup({version:1, analytics:true, marketing:false, savedAt:Date.now()});
    expect(append).toHaveBeenCalledTimes(1);
    expect(append.mock.calls[0][0].src).toContain("googletagmanager.com");
  });
  it("loads configured marketing tags after marketing permission", async () => {
    const append = await setup({version:1, analytics:false, marketing:true, savedAt:Date.now()});
    expect(append).toHaveBeenCalledTimes(2);
  });
});
