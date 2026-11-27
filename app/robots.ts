import type { MetadataRoute } from "next";
import { siteBrand } from "@/lib/siteBrand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/favorites", "/search", "/go/"] },
    sitemap: `${siteBrand.origin}/sitemap.xml`,
  };
}
