import { useState, useRef, useCallback, useEffect } from "react";
import type { RouteStop } from "../types";

const BASE_SPEED = 0.3; // stops per second at 1x
const UI_UPDATE_INTERVAL = 100; // ms between React state updates

export function useRoutePlayback(
  stops: RouteStop[],
  markerRef: React.RefObject<mapboxgl.Marker | null>
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastUIUpdateRef = useRef(0);
  const cursorRef = useRef(0);

  const totalStops = stops.length;
  const maxCursor = Math.max(totalStops - 1, 0);
  const currentStop = stops[currentIndex] ?? null;
  const progress = maxCursor > 0 ? currentIndex / maxCursor : 0;

  const getPosition = useCallback(
    (c: number): [number, number] | null => {
      if (stops.length === 0) return null;
      const clamped = Math.max(0, Math.min(c, stops.length - 1));
      const i = Math.floor(clamped);
      const t = clamped - i;
      const from = stops[i];
      const to = stops[Math.min(i + 1, stops.length - 1)];
      if (!from || !to) return null;
      return [
        from.gpslong + (to.gpslong - from.gpslong) * t,
        from.gpslati + (to.gpslati - from.gpslati) * t,
      ];
    },
    [stops]
  );

  const position = getPosition(currentIndex);

  useEffect(() => {
    if (!isPlaying || stops.length === 0) return;

    lastTimeRef.current = performance.now();
    lastUIUpdateRef.current = 0;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      cursorRef.current += (delta / 1000) * BASE_SPEED * speed;

      if (cursorRef.current >= stops.length - 1) {
        cursorRef.current = stops.length - 1;
        // Update marker directly
        const pos = getPosition(cursorRef.current);
        if (pos && markerRef.current) markerRef.current.setLngLat(pos);
        setCurrentIndex(stops.length - 1);
        setIsPlaying(false);
        return;
      }

      // Update marker position directly every frame (no React overhead)
      const pos = getPosition(cursorRef.current);
      if (pos && markerRef.current) {
        markerRef.current.setLngLat(pos);
      }

      // Throttle React state updates for UI (stop name, progress bar)
      if (now - lastUIUpdateRef.current > UI_UPDATE_INTERVAL) {
        lastUIUpdateRef.current = now;
        setCurrentIndex(Math.floor(cursorRef.current));
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, stops, speed, getPosition, markerRef]);

  // Reset on route change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    cursorRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [stops]);

  const play = useCallback(() => {
    if (cursorRef.current >= stops.length - 1) {
      setCurrentIndex(0);
      cursorRef.current = 0;
    }
    setIsPlaying(true);
  }, [stops]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    cursorRef.current = 0;
    const pos = getPosition(0);
    if (pos && markerRef.current) markerRef.current.setLngLat(pos);
  }, [getPosition, markerRef]);

  const seek = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, stops.length - 1));
      setCurrentIndex(clamped);
      cursorRef.current = clamped;
      const pos = getPosition(clamped);
      if (pos && markerRef.current) markerRef.current.setLngLat(pos);
    },
    [stops, getPosition, markerRef]
  );

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => {
      if (s === 1) return 2;
      if (s === 2) return 4;
      if (s === 4) return 8;
      return 1;
    });
  }, []);

  return {
    currentIndex,
    isPlaying,
    speed,
    currentStop,
    progress,
    position,
    play,
    pause,
    reset,
    seek,
    cycleSpeed,
    totalStops,
  };
}
