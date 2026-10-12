import { CatalogProvider } from "./contexts/CatalogContext";
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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CatalogProvider><Router /></CatalogProvider>
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
