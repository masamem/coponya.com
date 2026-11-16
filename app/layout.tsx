import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteBrand } from "@/lib/siteBrand";
import "@/index.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteBrand.origin),
  title: siteBrand.title,
  description: siteBrand.description,
  icons: {
    icon: [
      { url: "/brand/coponya-search-icon.png?v=20261030-colors", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico?v=20261030-colors", sizes: "32x32 48x48 96x96" },
      { url: "/brand/coponya-google-white.svg?v=20261030-colors", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/brand/coponya-icon-180.png?v=20261030-colors", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#146B5B",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/alexandria/Alexandria-Variable.ttf" as="font" type="font/ttf" crossOrigin="" />
      </head>
      <body>
        <div id="root">{children}</div>
        {/* Vercel Web Analytics: visitor and page-view counts. */}
        <script dangerouslySetInnerHTML={{ __html: "window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };" }} />
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
