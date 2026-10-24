import { describe, expect, it, vi } from "vitest";
import { fetchStoreSitemapPaths, sitemapXml } from "./storeSitemap";
const response = (rows: unknown) => new Response(JSON.stringify(rows), { status: 200 });
describe("public store sitemap", () => {
  it("includes only active non-empty names, deduplicates, and encodes names as one route segment", async () => {
    const fetcher = vi.fn().mockResolvedValue(response([
      {name:"اي هيرب & أكثر/عروض",active:true}, {name:"hidden",active:false},
      {name:"اي هيرب & أكثر/عروض",active:true}, {name:" ",active:true},
    ]));
    const paths = await fetchStoreSitemapPaths("https://example.supabase.co", "public-key", fetcher);
    expect(paths).toEqual(["/stores/" + encodeURIComponent("اي هيرب & أكثر/عروض")]);
    const [url, options] = fetcher.mock.calls[0];
    expect(url.searchParams.get("active")).toBe("eq.true");
    expect(options.headers).toEqual({apikey:"public-key"});
    expect(sitemapXml("https://coponya.com", ["/", ...paths, "/"])).toContain(paths[0]);
    expect(sitemapXml("https://coponya.com", ["/a?x=1&y=2"])).toContain("&amp;");
  });
  it("fetches the next page rather than truncating the catalog at 1000 rows", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response(Array.from({length:1000}, (_,i)=>({name:"store-"+i,active:true}))))
      .mockResolvedValueOnce(response([{name:"last",active:true}]));
    const paths = await fetchStoreSitemapPaths("https://example.supabase.co","public-key",fetcher);
    expect(paths).toHaveLength(1001);
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("offset")).toBe("1000");
  });
  it("allows unconfigured demo builds but fails configured builds on missing settings or fetch errors", async () => {
    expect(await fetchStoreSitemapPaths(undefined,undefined)).toEqual([]);
    await expect(fetchStoreSitemapPaths("https://example.supabase.co",undefined)).rejects.toThrow();
    await expect(fetchStoreSitemapPaths("https://example.supabase.co","key",vi.fn().mockResolvedValue(new Response("",{status:503})))).rejects.toThrow();
    await expect(fetchStoreSitemapPaths("https://example.supabase.co","key",vi.fn().mockResolvedValue(response({})))).rejects.toThrow();
  });
});
