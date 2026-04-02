import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { RouteStop } from "../types";

const SOURCE_ID = "playback-trail";
const LAYER_ID = "playback-trail-line";

interface PlaybackTrailProps {
  map: mapboxgl.Map | null;
  stops: RouteStop[];
  currentIndex: number;
}

export function PlaybackTrail({ map, stops, currentIndex }: PlaybackTrailProps) {
  useEffect(() => {
    if (!map || stops.length === 0) return;

    const visited = stops.slice(0, currentIndex + 1);
    const coordinates = visited.map((s) => [s.gpslong, s.gpslati] as [number, number]);

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features:
        coordinates.length >= 2
          ? [
              {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates },
              },
            ]
          : [],
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
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    }
  }, [map, stops, currentIndex]);

  useEffect(() => {
    const currentMap = map;
    return () => {
      if (!currentMap) return;
      if (currentMap.getLayer(LAYER_ID)) currentMap.removeLayer(LAYER_ID);
      if (currentMap.getSource(SOURCE_ID)) currentMap.removeSource(SOURCE_ID);
    };
  }, [map]);

  return null;
}
