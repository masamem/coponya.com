import { CatalogProvider, type CatalogSnapshot } from "./contexts/CatalogContext";
/* سوق الضوء: global RTL shell for Coponya, with a light editorial commerce tone. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return <Home />;
}

export default function App({ initial }: { initial?: CatalogSnapshot }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CatalogProvider initial={initial}><Router /></CatalogProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
