import { useState, useRef, useCallback, useEffect } from "react";
import type { RouteStop } from "../types";

export interface PlaybackState {
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  currentStop: RouteStop | null;
  progress: number;
  position: [number, number] | null;
}

const BASE_INTERVAL = 300;

export function useRoutePlayback(stops: RouteStop[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

  const totalStops = stops.length;
  const progress = totalStops > 0 ? currentIndex / (totalStops - 1) : 0;
  const currentStop = stops[currentIndex] ?? null;

  const interpolatePosition = useCallback(
    (index: number, t: number) => {
      if (stops.length === 0) return null;
      const from = stops[Math.min(index, stops.length - 1)];
      const to = stops[Math.min(index + 1, stops.length - 1)];
      if (!from || !to) return null;
      const lng = from.gpslong + (to.gpslong - from.gpslong) * t;
      const lat = from.gpslati + (to.gpslati - from.gpslati) * t;
      return [lng, lat] as [number, number];
    },
    [stops]
  );

  useEffect(() => {
    if (!isPlaying || stops.length === 0) return;

    lastTimeRef.current = performance.now();
    progressRef.current = 0;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      progressRef.current += (delta / BASE_INTERVAL) * speed;

      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= stops.length - 1) {
            setIsPlaying(false);
            return stops.length - 1;
          }
          return next;
        });
      }

      setCurrentIndex((idx) => {
        setPosition(interpolatePosition(idx, progressRef.current));
        return idx;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, stops, speed, interpolatePosition]);

  useEffect(() => {
    if (stops.length > 0 && !position) {
      setPosition([stops[0].gpslong, stops[0].gpslati]);
    }
  }, [stops, position]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    progressRef.current = 0;
    if (stops.length > 0) {
      setPosition([stops[0].gpslong, stops[0].gpslati]);
    }
  }, [stops]);

  const seek = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, stops.length - 1));
      setCurrentIndex(clamped);
      progressRef.current = 0;
      if (stops[clamped]) {
        setPosition([stops[clamped].gpslong, stops[clamped].gpslati]);
      }
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
