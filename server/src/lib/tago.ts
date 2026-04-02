const BASE_URL = "https://apis.data.go.kr/1613000";
const CITY_CODE = 11; // Seoul

function getServiceKey(): string {
  const key = process.env.TAGO_SERVICE_KEY;
  if (!key) throw new Error("TAGO_SERVICE_KEY is not set");
  return key;
}

function normalizeItems(data: any): any[] {
  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

async function tagoFetch(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("serviceKey", getServiceKey());
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "200");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TAGO API error: ${res.status}`);
  const json = await res.json();
  return normalizeItems(json);
}

export async function searchRoutes(routeNo: string) {
  return tagoFetch("/BusRouteInfoInqireService/getRouteNoList", {
    cityCode: String(CITY_CODE),
    routeNo,
  });
}

export async function getBusPositions(routeId: string) {
  return tagoFetch("/BusLcInfoInqireService/getRouteAcctoBusLcList", {
    cityCode: String(CITY_CODE),
    routeId,
  });
}

export async function getRouteStops(routeId: string) {
  return tagoFetch(
    "/BusRouteInfoInqireService/getRouteAcctoThrghSttnList",
    {
      cityCode: String(CITY_CODE),
      routeId,
    }
  );
}
