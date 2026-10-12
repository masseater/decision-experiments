import { createAuthClient } from "better-auth/client";

import { BASE_PATH } from "#/shared/config";

export const authClient = createAuthClient({ basePath: `${BASE_PATH}/api/auth` });
