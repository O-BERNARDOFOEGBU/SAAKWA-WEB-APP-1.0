import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import OrderTimeline from "@/components/marketplace/OrderTimeline";
import LiveTrackingMap from "@/components/marketplace/LiveTrackingMap";
import { useOrderTracking } from "@/hooks/useOrderTracking";

const OrderTracking = () => {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const { order, history, riderLocation, loading, error } = useOrderTracking(orderId);

  const destination = useMemo(() => {
    if (!order?.delivery_lat || !order?.delivery_lng) {
      return null;
    }

    return {
      lat: order.delivery_lat,
      lng: order.delivery_lng,
    };
  }, [order]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/marketplace/laundries")} className="mb-4">
          Back to Marketplace
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <p className="mb-6 mt-2 text-gray-600">Track status changes and rider location in real time.</p>

        {loading ? <p>Loading tracking data...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {order ? (
          <div className="mb-5 rounded-xl border bg-white p-5 text-sm text-gray-700">
            <p>Order ID: {order.id}</p>
            <p>Status: {order.status}</p>
            <p>Pickup Date: {order.pickup_date}</p>
            <p>Delivery Date: {order.delivery_date}</p>
            <p>Total: NGN {Number(order.total_price).toLocaleString()}</p>
          </div>
        ) : null}

        {order ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <OrderTimeline history={history} currentStatus={order.status} />
            <LiveTrackingMap riderLocation={riderLocation} destination={destination} />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default OrderTracking;
