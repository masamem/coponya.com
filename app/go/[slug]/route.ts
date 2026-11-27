// /go/<store-slug>[?c=<coupon id>]: records one outbound click, then forwards the shopper
// to the store's saved destination (its affiliate tracking link) with a 302.
// Recording never delays or blocks the redirect: it runs after the response, and any
// failure (backend down, migration not applied yet) is ignored.
import { after } from "next/server";
import type { StoreRecord } from "@/lib/backend";
import { findStoreBySegment, storePath } from "@/lib/storeSlug";
import { isLikelyBot, isPrefetch, safeOutboundUrl, validCouponId } from "@/lib/outbound";

export const dynamic = "force-dynamic";

const backendUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

type OutboundStore = Pick<StoreRecord, "id" | "name" | "website_url">;

async function activeStores(): Promise<OutboundStore[]> {
  if (!backendUrl || !publicKey) return [];
  try {
    const response = await fetch(`${backendUrl}/rest/v1/stores?select=id,name,website_url&active=eq.true`, {
      headers: { apikey: publicKey },
      next: { revalidate: 300, tags: ["catalog"] },
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok ? ((await response.json()) as OutboundStore[]) : [];
  } catch {
    return [];
  }
}

async function recordClick(storeId: string, couponId: string | null): Promise<void> {
  try {
    await fetch(`${backendUrl}/rest/v1/rpc/log_outbound_click`, {
      method: "POST",
      headers: { apikey: publicKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_store_id: storeId, p_coupon_id: couponId, p_source: couponId ? "coupon" : "store" }),
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // A missed count must never cost the shopper the redirect.
  }
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

async function resolve(request: Request, slug: string, count: boolean): Promise<Response> {
  const store = findStoreBySegment(await activeStores(), slug).store;
  const destination = safeOutboundUrl(store?.website_url);
  if (!store || !destination) {
    // Unknown or link-less store: send the shopper to Coponya's own page instead of a dead end.
    return redirect(new URL(store ? storePath(store.name) : "/stores", request.url).toString());
  }
  if (count && !isPrefetch(request.headers) && !isLikelyBot(request.headers.get("user-agent"))) {
    const couponId = validCouponId(new URL(request.url).searchParams.get("c"));
    after(() => recordClick(store.id, couponId));
  }
  return redirect(destination);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return resolve(request, (await params).slug, true);
}

/** Link checkers send HEAD: answer with the same redirect but do not count it. */
export async function HEAD(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return resolve(request, (await params).slug, false);
}
