/**
 * ✅ Patch pentru Windows + Vite + React Router (fix ?update=)
 */
export function windowsRouteImportFix() {
  return {
    name: "windows-route-import-fix",
    /** @type {'pre'} */
    enforce: "pre",

    resolveId(id) {
      if (id && id.includes("?update=")) {
        const cleanId = id.split("?")[0];
        console.log(`🧩 [vite] Windows route import fix applied: ${cleanId}`);
        return cleanId;
      }
      return null;
    },

    load() {
      if (typeof globalThis.require === "undefined") {
        globalThis.require = (path) => import(path);
      }
      if (typeof globalThis.module === "undefined") {
        globalThis.module = { exports: {} };
      }
      return null;
    },
  };
}
