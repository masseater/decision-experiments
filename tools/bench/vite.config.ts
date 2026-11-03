import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      bench: {
        command: "node src/run.ts",
        cache: false,
      },
    },
  },
});
