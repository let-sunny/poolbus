import { useState, useEffect } from "react";
import type { RouteStop } from "../types";

export function useRouteStops(routeId: string | null) {
  const [stops, setStops] = useState<RouteStop[]>([]);

  useEffect(() => {
    if (!routeId) {
      setStops([]);
      return;
    }

    fetch(`/api/routes/${routeId}/stops`)
      .then((res) => res.json())
      .then((data: RouteStop[]) => {
        const sorted = data.sort((a, b) => a.nodeord - b.nodeord);
        setStops(sorted);
      })
      .catch(() => setStops([]));
  }, [routeId]);

  return stops;
}
