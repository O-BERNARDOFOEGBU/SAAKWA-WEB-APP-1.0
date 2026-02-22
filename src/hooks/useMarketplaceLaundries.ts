import { useEffect, useMemo, useState } from "react";
import { listLaundryComparisonItems } from "@/api/marketplaceApi";
import type { LaundryComparisonItem } from "@/features/marketplace/types";

type SortBy = "price" | "distance" | "rating";

const LEKKI_COORDINATES = {
  lat: 6.4698,
  lng: 3.5852,
};

export function useMarketplaceLaundries() {
  const [laundries, setLaundries] = useState<LaundryComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("distance");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let coords = LEKKI_COORDINATES;

        if (typeof navigator !== "undefined" && navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 4000,
              maximumAge: 60000,
            });
          }).catch(() => null);

          if (position) {
            coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          }
        }

        const response = await listLaundryComparisonItems({
          userLat: coords.lat,
          userLng: coords.lng,
          serviceType: serviceTypeFilter,
        });

        if (isMounted) {
          setLaundries(response);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message ?? "Failed to load laundry houses");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [serviceTypeFilter]);

  const sortedLaundries = useMemo(() => {
    const clone = [...laundries];

    if (sortBy === "price") {
      clone.sort((a, b) => a.averagePrice - b.averagePrice);
    }

    if (sortBy === "distance") {
      clone.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (sortBy === "rating") {
      clone.sort((a, b) => b.averageRating - a.averageRating);
    }

    return clone;
  }, [laundries, sortBy]);

  const availableServiceTypes = useMemo(() => {
    const unique = new Set<string>();
    laundries.forEach((laundry) => {
      laundry.offerings.forEach((offering) => unique.add(offering.service_type));
    });
    return Array.from(unique).sort();
  }, [laundries]);

  return {
    laundries: sortedLaundries,
    loading,
    error,
    sortBy,
    setSortBy,
    serviceTypeFilter,
    setServiceTypeFilter,
    availableServiceTypes,
  };
}
