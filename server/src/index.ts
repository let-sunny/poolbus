import homepage from "../../client/index.html";
import { searchRoutes, getBusPositions, getRouteStops } from "./lib/tago";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": homepage,
  },
  async fetch(req) {
    const url = new URL(req.url);

    // GET /api/routes?routeNo=360
    if (url.pathname === "/api/routes" && req.method === "GET") {
      const routeNo = url.searchParams.get("routeNo");
      if (!routeNo) return error("routeNo parameter is required");
      const data = await searchRoutes(routeNo);
      return json(data);
    }

    // GET /api/routes/:routeId/buses
    const busMatch = url.pathname.match(/^\/api\/routes\/([^/]+)\/buses$/);
    if (busMatch && req.method === "GET") {
      const data = await getBusPositions(busMatch[1]);
      return json(data);
    }

    // GET /api/routes/:routeId/stops
    const stopMatch = url.pathname.match(/^\/api\/routes\/([^/]+)\/stops$/);
    if (stopMatch && req.method === "GET") {
      const data = await getRouteStops(stopMatch[1]);
      return json(data);
    }

    return error("Not found", 404);
  },
});

console.log(`🚌 Poolbus server running at http://localhost:${server.port}`);
