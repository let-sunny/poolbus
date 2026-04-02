import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { BusPosition } from "../types";
import { animateMarker } from "../lib/animateMarker";

interface BusMarkersProps {
  map: mapboxgl.Map | null;
  current: BusPosition[];
  previous: BusPosition[];
}

export function BusMarkers({ map, current, previous }: BusMarkersProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    const prevMap = new Map(previous.map((b) => [b.vehicleno, b]));
    const currentIds = new Set(current.map((b) => b.vehicleno));

    // Remove markers for buses no longer present
    for (const [vehicleno, marker] of markersRef.current) {
      if (!currentIds.has(vehicleno)) {
        marker.remove();
        markersRef.current.delete(vehicleno);
      }
    }

    // Add or update markers
    for (const bus of current) {
      const existing = markersRef.current.get(bus.vehicleno);
      const prevBus = prevMap.get(bus.vehicleno);

      if (existing) {
        // Update popup content
        existing.getPopup()?.setHTML(popupHTML(bus));

        // Animate from previous to current position
        if (prevBus) {
          animateMarker(
            existing,
            [prevBus.gpslong, prevBus.gpslati],
            [bus.gpslong, bus.gpslati]
          );
        } else {
          existing.setLngLat([bus.gpslong, bus.gpslati]);
        }
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.className = "bus-marker";

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML(bus));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([bus.gpslong, bus.gpslati])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.set(bus.vehicleno, marker);
      }
    }
  }, [map, current, previous]);

  // Cleanup all markers on unmount
  useEffect(() => {
    return () => {
      for (const marker of markersRef.current.values()) {
        marker.remove();
      }
      markersRef.current.clear();
    };
  }, []);

  return null;
}

function popupHTML(bus: BusPosition): string {
  return `
    <div class="bus-popup">
      <strong>${bus.vehicleno}</strong>
      <p>${bus.routenm || ""} · ${bus.routetp || ""}</p>
      <p>현재 정류소: ${bus.nodenm || "정보 없음"}</p>
    </div>
  `;
}
