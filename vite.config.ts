import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";
import { reactRouterHonoServer } from "react-router-hono-server/dev";
import { windowsRouteImportFix } from "./vite-patch.js";

export default defineConfig({
  envPrefix: "NEXT_PUBLIC_",
  plugins: [
    windowsRouteImportFix(),
    tsconfigPaths(),
    reactRouter(),
    reactRouterHonoServer({
      serverEntryPoint: "./__create/index.ts",
      runtime: "node"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    dedupe: ["react", "react-dom"]
  },
  server: {
    host: "0.0.0.0",
    port: 4000,
    hmr: { overlay: false }
  }
});
