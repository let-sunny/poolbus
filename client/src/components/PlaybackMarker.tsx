import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface PlaybackMarkerProps {
  map: mapboxgl.Map | null;
  markerRef: React.RefObject<mapboxgl.Marker | null>;
  initialPosition: [number, number] | null;
}

export function PlaybackMarker({ map, markerRef, initialPosition }: PlaybackMarkerProps) {
  // Create marker once when map is ready, cleanup when map changes
  useEffect(() => {
    if (!map || !initialPosition) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "bus-marker playback-marker";

      (markerRef as React.MutableRefObject<mapboxgl.Marker | null>).current =
        new mapboxgl.Marker({ element: el })
          .setLngLat(initialPosition)
          .addTo(map);
    }
  }, [map, initialPosition, markerRef]);

  // Cleanup tied to map lifecycle only
  useEffect(() => {
    if (!map) return;
    return () => {
      markerRef.current?.remove();
      (markerRef as React.MutableRefObject<mapboxgl.Marker | null>).current = null;
    };
  }, [map, markerRef]);

  return null;
}
