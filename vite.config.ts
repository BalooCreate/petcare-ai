import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// Importăm patch-ul pe care l-am creat pentru Windows
import { windowsRouteImportFix } from "./vite-patch";

export default defineConfig({
  plugins: [
    // 1. Aplicăm patch-ul pentru Windows (sigur și curat)
    windowsRouteImportFix(),
    
    // 2. Plugin-ul esențial React Router (asta căuta eroarea ta!)
    reactRouter(),
    
    // 3. Plugin pentru path-uri din tsconfig (ex: @/...)
    tsconfigPaths(),
  ],
  // Opțional: Optimizări pentru build
  build: {
    cssMinify: true,
    ssr: true,
  }
});