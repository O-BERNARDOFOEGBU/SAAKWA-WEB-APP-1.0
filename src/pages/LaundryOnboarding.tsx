import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { submitLaundryOnboarding } from "@/api/marketplaceApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  clothingCategories,
  type ClothingItem,
} from "@/utils/clothing-items";

type CatalogEntry = ClothingItem & { category: string };

const CATEGORY_ENTRIES = Object.entries(clothingCategories) as [
  string,
  ClothingItem[]
][];

const CATALOG_ITEMS: CatalogEntry[] = CATEGORY_ENTRIES.flatMap(
  ([category, items]) => items.map((item) => ({ ...item, category }))
);

const buildInitialEnabledState = () =>
  Object.fromEntries(CATALOG_ITEMS.map((item) => [item.id, true])) as Record<
    string,
    boolean
  >;

const buildInitialPriceState = () =>
  Object.fromEntries(
    CATALOG_ITEMS.map((item) => [item.id, String(item.price)])
  ) as Record<string, string>;

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const LaundryOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");
  const [commissionRate, setCommissionRate] = useState("12.5");
  const [turnaroundTimeHours, setTurnaroundTimeHours] = useState("48");
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);
  const [enabledByItemId, setEnabledByItemId] = useState<Record<string, boolean>>(
    buildInitialEnabledState
  );
  const [customPriceByItemId, setCustomPriceByItemId] = useState<Record<string, string>>(
    buildInitialPriceState
  );
  const [submitting, setSubmitting] = useState(false);

  const setItemEnabled = (itemId: string, enabled: boolean) => {
    setEnabledByItemId((existing) => ({ ...existing, [itemId]: enabled }));
  };

  const setItemPrice = (itemId: string, price: string) => {
    setCustomPriceByItemId((existing) => ({ ...existing, [itemId]: price }));
  };

  const setCategoryEnabled = (categoryItems: ClothingItem[], enabled: boolean) => {
    setEnabledByItemId((existing) => {
      const next = { ...existing };
      categoryItems.forEach((item) => {
        next[item.id] = enabled;
      });
      return next;
    });
  };

  const selectedItemCount = CATALOG_ITEMS.filter(
    (item) => enabledByItemId[item.id]
  ).length;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to submit a laundry house onboarding request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const selectedCatalogItems = CATALOG_ITEMS.filter(
      (item) => enabledByItemId[item.id]
    );

    const parsedServices = selectedCatalogItems
      .map((item) => ({
        serviceId: item.id,
        serviceType: item.name,
        category: item.category,
        image: item.image,
        suggestedPrice: item.price,
        basePrice: Number(customPriceByItemId[item.id]),
      }))
      .filter((service) => Number.isFinite(service.basePrice) && service.basePrice > 0);

    if (!name || !address || !geoLat || !geoLng) {
      toast({
        title: "Incomplete listing",
        description: "Fill all business details before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCatalogItems.length) {
      toast({
        title: "No clothing items selected",
        description: "Select at least one catalog item for your listing.",
        variant: "destructive",
      });
      return;
    }

    if (parsedServices.length !== selectedCatalogItems.length) {
      toast({
        title: "Invalid custom prices",
        description:
          "Each selected item must have a valid custom price greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitLaundryOnboarding({
        ownerId: user.id,
        name,
        address,
        geoLat: Number(geoLat),
        geoLng: Number(geoLng),
        commissionRate: Number(commissionRate),
        turnaroundTimeHours: Number(turnaroundTimeHours),
        autoConfirmOrders,
        services: parsedServices,
      });

      toast({
        title: "Application submitted",
        description:
          "Your laundry house listing is pending admin approval and will appear after approval.",
      });

      navigate("/marketplace/laundries");
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.message ?? "Could not submit onboarding application.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Laundry House Onboarding</h1>
        <p className="mt-2 text-gray-600">
          Add your business details and set your own prices against Saakwa suggested prices.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="laundry-name">Business Name</Label>
                <Input
                  id="laundry-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="laundry-address">Address</Label>
                <Input
                  id="laundry-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="geo-lat">Latitude</Label>
                <Input
                  id="geo-lat"
                  type="number"
                  value={geoLat}
                  onChange={(event) => setGeoLat(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="geo-lng">Longitude</Label>
                <Input
                  id="geo-lng"
                  type="number"
                  value={geoLng}
                  onChange={(event) => setGeoLng(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  value={commissionRate}
                  onChange={(event) => setCommissionRate(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="turnaround-hours">Turnaround Time (hours)</Label>
                <Input
                  id="turnaround-hours"
                  type="number"
                  value={turnaroundTimeHours}
                  onChange={(event) => setTurnaroundTimeHours(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={autoConfirmOrders} onCheckedChange={setAutoConfirmOrders} />
              <span className="text-sm text-gray-700">Auto confirm new orders</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Clothing Catalog Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Selected items: <span className="font-semibold">{selectedItemCount}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCustomPriceByItemId(buildInitialPriceState())}
                >
                  Reset to Suggested Prices
                </Button>
                <Button variant="outline" onClick={() => setEnabledByItemId(buildInitialEnabledState())}>
                  Select All Items
                </Button>
              </div>
            </div>

            {CATEGORY_ENTRIES.map(([category, items]) => (
              <div key={category} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCategoryEnabled(items, true)}
                    >
                      Select category
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCategoryEnabled(items, false)}
                    >
                      Unselect category
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const isEnabled = enabledByItemId[item.id] ?? false;

                    return (
                      <div
                        key={item.id}
                        className="grid items-center gap-3 rounded-md border border-slate-100 p-3 md:grid-cols-[auto_2fr_1fr_200px]"
                      >
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            setItemEnabled(item.id, checked === true)
                          }
                        />

                        <div>
                          <p className="font-medium text-slate-900">
                            <span className="mr-2">{item.image}</span>
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">ID: {item.id}</p>
                        </div>

                        <div className="text-sm text-slate-600">
                          Suggested: <span className="font-semibold">{formatNaira(item.price)}</span>
                        </div>

                        <div>
                          <Label className="text-xs">Your Price (NGN)</Label>
                          <Input
                            type="number"
                            value={customPriceByItemId[item.id] ?? ""}
                            disabled={!isEnabled}
                            onChange={(event) =>
                              setItemPrice(item.id, event.target.value)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LaundryOnboarding;
