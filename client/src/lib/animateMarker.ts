import mapboxgl from "mapbox-gl";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function animateMarker(
  marker: mapboxgl.Marker,
  from: [number, number],
  to: [number, number],
  durationMs = 2000
) {
  const start = performance.now();

  function frame(now: number) {
    const elapsed = now - start;
    const t = Math.min(elapsed / durationMs, 1);
    const eased = easeInOutCubic(t);

    const lng = from[0] + (to[0] - from[0]) * eased;
    const lat = from[1] + (to[1] - from[1]) * eased;

    marker.setLngLat([lng, lat]);

    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
