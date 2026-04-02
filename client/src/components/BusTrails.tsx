import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { BusPosition } from "../types";

const SOURCE_ID = "bus-trails";
const LAYER_ID = "bus-trails-line";

interface BusTrailsProps {
  map: mapboxgl.Map | null;
  current: BusPosition[];
}

export function BusTrails({ map, current }: BusTrailsProps) {
  const trailsRef = useRef<Map<string, [number, number][]>>(new Map());

  useEffect(() => {
    if (!map || current.length === 0) return;

    for (const bus of current) {
      const trail = trailsRef.current.get(bus.vehicleno) ?? [];
      const lastPos = trail[trail.length - 1];
      const newPos: [number, number] = [bus.gpslong, bus.gpslati];

      if (!lastPos || lastPos[0] !== newPos[0] || lastPos[1] !== newPos[1]) {
        trail.push(newPos);
        trailsRef.current.set(bus.vehicleno, trail);
      }
    }

    const features: GeoJSON.Feature[] = [];
    for (const [, trail] of trailsRef.current) {
      if (trail.length < 2) continue;
      features.push({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: trail },
      });
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#e94560",
          "line-width": 2,
          "line-opacity": 0.7,
        },
      });
    }
  }, [map, current]);

  useEffect(() => {
    return () => {
      trailsRef.current.clear();
    };
  }, []);

  return null;
}

export function clearTrails(map: mapboxgl.Map | null, trailsRef?: React.MutableRefObject<Map<string, [number, number][]>>) {
  if (trailsRef) trailsRef.current.clear();
  if (!map) return;
  const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
  if (source) {
    source.setData({ type: "FeatureCollection", features: [] });
  }
}
