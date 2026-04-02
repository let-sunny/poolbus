import { useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { BusMap } from "./components/BusMap";
import { RouteSearchPanel } from "./components/RouteSearchPanel";
import { BusMarkers } from "./components/BusMarkers";
import { useBusPositions } from "./hooks/useBusPositions";
import type { BusRoute } from "./types";

export function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const { current, previous } = useBusPositions(selectedRoute?.routeid ?? null);

  return (
    <div className="app">
      <RouteSearchPanel
        onSelectRoute={setSelectedRoute}
        selectedRouteId={selectedRoute?.routeid ?? null}
      />
      <div className="map-container">
        <BusMap mapRef={mapRef} />
        <BusMarkers map={mapRef.current} current={current} previous={previous} />
      </div>
    </div>
  );
}
