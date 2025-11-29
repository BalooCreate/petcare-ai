/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_ENV?: string;
  // Adaugă aici orice variabile de mediu ai în .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;

  /** Vite glob imports */
  glob: (pattern: string) => Record<string, () => Promise<any>>;

  /** Hot Module Replacement (HMR) */
  hot?: {
    accept: (cb: (module: any) => void) => void;
    dispose?: (cb: () => void) => void;
  };
}
