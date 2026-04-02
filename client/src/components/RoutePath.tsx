import { useEffect } from "react";
import type { RouteStop } from "../types";
import mapboxgl from "mapbox-gl";

const SOURCE_ID = "route-path";
const LINE_LAYER_ID = "route-path-line";
const STOPS_LAYER_ID = "route-stops-circles";

interface RoutePathProps {
  map: mapboxgl.Map | null;
  stops: RouteStop[];
}

export function RoutePath({ map, stops }: RoutePathProps) {
  useEffect(() => {
    if (!map || stops.length === 0) return;

    const coordinates = stops.map((s) => [s.gpslong, s.gpslati] as [number, number]);

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        },
        ...stops.map((s) => ({
          type: "Feature" as const,
          properties: { name: s.nodenm },
          geometry: { type: "Point" as const, coordinates: [s.gpslong, s.gpslati] },
        })),
      ],
    };

    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

      map.addLayer({
        id: LINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": "#53d8fb",
          "line-width": 3,
          "line-opacity": 0.5,
        },
      });

      map.addLayer({
        id: STOPS_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 3,
          "circle-color": "#53d8fb",
          "circle-opacity": 0.4,
        },
      });
    }

    return () => {
      if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
      if (map.getLayer(STOPS_LAYER_ID)) map.removeLayer(STOPS_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, stops]);

  return null;
}
