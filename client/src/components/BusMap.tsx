import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface BusMapProps {
  onMapReady: (map: mapboxgl.Map) => void;
}

export function BusMap({ onMapReady }: BusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [127.1115, 37.3947],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => onMapReady(map));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
