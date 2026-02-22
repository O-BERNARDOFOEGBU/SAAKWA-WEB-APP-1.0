import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignNearestRider,
  fetchLaundryOrdersForCurrentUser,
  transitionOrderStatus,
} from "@/api/marketplaceApi";
import type { MarketplaceOrder, OrderStatus } from "@/features/marketplace/types";
import { useToast } from "@/hooks/use-toast";

const LAUNDRY_ACTIONS: Array<{ label: string; status: OrderStatus }> = [
  { label: "RECEIVED", status: "AT_LAUNDRY" },
  { label: "PROCESSING", status: "PROCESSING" },
  { label: "READY", status: "READY" },
];

const LaundryDashboard = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchLaundryOrdersForCurrentUser();
      setOrders(response);
    } catch (err: any) {
      toast({
        title: "Failed to load dashboard",
        description: err?.message ?? "Could not load laundry orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAutoConfirm = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      await assignNearestRider(orderId);
      toast({
        title: "Order confirmed",
        description: "Nearest available rider has been assigned when available.",
      });
      await loadOrders();
    } catch (err: any) {
      toast({
        title: "Failed to confirm order",
        description: err?.message ?? "Rider assignment failed.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await transitionOrderStatus(orderId, nextStatus, "laundry");
      toast({
        title: "Order status updated",
        description: `Order moved to ${nextStatus}.`,
      });
      await loadOrders();
    } catch (err: any) {
      toast({
        title: "Status update failed",
        description: err?.message ?? "Transition was rejected.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Laundry House Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Review incoming orders, confirm rider assignment, and update processing states.
        </p>

        <div className="mt-6">
          <Button variant="outline" onClick={loadOrders}>
            Refresh Orders
          </Button>
        </div>

        {loading ? <p className="mt-6">Loading incoming orders...</p> : null}

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
                  {order.status === "PENDING" ? (
                    <Button
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleAutoConfirm(order.id)}
                    >
                      Accept / Auto-confirm
                    </Button>
                  ) : null}

                  {LAUNDRY_ACTIONS.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusUpdate(order.id, action.status)}
                    >
                      Mark {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && !orders.length ? (
            <p className="text-gray-600">No laundry house orders found for your account.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default LaundryDashboard;
