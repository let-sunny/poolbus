import { useState, useCallback } from "react";
import type { BusRoute } from "../types";

export function useRouteSearch() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (routeNo: string) => {
    if (!routeNo.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/routes?routeNo=${encodeURIComponent(routeNo)}`);
      if (!res.ok) throw new Error("검색 실패");
      const data: BusRoute[] = await res.json();
      setRoutes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { routes, isLoading, error, search };
}
