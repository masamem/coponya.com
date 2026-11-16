"use client";
import { CatalogProvider, type InitialCatalog } from "./contexts/CatalogContext";
import { Router as WouterRouter } from "wouter";
/* سوق الضوء: global RTL shell for Coponya, with a light editorial commerce tone. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CookieConsent from "./components/CookieConsent";

function Router() {
  return <Home />;
}

/**
 * The whole interactive site. Next renders it on the server for the requested path
 * (`ssrPath`) with the catalog it loaded, then the browser hydrates it and wouter
 * takes over navigation as before.
 */
export default function App({ ssrPath, ssrSearch, initialCatalog }: { ssrPath: string; ssrSearch?: string; initialCatalog?: InitialCatalog | null }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CatalogProvider initial={initialCatalog}><WouterRouter ssrPath={ssrPath} ssrSearch={ssrSearch}><Router /></WouterRouter></CatalogProvider>
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
