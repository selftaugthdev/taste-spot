"use client";

import { useEffect, useRef, useState } from "react";
import GlobeGL from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import type { GlobeMark, MapSurfaceProps } from "./types";

export interface GlobeSurfaceProps extends MapSurfaceProps {
  /** Self-hosted texture path (e.g. /globe/earth-day.jpg) — the caller picks day/night per theme. */
  globeImageUrl: string;
  backgroundColor?: string;
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
}: GlobeSurfaceProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { ref: containerRef, size } = useContainerSize<HTMLDivElement>();
  const hasFramedInitialView = useRef(false);

  useEffect(() => {
    if (!globeRef.current || !focus) return;
    globeRef.current.pointOfView(
      { lat: focus.center.lat, lng: focus.center.lng, altitude: focus.altitude },
      1000,
    );
  }, [focus]);

  // Frame a pleasant default view once the globe first mounts with real size.
  useEffect(() => {
    if (hasFramedInitialView.current || !globeRef.current || size.width === 0) return;
    hasFramedInitialView.current = true;
    globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
  }, [size.width]);

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
