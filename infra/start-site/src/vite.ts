import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { Option } from "effect";
import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

interface SiteOptions {
  readonly basePath: string;
  readonly searchIndexOrigin: Option.Option<string>;
}

const SITEMAP_FILE = "sitemap.xml";

const startSiteConfig = ({ basePath, searchIndexOrigin }: SiteOptions): UserConfig =>
  defineConfig({
    base: `${basePath}/`,
    resolve: { tsconfigPaths: true },
    environments: { client: { build: { outDir: `dist/client${basePath}` } } },
    test: {
      projects: [
        { extends: true, test: { name: "app", include: ["src/**/*.test.{ts,tsx}"] } },
        { extends: false, test: { name: "alchemy", include: ["*.test.ts"] } },
      ],
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src/app",
        rsc: { enabled: true },
        prerender: { enabled: true, crawlLinks: true },
        pages: [{ path: "/" }],
        sitemap: Option.match(searchIndexOrigin, {
          onNone: () => ({ enabled: false }),
          onSome: (host) => ({ host, outputPath: SITEMAP_FILE }),
        }),
      }),
      rsc(),
      viteReact(),
    ],
  });

export { startSiteConfig };
export type { SiteOptions };
