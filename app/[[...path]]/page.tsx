import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import App from "@/App";
import { loadCatalog, serverBackendConfigured } from "@/lib/serverCatalog";
import { pathFromSegments, routeMetadata } from "@/lib/routeMetadata";
import { pages } from "@/lib/pageInfo";
import { articles } from "@/lib/articles";
import { storeSlug } from "@/lib/storeSlug";
import { siteBrand } from "@/lib/siteBrand";

// Pages are cached and refreshed in the background every 5 minutes (ISR).
export const revalidate = 300;

type Props = { params: Promise<{ path?: string[] }> };

const getCatalog = cache(async () => {
  const catalog = await loadCatalog();
  // A configured backend that fails must not publish an empty page: throwing keeps
  // the last good cached version in place until the next successful refresh.
  if (serverBackendConfigured && !catalog) throw new Error("Catalog unavailable");
  return catalog;
});

const resolve = cache(async (segments?: string[]) => {
  const path = pathFromSegments(segments);
  const catalog = await getCatalog();
  return { path, catalog, meta: routeMetadata(path, catalog?.stores ?? null) };
});

/** Builds the public routes and every active store page at deploy time; others render on first visit. */
export async function generateStaticParams() {
  const fixed = ["/", "/blog", ...Object.keys(pages).filter(p => !["/favorites", "/account", "/report"].includes(p)), ...articles.map(a => `/blog/${a.slug}`)];
  const catalog = await loadCatalog();
  const stores = (catalog?.stores ?? []).map(store => `/stores/${storeSlug(store.name)}`);
  return [...fixed, ...stores].map(path => ({ path: path === "/" ? [] : path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meta } = await resolve((await params).path);
  if (meta.kind !== "page") return {};
  const url = siteBrand.origin + meta.path;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    robots: meta.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { siteName: siteBrand.name, title: meta.title, description: meta.description, url, type: meta.ogType, locale: "ar_SA" },
    twitter: { card: "summary", title: meta.title, description: meta.description },
  };
}

export default async function Page({ params }: Props) {
  const { path, catalog, meta } = await resolve((await params).path);
  if (meta.kind === "redirect") permanentRedirect(meta.to);
  if (meta.kind === "not-found") notFound();
  const schemaId = meta.path === "/" ? "site-brand-schema" : "store-schema";
  return (
    <>
      {meta.schema ? (
        <script id={schemaId} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.schema).replace(/</g, "\\u003c") }} />
      ) : null}
      <App ssrPath={path} initialCatalog={catalog} />
    </>
  );
}
