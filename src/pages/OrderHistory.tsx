import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/ui/full-spinner";
import StateBadge from "@/components/ui/state-badge";
import { useAuth } from "@/hooks/useAuth";
import { BookingsType, usePaginatedBookings } from "@/hooks/useBookings";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { bookings, pageCount, loading } = usePaginatedBookings(
    user?.id, // current user
    page,
    10 // items per page
  );
  console.log(bookings);

  const formatCurrencyToNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "symbol",
    }).format(amount);
  };

  if (loading) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">
            Manage and Reorder services with the same clothing items
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {bookings.map((booking: BookingsType) => (
            <div className="bg-white rounded-xl p-6 w-full flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-900 font-semibold text-2xl">
                    Order #{booking.id.substring(0, 8)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {format(booking.created_at, "MMM dd, yyyy")}
                  </p>
                </div>

                <StateBadge status="pending">
                  {booking.payment_status.toUpperCase()}
                </StateBadge>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-900 font-semibold">Items</p>
                  <p className="text-gray-600">
                    {booking.selected_clothes
                      .map((cloth) => `${cloth.quantity}, ${cloth.name}`)
                      .join(", ")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-gray-900 font-semibold">Service Details</p>
                  <div>
                    <p className="text-gray-600">
                      Pickup: {format(booking.pickup_date, "MMM dd, yyyy")}
                    </p>
                    <p className="text-gray-600">
                      Delivery: {format(booking.delivery_date, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-gray-900 font-semibold">
                  {formatCurrencyToNaira(booking.total_amount)}
                </p>

                <Button
                  className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 border hover:border-blue-600"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(
                        "selectedClothes",
                        JSON.stringify(booking.selected_clothes)
                      );
                    }

                    navigate("/checkout");
                  }}
                >
                  Reorder
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 items-center">
          <Button
            className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 border hover:border-blue-600"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <span>
            {page} / {pageCount}
          </span>

          <Button
            className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 border hover:border-blue-600"
            disabled={page === pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
