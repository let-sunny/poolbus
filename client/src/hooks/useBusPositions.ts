import { useState, useEffect, useRef, useCallback } from "react";
import type { BusPosition } from "../types";

const POLL_INTERVAL = 12000;

export function useBusPositions(routeId: string | null) {
  const [current, setCurrent] = useState<BusPosition[]>([]);
  const [previous, setPrevious] = useState<BusPosition[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!routeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/routes/${routeId}/buses`);
      if (!res.ok) throw new Error("버스 위치 조회 실패");
      const data: BusPosition[] = await res.json();
      setCurrent((prev) => {
        setPrevious(prev);
        return data;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  }, [routeId]);

  const clearInterval_ = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = useCallback(() => {
    clearInterval_();
    fetchPositions();
    intervalRef.current = setInterval(fetchPositions, POLL_INTERVAL);
  }, [fetchPositions]);

  useEffect(() => {
    if (!routeId) {
      setCurrent([]);
      setPrevious([]);
      clearInterval_();
      return;
    }

    if (isPlaying) {
      startPolling();
    }

    return clearInterval_;
  }, [routeId, isPlaying, startPolling]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => {
    setIsPlaying(false);
    clearInterval_();
  }, []);
  const reset = useCallback(() => {
    setCurrent([]);
    setPrevious([]);
    clearInterval_();
    if (isPlaying) startPolling();
  }, [isPlaying, startPolling]);

  return { current, previous, isPlaying, isLoading, error, play, pause, reset };
}
