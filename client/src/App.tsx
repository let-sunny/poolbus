import { useState, useRef } from "react";
import type { Marker } from "mapbox-gl";
import { BusMap } from "./components/BusMap";
import { RouteSearchPanel } from "./components/RouteSearchPanel";
import { RoutePath } from "./components/RoutePath";
import { PlaybackMarker } from "./components/PlaybackMarker";
import { PlaybackTrail } from "./components/PlaybackTrail";
import { PlayerControls } from "./components/PlayerControls";
import { useRouteStops } from "./hooks/useRouteStops";
import { useRoutePlayback } from "./hooks/useRoutePlayback";
import type { BusRoute } from "./types";

export function App() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>({
    routeid: "GGB204000079",
    routeno: "380",
    routetp: "일반버스",
    startnodenm: "동분당더퍼스트정문",
    endnodenm: "판교대장초·중학교",
  });

  const routeId = selectedRoute?.routeid ?? null;
  const stops = useRouteStops(routeId);
  const {
    currentIndex,
    isPlaying,
    speed,
    currentStop,
    position,
    play,
    pause,
    reset,
    seek,
    cycleSpeed,
    totalStops,
  } = useRoutePlayback(stops, markerRef);

  return (
    <div className="app">
      <RouteSearchPanel
        onSelectRoute={setSelectedRoute}
        selectedRouteId={routeId}
      />
      <div className="map-container">
        <BusMap onMapReady={setMap} />
        <RoutePath map={map} stops={stops} />
        <PlaybackTrail map={map} stops={stops} currentIndex={currentIndex} />
        <PlaybackMarker map={map} markerRef={markerRef} initialPosition={position} />
        <PlayerControls
          isPlaying={isPlaying}
          speed={speed}
          currentIndex={currentIndex}
          totalStops={totalStops}
          currentStop={currentStop}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onSeek={seek}
          onCycleSpeed={cycleSpeed}
        />
      </div>
    </div>
  );
}
