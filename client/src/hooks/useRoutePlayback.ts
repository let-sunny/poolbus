import { useState, useRef, useCallback, useEffect } from "react";
import type { Marker } from "mapbox-gl";
import type { RouteStop } from "../types";

const BASE_SPEED = 0.3; // stops per second at 1x
const UI_UPDATE_INTERVAL = 100; // ms between React state updates

function cancelAnim(ref: React.RefObject<number | null>) {
  if (ref.current != null) {
    cancelAnimationFrame(ref.current);
    (ref as { current: number | null }).current = null;
  }
}

export function useRoutePlayback(
  stops: RouteStop[],
  markerRef: React.RefObject<Marker | null>
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastUIUpdateRef = useRef(0);
  const cursorRef = useRef(0);

  const totalStops = stops.length;
  const maxCursor = Math.max(totalStops - 1, 0);
  const currentStop = stops[currentIndex] ?? null;
  const progress = totalStops > 1 ? currentIndex / (totalStops - 1) : 0;

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
    if (!isPlaying || stops.length <= 1) return;

    lastTimeRef.current = performance.now();
    lastUIUpdateRef.current = 0;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      cursorRef.current += (delta / 1000) * BASE_SPEED * speedRef.current;

      if (cursorRef.current >= stops.length - 1) {
        cursorRef.current = stops.length - 1;
        const pos = getPosition(cursorRef.current);
        if (pos && markerRef.current) markerRef.current.setLngLat(pos);
        setCurrentIndex(stops.length - 1);
        setIsPlaying(false);
        return;
      }

      const pos = getPosition(cursorRef.current);
      if (pos && markerRef.current) {
        markerRef.current.setLngLat(pos);
      }

      if (now - lastUIUpdateRef.current > UI_UPDATE_INTERVAL) {
        lastUIUpdateRef.current = now;
        setCurrentIndex(Math.floor(cursorRef.current));
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnim(animFrameRef);
  }, [isPlaying, stops, getPosition, markerRef]);

  // Reset on route change — also move marker to new start
  useEffect(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    cursorRef.current = 0;
    cancelAnim(animFrameRef);
    if (stops.length > 0 && markerRef.current) {
      markerRef.current.setLngLat([stops[0].gpslong, stops[0].gpslati]);
    }
  }, [stops, markerRef]);

  const play = useCallback(() => {
    if (stops.length <= 1) return;
    if (cursorRef.current >= stops.length - 1) {
      setCurrentIndex(0);
      cursorRef.current = 0;
    }
    setIsPlaying(true);
  }, [stops]);

  const pause = useCallback(() => {
    cancelAnim(animFrameRef);
    setCurrentIndex(Math.floor(cursorRef.current));
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    cancelAnim(animFrameRef);
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
      const next = s === 1 ? 2 : s === 2 ? 4 : s === 4 ? 8 : 1;
      speedRef.current = next;
      return next;
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
