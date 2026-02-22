import type { RiderLocation } from "@/features/marketplace/types";

interface LiveTrackingMapProps {
  riderLocation: RiderLocation | null;
  destination?: { lat: number; lng: number } | null;
}

export default function LiveTrackingMap({
  riderLocation,
  destination,
}: LiveTrackingMapProps) {
  if (!riderLocation) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Live Rider Map</h2>
        <p className="text-sm text-gray-600">
          Waiting for rider GPS updates. Tracking starts once the rider shares
          location.
        </p>
      </div>
    );
  }

  const latitude = riderLocation.lat;
  const longitude = riderLocation.lng;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Live Rider Map</h2>
      <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
        <p>Rider Latitude: {latitude.toFixed(6)}</p>
        <p>Rider Longitude: {longitude.toFixed(6)}</p>
        {destination ? <p>Destination Lat: {destination.lat.toFixed(6)}</p> : null}
        {destination ? <p>Destination Lng: {destination.lng.toFixed(6)}</p> : null}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <iframe
          title="Live rider location"
          src={mapUrl}
          className="h-72 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
