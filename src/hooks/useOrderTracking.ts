import { useEffect, useState } from "react";
import {
  fetchLatestRiderLocation,
  fetchOrderById,
  fetchOrderStatusHistory,
  subscribeToOrderStatus,
  subscribeToRiderLocations,
} from "@/api/marketplaceApi";
import { supabase } from "@/integrations/supabase/client";
import type {
  MarketplaceOrder,
  OrderStatusHistory,
  RiderLocation,
} from "@/features/marketplace/types";

export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [orderResult, historyResult, locationResult] = await Promise.all([
          fetchOrderById(orderId),
          fetchOrderStatusHistory(orderId),
          fetchLatestRiderLocation(orderId),
        ]);

        if (!mounted) return;

        setOrder(orderResult);
        setHistory(historyResult);
        setRiderLocation(locationResult);
      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? "Failed to load order tracking");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    const orderChannel = subscribeToOrderStatus(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setHistory((existing) => {
        const isDuplicate = existing.some(
          (entry) => entry.status === updatedOrder.status
        );
        if (isDuplicate) {
          return existing;
        }

        return [
          ...existing,
          {
            id: `${updatedOrder.id}-${updatedOrder.status}-${updatedOrder.updated_at}`,
            order_id: updatedOrder.id,
            status: updatedOrder.status,
            actor_role: "system",
            actor_id: null,
            metadata: {},
            created_at: updatedOrder.updated_at,
          },
        ];
      });
    });

    const locationChannel = subscribeToRiderLocations(orderId, (location) => {
      setRiderLocation(location);
    });

    return () => {
      mounted = false;
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(locationChannel);
    };
  }, [orderId]);

  return {
    order,
    history,
    riderLocation,
    loading,
    error,
  };
}
