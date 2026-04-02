import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { RouteStop } from "../types";

interface PlaybackMarkerProps {
  map: mapboxgl.Map | null;
  position: [number, number] | null;
  currentStop: RouteStop | null;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function PlaybackMarker({ map, position, currentStop }: PlaybackMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !position) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "bus-marker playback-marker";

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false });

      markerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat(position)
        .setPopup(popup)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(position);
    }

    if (currentStop && markerRef.current.getPopup()) {
      const name = escapeHTML(currentStop.nodenm || "");
      const ord = currentStop.nodeord;
      markerRef.current.getPopup()!.setHTML(
        `<div class="bus-popup"><strong>${name}</strong><p>#${ord} 정류소</p></div>`
      );
    }
  }, [map, position, currentStop]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, []);

  return null;
}
