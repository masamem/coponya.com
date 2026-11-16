import { describe, expect, it } from "vitest";
import { findStoreBySegment, storePath, storeSlug } from "./storeSlug";
import { storeMetadata } from "./storeSeo";

const names = ["noon - نون", "iHerb - اي هيرب", "shein", "صيدلية النهدي", "H&M - اتش آند ام", "Bath & Body Works", "  Ounass - اوناس  ", "اي هيرب & أكثر/عروض", "!!!"];

describe("store slugs", () => {
  it("uses the English brand name when the store name has one", () => {
    expect(storeSlug("noon - نون")).toBe("noon");
    expect(storeSlug("iHerb - اي هيرب")).toBe("iherb");
    expect(storeSlug("shein")).toBe("shein");
    expect(storeSlug("H&M - اتش آند ام")).toBe("h-and-m");
  });
  it("keeps Arabic-only names readable and URL-safe as one path segment", () => {
    expect(storeSlug("صيدلية النهدي")).toBe("صيدلية-النهدي");
    expect(storeSlug("اي هيرب & أكثر/عروض")).not.toContain("/");
    expect(storePath("صيدلية النهدي")).toBe("/stores/" + encodeURIComponent("صيدلية-النهدي"));
    expect(storeSlug("!!!")).toBe("store");
  });
  it("finds stores by slug and flags legacy full-name links", () => {
    const stores = [{ name: "noon - نون" }, { name: "shein" }];
    expect(findStoreBySegment(stores, "noon")).toEqual({ store: stores[0], legacy: false });
    expect(findStoreBySegment(stores, "noon - نون")).toEqual({ store: stores[0], legacy: true });
    expect(findStoreBySegment(stores, "missing").store).toBeUndefined();
  });
});
