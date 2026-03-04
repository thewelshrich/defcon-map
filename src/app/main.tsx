import { createRoot } from "react-dom/client";

import { App } from "./App";
import { AppProviders } from "./providers";
import "../styles/tokens.css";
import "../styles/crt.css";
import "../styles/globals.css";
import "../styles/app.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <AppProviders>
    <App />
  </AppProviders>
);
