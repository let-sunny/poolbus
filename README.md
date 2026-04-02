# Poolbus

Real-time Seoul bus tracking system built with Mapbox GL JS.

Inspired by [NYC Taxis: A Day in the Life](http://chriswhong.github.io/nyctaxi/) — reimagined with modern web technologies and Korean public transit data.

## Tech Stack

- **Frontend**: React + TypeScript + Mapbox GL JS
- **Backend**: Bun (HTTP server as TAGO API proxy)
- **Data**: [TAGO](https://www.data.go.kr/) public bus location API

## Features

- Search Seoul bus routes by number
- Real-time bus position tracking (12s polling)
- Smooth marker animation between position updates
- Bus detail popup on click

## Getting Started

```bash
# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your TAGO_SERVICE_KEY and PUBLIC_MAPBOX_TOKEN

# Run dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `TAGO_SERVICE_KEY` | TAGO API service key | [data.go.kr](https://www.data.go.kr/) |
| `PUBLIC_MAPBOX_TOKEN` | Mapbox public access token | [mapbox.com](https://www.mapbox.com/) |

## Project Structure

```
poolbus/
├── client/          # React frontend
│   ├── index.html
│   └── src/
│       ├── components/  # BusMap, BusMarkers, RouteSearchPanel
│       ├── hooks/       # useBusPositions, useRouteSearch
│       └── lib/         # animateMarker
└── server/          # Bun API proxy
    └── src/
        ├── index.ts     # Bun.serve() entry
        └── lib/
            └── tago.ts  # TAGO API client
```

## License

MIT
