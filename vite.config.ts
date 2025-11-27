import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa"; // <--- 1. Importul nou

export default defineConfig({
  plugins: [
    // Păstrăm plugin-urile tale originale
    reactRouter(),
    tsconfigPaths(),

    // <--- 2. Adăugăm Configurația Mobile App (PWA)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'], // Caută poza ta în folderul public
      manifest: {
        name: 'PetAssistant',
        short_name: 'PetAssistant',
        description: 'AI Pet Care Assistant',
        theme_color: '#16a34a', // Verdele aplicației tale
        background_color: '#ffffff',
        display: 'standalone', // <--- Asta ascunde bara de browser și o face Full Screen
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512', // Dimensiunea standard
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Reguli de siguranță să nu strice rutele React
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: null
      }
    })
  ],