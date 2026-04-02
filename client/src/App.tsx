import { useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { BusMap } from "./components/BusMap";
import { RouteSearchPanel } from "./components/RouteSearchPanel";
import { BusMarkers } from "./components/BusMarkers";
import { useBusPositions } from "./hooks/useBusPositions";
import type { BusRoute } from "./types";

export function App() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>({
    routeid: "GGB204000079",
    routeno: "380",
    routetp: "일반버스",
    startnodenm: "동분당더퍼스트정문",
    endnodenm: "판교대장초·중학교",
  });
  const { current, previous } = useBusPositions(selectedRoute?.routeid ?? null);

  return (
    <div className="app">
      <RouteSearchPanel
        onSelectRoute={setSelectedRoute}
        selectedRouteId={selectedRoute?.routeid ?? null}
      />
      <div className="map-container">
        <BusMap onMapReady={setMap} />
        <BusMarkers map={map} current={current} previous={previous} />
      </div>
    </div>
  );
}
