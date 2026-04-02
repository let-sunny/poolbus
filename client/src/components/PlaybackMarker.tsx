import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface PlaybackMarkerProps {
  map: mapboxgl.Map | null;
  markerRef: React.RefObject<mapboxgl.Marker | null>;
  initialPosition: [number, number] | null;
}

export function PlaybackMarker({ map, markerRef, initialPosition }: PlaybackMarkerProps) {
  useEffect(() => {
    if (!map || !initialPosition) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "bus-marker playback-marker";

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(initialPosition)
        .addTo(map);

      (markerRef as React.MutableRefObject<mapboxgl.Marker | null>).current = marker;
    }
  }, [map, initialPosition, markerRef]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      (markerRef as React.MutableRefObject<mapboxgl.Marker | null>).current = null;
    };
  }, [markerRef]);

  return null;
}
