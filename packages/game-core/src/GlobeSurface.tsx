"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GlobeGL from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import type { GlobeMark, MapSurfaceProps } from "./types";

/**
 * react-globe.gl/three-globe load the globe texture with three.js defaults,
 * which leave anisotropic filtering off (anisotropy: 1). On a sphere that's
 * viewed at an angle almost everywhere, that makes the texture look noticeably
 * blurrier than its native resolution once the camera zooms in — and there's
 * no public prop to configure it, so this reaches into the underlying
 * three.js scene (the one documented workaround for this library) to turn it
 * on for every textured material once the globe's texture has loaded.
 */
function sharpenGlobeTextures(globe: GlobeMethods): void {
  const maxAnisotropy = globe.renderer().capabilities.getMaxAnisotropy();
  globe.scene().traverse((object: unknown) => {
    const material = (object as { material?: { map?: { anisotropy: number; needsUpdate: boolean } } })
      .material;
    if (material?.map) {
      material.map.anisotropy = maxAnisotropy;
      material.map.needsUpdate = true;
    }
  });
}

// three-globe's fixed internal sphere radius (not exported publicly, but a
// stable part of its coordinate system — it's what `altitude` in pointOfView
// is relative to: world-unit distance from center = radius * (1 + altitude)).
const GLOBE_RADIUS_UNITS = 100;

// Past this altitude, the single static 8192px texture visibly softens —
// there's no higher native resolution to sample from, so rather than let
// pinch/scroll zoom magnify into a blurry mess, this is enforced as a hard
// floor on both the automatic reveal camera and manual zoom (OrbitControls).
const DEFAULT_MIN_ZOOM_ALTITUDE = 0.5;
const DEFAULT_MAX_ZOOM_ALTITUDE = 4;

export interface GlobeSurfaceProps extends MapSurfaceProps {
  /** Self-hosted texture path (e.g. /globe/earth-day.jpg) — the caller picks day/night per theme. */
  globeImageUrl: string;
  backgroundColor?: string;
  /** Closest the camera (automatic or manual pinch/scroll zoom) is allowed to get. */
  minZoomAltitude?: number;
  /** Farthest the camera is allowed to zoom out to. */
  maxZoomAltitude?: number;
}

function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

/**
 * The 3D globe implementation of the game's tap-to-guess surface. A future
 * niche that needs a flat 2D diagram (e.g. anatomy) would implement this same
 * prop shape — marks / arc / interactive / onTap / focus — against an image
 * instead of a globe, so game logic (useRound, scoring) never has to change.
 */
export function GlobeSurface({
  marks,
  arc,
  interactive,
  onTap,
  focus,
  globeImageUrl,
  backgroundColor = "rgba(0,0,0,0)",
  minZoomAltitude = DEFAULT_MIN_ZOOM_ALTITUDE,
  maxZoomAltitude = DEFAULT_MAX_ZOOM_ALTITUDE,
}: GlobeSurfaceProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { ref: containerRef, size } = useContainerSize<HTMLDivElement>();
  const hasFramedInitialView = useRef(false);

  const handleGlobeReady = useCallback(() => {
    if (globeRef.current) sharpenGlobeTextures(globeRef.current);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !focus) return;
    // Defensive clamp: even if a caller requests a tighter altitude than the
    // texture supports, never zoom in further than minZoomAltitude.
    const altitude = Math.max(minZoomAltitude, focus.altitude);
    globeRef.current.pointOfView({ lat: focus.center.lat, lng: focus.center.lng, altitude }, 1000);
  }, [focus, minZoomAltitude]);

  // Frame a pleasant default view once the globe first mounts with real size,
  // and bound manual pinch/scroll zoom to the same range the texture supports.
  useEffect(() => {
    if (hasFramedInitialView.current || !globeRef.current || size.width === 0) return;
    hasFramedInitialView.current = true;
    globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
    const controls = globeRef.current.controls();
    controls.minDistance = GLOBE_RADIUS_UNITS * (1 + minZoomAltitude);
    controls.maxDistance = GLOBE_RADIUS_UNITS * (1 + maxZoomAltitude);
  }, [size.width, minZoomAltitude, maxZoomAltitude]);

  const arcsData = arc
    ? [
        {
          startLat: arc.from.lat,
          startLng: arc.from.lng,
          endLat: arc.to.lat,
          endLng: arc.to.lng,
          color: arc.color ?? "#a1a1aa",
        },
      ]
    : [];

  return (
    <div ref={containerRef} className="h-full w-full touch-none">
      {size.width > 0 && size.height > 0 && (
        <GlobeGL
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeImageUrl={globeImageUrl}
          backgroundColor={backgroundColor}
          onGlobeReady={handleGlobeReady}
          showAtmosphere
          atmosphereColor="#60a5fa"
          atmosphereAltitude={0.2}
          // Keep polygon/point detail low — this needs to stay smooth on mid-range phones.
          globeCurvatureResolution={4}
          onGlobeClick={(coords) => {
            if (interactive) onTap?.({ lat: coords.lat, lng: coords.lng });
          }}
          pointsData={marks}
          pointLat={(d: object) => (d as GlobeMark).point.lat}
          pointLng={(d: object) => (d as GlobeMark).point.lng}
          pointColor={(d: object) => (d as GlobeMark).color}
          pointAltitude={0.012}
          pointRadius={0.45}
          pointResolution={12}
          pointsMerge={false}
          arcsData={arcsData}
          arcColor={(d: object) => (d as { color: string }).color}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcStroke={0.5}
          arcAltitude={0.15}
        />
      )}
    </div>
  );
}
