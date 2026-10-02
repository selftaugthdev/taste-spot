"use client";

// Import the file directly, NOT the "@twih/game-core" barrel — the barrel
// deliberately excludes GlobeSurface from its re-exports (see game-core's
// index.ts) so that a plain `import { ... } from "@twih/game-core"` never
// drags react-globe.gl/three into a server-evaluated module graph. This
// wrapper also gives GlobeSurface a default export, which next/dynamic needs
// to reliably skip it during the static export's build-time prerender pass.
export { GlobeSurface as default } from "@twih/game-core/src/GlobeSurface";
