import { useState, useEffect } from "react";
import type { RouteStop } from "../types";

export function useRouteStops(routeId: string | null) {
  const [stops, setStops] = useState<RouteStop[]>([]);

  useEffect(() => {
    if (!routeId) {
      setStops([]);
      return;
    }

    import(`../data/routes/${routeId}.json`)
      .then((mod) => {
        const data: RouteStop[] = mod.default;
        setStops(data.sort((a, b) => a.nodeord - b.nodeord));
      })
      .catch(() => setStops([]));
  }, [routeId]);

  return stops;
}
