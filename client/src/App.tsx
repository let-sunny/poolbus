import { useState } from "react";
import mapboxgl from "mapbox-gl";
import { BusMap } from "./components/BusMap";
import { RouteSearchPanel } from "./components/RouteSearchPanel";
import { BusMarkers } from "./components/BusMarkers";
import { BusTrails } from "./components/BusTrails";
import { RoutePath } from "./components/RoutePath";
import { PlayerControls } from "./components/PlayerControls";
import { useBusPositions } from "./hooks/useBusPositions";
import { useRouteStops } from "./hooks/useRouteStops";
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

  const routeId = selectedRoute?.routeid ?? null;
  const { current, previous, isPlaying, play, pause, reset } = useBusPositions(routeId);
  const stops = useRouteStops(routeId);

  const handleReset = () => {
    reset();
    if (map) {
      const source = map.getSource("bus-trails") as mapboxgl.GeoJSONSource | undefined;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
    }
  };

  return (
    <div className="app">
      <RouteSearchPanel
        onSelectRoute={setSelectedRoute}
        selectedRouteId={routeId}
      />
      <div className="map-container">
        <BusMap onMapReady={setMap} />
        <RoutePath map={map} stops={stops} />
        <BusTrails map={map} current={current} />
        <BusMarkers map={map} current={current} previous={previous} />
        <PlayerControls
          isPlaying={isPlaying}
          busCount={current.length}
          onPlay={play}
          onPause={pause}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
