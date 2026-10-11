import { createRoot } from "react-dom/client";
import App from "./App";
import type { CatalogSnapshot } from "./contexts/CatalogContext";
declare global { interface Window { __CATALOG__?: CatalogSnapshot } }
import "./index.css";

createRoot(document.getElementById("root")!).render(<App initial={window.__CATALOG__} />);
