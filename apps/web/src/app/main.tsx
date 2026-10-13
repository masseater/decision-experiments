import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppShell } from "#/app/shell/app-shell";
import { InspectPage } from "#/pages/inspect";

globalThis.addEventListener("vite:preloadError", () => {
  globalThis.location.reload();
});

const root = document.querySelector("#root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <AppShell>
        <InspectPage />
      </AppShell>
    </StrictMode>,
  );
}
