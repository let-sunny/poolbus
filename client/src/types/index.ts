export interface BusRoute {
  routeid: string;
  routeno: string;
  routetp: string;
  startnodenm: string;
  endnodenm: string;
}

export interface BusPosition {
  gpslati: number;
  gpslong: number;
  vehicleno: string;
  nodenm: string;
  nodeid: string;
  nodeord: number;
  routenm: string;
  routetp: string;
}

export interface RouteStop {
  nodeid: string;
  nodenm: string;
  gpslati: number;
  gpslong: number;
  nodeord: number;
}
