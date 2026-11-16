import { describe, expect, it } from "vitest";
import { storeHeading } from "./StoreProfile";

describe("store page heading", () => {
  it("uses the primary keyword when the store has one", () => {
    expect(storeHeading({ name: "noon - نون", primaryKeyword: " كود خصم نون السعودية 2026 " })).toBe("كود خصم نون السعودية 2026");
  });
  it("falls back to the store name", () => {
    expect(storeHeading({ name: "shein" })).toBe("كوبونات shein");
    expect(storeHeading({ name: "shein", primaryKeyword: "  " })).toBe("كوبونات shein");
  });
});
