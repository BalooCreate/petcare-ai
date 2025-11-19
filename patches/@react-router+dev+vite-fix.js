// ✅ Patch pentru eroarea ERR_REQUIRE_ESM (p-map în @react-router/dev)
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Module = require("module");
const originalRequire = Module.prototype.require;

// Suprascriem temporar metoda require()
Module.prototype.require = function (id) {
  // Dacă e "p-map", îl importăm corect ca ESM
  if (id === "p-map") {
    return (async () => {
      const module = await import("p-map");
      return module.default || module;
    })();
  }

  // Pentru restul, comportament normal
  return originalRequire.apply(this, arguments);
};

console.log("✅ Patch @react-router/dev vite-fix.js aplicat cu succes");
