import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplaceLaundries } from "@/hooks/useMarketplaceLaundries";
import {
  createMarketplaceOrder,
  transitionOrderStatus,
} from "@/api/marketplaceApi";
import { calculatePriceBreakdown } from "@/utils/pricing";

const DELIVERY_FEE = 1500;

const MarketplaceLaundries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [pickupDate, setPickupDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const {
    laundries,
    loading,
    error,
    sortBy,
    setSortBy,
    serviceTypeFilter,
    setServiceTypeFilter,
    availableServiceTypes,
  } = useMarketplaceLaundries();

  const canPlaceOrder = useMemo(
    () => Boolean(user && pickupDate && deliveryDate),
    [user, pickupDate, deliveryDate]
  );

  const handlePlaceOrder = async (laundryHouseId: string, serviceCost: number, commissionRate: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in before placing a marketplace order.",
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate || !deliveryDate) {
      toast({
        title: "Pickup and delivery required",
        description: "Select pickup and delivery dates before creating an order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const breakdown = calculatePriceBreakdown({
        serviceCost,
        commissionRate,
        deliveryFee: DELIVERY_FEE,
      });

      const order = await createMarketplaceOrder({
        userId: user.id,
        laundryHouseId,
        pickupDate,
        deliveryDate,
        serviceCost: breakdown.service_cost,
        commissionAmount: breakdown.commission,
        deliveryFee: breakdown.delivery_fee,
        totalPrice: breakdown.total,
      });

      await transitionOrderStatus(order.id, "RIDER_ASSIGNED", "user");

      toast({
        title: "Order created",
        description: "Your order has been created and rider assignment has started.",
      });

      navigate(`/marketplace/orders/${order.id}/tracking`);
    } catch (err: any) {
      toast({
        title: "Order creation failed",
        description: err?.message ?? "Something went wrong while creating your order.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Laundry Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Compare laundry houses by price, service quality, turnaround time, and proximity in Lekki.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compare and Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="sort-by">Sort by</Label>
              <Select value={sortBy} onValueChange={(value: "price" | "distance" | "rating") => setSortBy(value)}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Select sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service-filter">Service Type</Label>
              <Select value={serviceTypeFilter || "all"} onValueChange={(value) => setServiceTypeFilter(value === "all" ? "" : value)}>
                <SelectTrigger id="service-filter">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {availableServiceTypes.map((serviceType) => (
                    <SelectItem key={serviceType} value={serviceType}>
                      {serviceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pickup-date">Pickup Date</Label>
              <Input
                id="pickup-date"
                type="date"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? <p>Loading laundry houses...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        <div className="grid gap-5 md:grid-cols-2">
          {laundries.map((item) => {
            const primaryServiceCost = item.offerings[0]?.base_price ?? item.averagePrice;
            const breakdown = calculatePriceBreakdown({
              serviceCost: Number(primaryServiceCost || 0),
              commissionRate: Number(item.laundryHouse.commission_rate || 0),
              deliveryFee: DELIVERY_FEE,
            });

            return (
              <Card key={item.laundryHouse.id} className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.laundryHouse.name}</span>
                    <span className="text-sm text-gray-500">{item.distanceKm.toFixed(1)} km</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>{item.laundryHouse.address}</p>
                  <p>Estimated turnaround: {item.laundryHouse.turnaround_time_hours} hours</p>
                  <p>
                    Rating: {item.averageRating.toFixed(1)} / 5 ({item.ratingCount} reviews)
                  </p>
                  <p>Average service price: NGN {item.averagePrice.toLocaleString()}</p>

                  <div>
                    <p className="font-medium">Services:</p>
                    <p className="text-gray-600">
                      {item.offerings.map((offering) => `${offering.service_type} (NGN ${Number(offering.base_price).toLocaleString()})`).join(", ") || "No services configured"}
                    </p>
                  </div>

                  <div className="rounded-md bg-gray-100 p-3 text-xs">
                    <p>Service Cost: NGN {breakdown.service_cost.toLocaleString()}</p>
                    <p>Commission: NGN {breakdown.commission.toLocaleString()}</p>
                    <p>Delivery Fee: NGN {breakdown.delivery_fee.toLocaleString()}</p>
                    <p className="font-semibold text-gray-900">Total: NGN {breakdown.total.toLocaleString()}</p>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!canPlaceOrder}
                    onClick={() =>
                      handlePlaceOrder(
                        item.laundryHouse.id,
                        Number(primaryServiceCost || 0),
                        Number(item.laundryHouse.commission_rate || 0)
                      )
                    }
                  >
                    {canPlaceOrder ? "Select Laundry House" : "Sign in and choose dates to order"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MarketplaceLaundries;
