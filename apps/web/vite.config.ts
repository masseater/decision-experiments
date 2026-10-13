import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

import { BASE_PATH } from "./base-path.ts";

export default defineConfig({
  base: `${BASE_PATH}/`,
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      { extends: true, test: { name: "app", include: ["src/**/*.test.{ts,tsx}"] } },
      { extends: false, test: { name: "alchemy", include: ["*.test.ts"] } },
    ],
  },
  plugins: [tailwindcss(), viteReact()],
});
