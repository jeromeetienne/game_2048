// Ambient type declarations (no runtime code). These make `tsc` aware of
// Vite-specific features so type-checking passes; they are not bundled.

// `vite/client`: types for `import.meta.env` and asset imports (e.g. `import './style.css'`).
/// <reference types="vite/client" />
// `vite-plugin-pwa/client`: declares the virtual `virtual:pwa-register` module
// (generated at build time) imported in main.ts.
/// <reference types="vite-plugin-pwa/client" />

/** Build-time service worker version string, injected via Vite `define`. */
declare const __SW_VERSION__: string;
