import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface BusMapProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

export function BusMap({ mapRef }: BusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [126.978, 37.5665],
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapRef]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
