import { useState, useRef, useCallback, useEffect } from "react";
import type { RouteStop } from "../types";

const BASE_SPEED = 0.3; // stops per second at 1x

export function useRoutePlayback(stops: RouteStop[]) {
  const [cursor, setCursor] = useState(0); // continuous float: 0 ~ stops.length-1
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const cursorRef = useRef(0);

  const totalStops = stops.length;
  const maxCursor = Math.max(totalStops - 1, 0);
  const currentIndex = Math.min(Math.floor(cursor), maxCursor);
  const currentStop = stops[currentIndex] ?? null;
  const progress = maxCursor > 0 ? cursor / maxCursor : 0;

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

  const position = getPosition(cursor);

  useEffect(() => {
    if (!isPlaying || stops.length === 0) return;

    lastTimeRef.current = performance.now();
    cursorRef.current = cursor;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      cursorRef.current += (delta / 1000) * BASE_SPEED * speed;

      if (cursorRef.current >= stops.length - 1) {
        cursorRef.current = stops.length - 1;
        setCursor(cursorRef.current);
        setIsPlaying(false);
        return;
      }

      setCursor(cursorRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, stops, speed]);

  // Reset on route change
  useEffect(() => {
    setIsPlaying(false);
    setCursor(0);
    cursorRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [stops]);

  const play = useCallback(() => {
    if (cursorRef.current >= stops.length - 1) {
      setCursor(0);
      cursorRef.current = 0;
    }
    setIsPlaying(true);
  }, [stops]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCursor(0);
    cursorRef.current = 0;
  }, []);

  const seek = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, stops.length - 1));
      setCursor(clamped);
      cursorRef.current = clamped;
    },
    [stops]
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
