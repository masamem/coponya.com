import type { NextConfig } from "next";

// The public Supabase/tracking settings keep their existing VITE_* names in Vercel,
// so no environment variables need renaming. Next inlines these into client code.
const publicEnv = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_GA_MEASUREMENT_ID",
  "VITE_GOOGLE_ADS_ID",
  "VITE_META_PIXEL_ID",
  "VITE_OAUTH_PORTAL_URL",
  "VITE_APP_ID",
  "VITE_FRONTEND_FORGE_API_KEY",
  "VITE_FRONTEND_FORGE_API_URL",
] as const;

const nextConfig: NextConfig = {
  env: Object.fromEntries(publicEnv.map(key => [key, process.env[key] ?? ""])),
  images: { unoptimized: true },
};

export default nextConfig;
