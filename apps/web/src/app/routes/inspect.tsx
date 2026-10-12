import { createFileRoute } from "@tanstack/react-router";

import { InspectPage } from "#/pages/inspect";

const Route = createFileRoute("/inspect")({
  component: InspectPage,
});

export { Route };
