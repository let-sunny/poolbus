import { useRef } from "react";
import { useState } from "react";
import type { Marker, Map } from "mapbox-gl";
import { BusMap } from "./components/BusMap";
import { RoutePath } from "./components/RoutePath";
import { PlaybackMarker } from "./components/PlaybackMarker";
import { PlaybackTrail } from "./components/PlaybackTrail";
import { PlayerControls } from "./components/PlayerControls";
import { useRouteStops } from "./hooks/useRouteStops";
import { useRoutePlayback } from "./hooks/useRoutePlayback";

const ROUTE_ID = "GGB204000079";

export function App() {
  const [map, setMap] = useState<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const stops = useRouteStops(ROUTE_ID);
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
