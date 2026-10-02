export * from "./types";
export * from "./scoring";
export * from "./useRound";
export * from "./dailyRound";
export * from "./share";

// GlobeSurface is deliberately NOT re-exported here: it statically imports
// react-globe.gl/three, which touches `window` at module load and breaks any
// server-side evaluation (SSR, static export prerendering) of this barrel.
// Import it directly — see apps/web/src/components/GlobeSurfaceClient.tsx for
// the pattern (a next/dynamic + ssr:false wrapper around a direct import of
// "@twih/game-core/src/GlobeSurface").
export type { GlobeSurfaceProps } from "./GlobeSurface";
