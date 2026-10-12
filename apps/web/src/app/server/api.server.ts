import { todoRoutes } from "#/pages/home/index.server";
import { inspectRoutes } from "#/pages/inspect/index.server";
import { createRouter } from "#/shared/api/index.server";
import { auth } from "#/shared/auth/index.server";

export const api = createRouter("").mount(auth.handler).use(todoRoutes).use(inspectRoutes);
