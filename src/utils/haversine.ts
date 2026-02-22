const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function haversineDistanceKm(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): number {
  const dLat = toRadians(endLat - startLat);
  const dLng = toRadians(endLng - startLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}
