import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Pe server (Linux) nu avem nevoie de fix-ul pentru Windows.
    // Lăsăm doar pluginurile esențiale.
    reactRouter(),
    tsconfigPaths(),
  ],
  // Asigurăm că build-ul e optimizat
  build: {
    cssMinify: true,
    ssr: true,
  }
});