import { createFileRoute } from "@tanstack/react-router";

import { HomePage, loadHomePage } from "#/pages/home";

const Route = createFileRoute("/todos")({
  loader: ({ context }) => loadHomePage(context.queryClient),
  component: HomePage,
});

export { Route };
