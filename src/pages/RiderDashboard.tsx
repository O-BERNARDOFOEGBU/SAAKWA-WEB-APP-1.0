import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchCurrentUserRider,
  fetchRiderOrdersForCurrentUser,
  pushRiderLocation,
  transitionOrderStatus,
} from "@/api/marketplaceApi";
import type { MarketplaceOrder, Rider } from "@/features/marketplace/types";
import { useToast } from "@/hooks/use-toast";

const RiderDashboard = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const watchId = useRef<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [riderData, ordersData] = await Promise.all([
        fetchCurrentUserRider(),
        fetchRiderOrdersForCurrentUser(),
      ]);

      setRider(riderData);
      setOrders(ordersData);
    } catch (err: any) {
      toast({
        title: "Failed to load rider dashboard",
        description: err?.message ?? "Could not load rider information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (watchId.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const handleStatus = async (orderId: string, nextStatus: MarketplaceOrder["status"]) => {
    setUpdatingOrderId(orderId);
    try {
      await transitionOrderStatus(orderId, nextStatus, "rider");
      toast({ title: "Status updated", description: `Order moved to ${nextStatus}.` });
      await load();
    } catch (err: any) {
      toast({
        title: "Status update failed",
        description: err?.message ?? "Transition rejected.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const startLocationSharing = () => {
    if (!rider) {
      toast({
        title: "Rider profile missing",
        description: "Create a rider profile before sharing location.",
        variant: "destructive",
      });
      return;
    }

    const activeOrder = orders.find((order) =>
      ["PICKED_UP", "AT_LAUNDRY", "OUT_FOR_DELIVERY"].includes(order.status)
    );

    if (!activeOrder) {
      toast({
        title: "No active trip",
        description: "Location sharing is available for active pickup/delivery orders.",
        variant: "destructive",
      });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast({
        title: "Location unavailable",
        description: "Geolocation is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await pushRiderLocation({
            orderId: activeOrder.id,
            riderId: rider.id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSharingLocation(true);
        } catch (err: any) {
          toast({
            title: "Location push failed",
            description: err?.message ?? "Could not send location update.",
            variant: "destructive",
          });
        }
      },
      () => {
        toast({
          title: "Location permission denied",
          description: "Allow location access to share live tracking.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  };

  const stopLocationSharing = () => {
    if (watchId.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setSharingLocation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
        <p className="mt-2 text-gray-600">Accept assigned jobs, update movement states, and share live GPS updates.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={load}>
            Refresh Assignments
          </Button>
          {!sharingLocation ? (
            <Button onClick={startLocationSharing}>Start Live GPS Sharing</Button>
          ) : (
            <Button variant="destructive" onClick={stopLocationSharing}>
              Stop Live GPS Sharing
            </Button>
          )}
        </div>

        {loading ? <p className="mt-6">Loading assigned jobs...</p> : null}

        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order {order.id.slice(0, 8)}</span>
                  <span className="text-sm text-gray-500">{order.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>Pickup: {order.pickup_date}</p>
                <p>Delivery: {order.delivery_date}</p>
                <p>Total: NGN {Number(order.total_price).toLocaleString()}</p>

                <div className="flex flex-wrap gap-2">
                  {order.status === "RIDER_ASSIGNED" ? (
                    <Button
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatus(order.id, "PICKED_UP")}
                    >
                      Accept Job / Mark PICKED_UP
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    disabled={updatingOrderId === order.id}
                    onClick={() => handleStatus(order.id, "AT_LAUNDRY")}
                  >
                    Mark AT_LAUNDRY
                  </Button>

                  <Button
                    variant="outline"
                    disabled={updatingOrderId === order.id}
                    onClick={() => handleStatus(order.id, "OUT_FOR_DELIVERY")}
                  >
                    Mark OUT_FOR_DELIVERY
                  </Button>

                  <Button
                    variant="outline"
                    disabled={updatingOrderId === order.id}
                    onClick={() => handleStatus(order.id, "DELIVERED")}
                  >
                    Mark DELIVERED
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && !orders.length ? (
            <p className="text-gray-600">No active rider jobs for this account.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default RiderDashboard;
