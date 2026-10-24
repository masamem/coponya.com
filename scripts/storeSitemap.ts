type Fetcher = typeof fetch;
const pageSize = 1000;

// Use the public REST API and existing RLS; never use an admin/service key here.
export async function fetchStoreSitemapPaths(
  backendUrl: string | undefined,
  publicKey: string | undefined,
  fetcher: Fetcher = fetch,
): Promise<string[]> {
  if (!backendUrl && !publicKey) return []; // Unconfigured demo/CI build.
  if (!backendUrl || !publicKey) throw new Error("Store sitemap requires both public Supabase settings.");
  const endpoint = new URL("/rest/v1/stores", backendUrl);
  if (endpoint.protocol !== "https:") throw new Error("Store sitemap requires an HTTPS backend.");
  const names = new Set<string>();
  for (let page = 0; page < 100; page++) {
    endpoint.search = new URLSearchParams({
      select: "name,active", active: "eq.true", order: "name.asc",
      limit: String(pageSize), offset: String(page * pageSize),
    }).toString();
    const response = await fetcher(endpoint, {
      headers: { apikey: publicKey },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("Unable to load public stores for sitemap.");
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("Invalid public store sitemap response.");
    for (const row of rows) {
      if (!row || typeof row.name !== "string" || typeof row.active !== "boolean") {
        throw new Error("Invalid public store sitemap row.");
      }
      if (row.active && row.name.trim()) names.add(row.name);
    }
    if (rows.length < pageSize) {
      return [...names].sort().map(name => `/stores/${encodeURIComponent(name)}`);
    }
  }
  throw new Error("Store sitemap pagination limit exceeded.");
}

export function sitemapXml(origin: string, paths: string[]) {
  const escape = (value: string) => value.replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]!));
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path => `<url><loc>${escape(origin + path)}</loc></url>`).join("")}</urlset>`;
}
