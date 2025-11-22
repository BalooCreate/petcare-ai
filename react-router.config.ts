import type { Config } from '@react-router/dev/config';

export default {
  // Păstrăm directorul aplicației tale
  appDirectory: './src/app',
  
  // Activăm SSR (Server Side Rendering) - necesar pentru Auth/DB
  ssr: true,
  
  // 🛑 DEZACTIVĂM Prerendering-ul
  // Asta rezolvă eroarea de Windows și e setarea corectă pentru aplicații dinamice
  prerender: false,
} satisfies Config;