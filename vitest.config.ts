import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [react()],
  test: { include: ["client/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});
