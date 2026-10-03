// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Nitro writes the client chunks here, so rollup/rolldown emits `sources` relative to this
// directory. configResolved is too early to read it (build.outDir is still "dist" there).
const clientAssetsDir = path.join(process.cwd(), ".output", "public", "assets");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    build: {
      sourcemap: true,
      // Vite 8 is rolldown-based: build.sourcemapPathTransform was removed, the hook moved to
      // output.sourcemapPathTransform. Rewriting sources to absolute filesystem paths is what
      // makes Chrome DevTools show them as clickable links that open the real file.
      rolldownOptions: {
        output: {
          sourcemapPathTransform: (sourcePath: string) => path.resolve(clientAssetsDir, sourcePath),
        },
      },
    },
  },
});
