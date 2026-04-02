import { useState, useEffect, useRef } from "react";
import type { BusPosition } from "../types";

const POLL_INTERVAL = 12000;

export function useBusPositions(routeId: string | null) {
  const [current, setCurrent] = useState<BusPosition[]>([]);
  const [previous, setPrevious] = useState<BusPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!routeId) {
      setCurrent([]);
      setPrevious([]);
      return;
    }

    async function fetchPositions() {
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
    }

    fetchPositions();
    intervalRef.current = setInterval(fetchPositions, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeId]);

  return { current, previous, isLoading, error };
}
