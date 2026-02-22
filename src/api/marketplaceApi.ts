import { supabase } from "@/integrations/supabase/client";
import type {
  LaundryComparisonItem,
  LaundryHouse,
  MarketplaceOrder,
  OrderStatus,
  OrderStatusHistory,
  Rider,
  RiderLocation,
  ServiceOffering,
} from "@/features/marketplace/types";
import { haversineDistanceKm } from "@/utils/haversine";

const db = supabase as any;

export interface CreateMarketplaceOrderInput {
  userId: string;
  laundryHouseId: string;
  pickupDate: string;
  deliveryDate: string;
  serviceCost: number;
  commissionAmount: number;
  deliveryFee: number;
  totalPrice: number;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

export async function listLaundryComparisonItems(params: {
  userLat: number;
  userLng: number;
  serviceType?: string;
}): Promise<LaundryComparisonItem[]> {
  // Pull datasets in parallel to keep comparison page fast on first paint.
  const laundryQuery = db
    .from("laundry_houses")
    .select("*")
    .eq("is_active", true)
    .eq("onboarding_status", "approved");
  const offeringsQuery = db.from("service_offerings").select("*");
  const ratingsQuery = db.from("ratings").select("laundry_house_id, score");

  const [{ data: laundries, error: laundryError }, { data: offerings, error: offeringsError }, { data: ratings, error: ratingsError }] =
    await Promise.all([laundryQuery, offeringsQuery, ratingsQuery]);

  if (laundryError) throw laundryError;
  if (offeringsError) throw offeringsError;
  if (ratingsError) throw ratingsError;

  const serviceFilter = params.serviceType?.trim().toLowerCase();

  return (laundries as LaundryHouse[])
    .map((laundry) => {
      const laundryOfferings = (offerings as ServiceOffering[]).filter(
        (offering) => offering.laundry_house_id === laundry.id
      );
      const laundryRatings = (ratings as { laundry_house_id: string; score: number }[]).filter(
        (rating) => rating.laundry_house_id === laundry.id
      );

      const averagePrice = laundryOfferings.length
        ? laundryOfferings.reduce((sum, item) => sum + Number(item.base_price), 0) /
          laundryOfferings.length
        : 0;

      const averageRating = laundryRatings.length
        ? laundryRatings.reduce((sum, item) => sum + item.score, 0) /
          laundryRatings.length
        : 0;

      return {
        laundryHouse: laundry,
        offerings: laundryOfferings,
        averagePrice,
        averageRating,
        ratingCount: laundryRatings.length,
        distanceKm: haversineDistanceKm(
          params.userLat,
          params.userLng,
          laundry.geo_lat,
          laundry.geo_lng
        ),
      };
    })
    .filter((item) => {
      if (!serviceFilter) return true;
      return item.offerings.some(
        (offering) => offering.service_type.toLowerCase() === serviceFilter
      );
    });
}

export async function createMarketplaceOrder(
  payload: CreateMarketplaceOrderInput
): Promise<MarketplaceOrder> {
  const { data, error } = await db
    .from("orders")
    .insert({
      user_id: payload.userId,
      laundry_house_id: payload.laundryHouseId,
      pickup_date: payload.pickupDate,
      delivery_date: payload.deliveryDate,
      service_cost: payload.serviceCost,
      commission_amount: payload.commissionAmount,
      delivery_fee: payload.deliveryFee,
      total_price: payload.totalPrice,
      pickup_lat: payload.pickupLat ?? null,
      pickup_lng: payload.pickupLng ?? null,
      delivery_lat: payload.deliveryLat ?? null,
      delivery_lng: payload.deliveryLng ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MarketplaceOrder;
}

export async function fetchOrderById(orderId: string): Promise<MarketplaceOrder> {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data as MarketplaceOrder;
}

export async function fetchOrderStatusHistory(
  orderId: string
): Promise<OrderStatusHistory[]> {
  const { data, error } = await db
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as OrderStatusHistory[];
}

export async function transitionOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actorRole: "user" | "laundry" | "rider" | "system"
): Promise<MarketplaceOrder> {
  const { data, error } = await db.rpc("transition_order_status", {
    p_order_id: orderId,
    p_next_status: nextStatus,
    p_actor_role: actorRole,
  });

  if (error) throw error;

  if (!data) {
    return fetchOrderById(orderId);
  }

  return data as MarketplaceOrder;
}

export async function assignNearestRider(orderId: string): Promise<string | null> {
  const { data, error } = await db.rpc("assign_nearest_rider", {
    p_order_id: orderId,
  });

  if (error) throw error;
  return data ?? null;
}

export async function fetchLaundryOrdersForCurrentUser(): Promise<MarketplaceOrder[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data: laundries, error: laundryError } = await db
    .from("laundry_houses")
    .select("id")
    .eq("owner_id", user.id);

  if (laundryError) throw laundryError;

  const ids = (laundries ?? []).map((entry: { id: string }) => entry.id);
  if (!ids.length) return [];

  const { data: orders, error: ordersError } = await db
    .from("orders")
    .select("*")
    .in("laundry_house_id", ids)
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;
  return (orders ?? []) as MarketplaceOrder[];
}

export async function fetchRiderOrdersForCurrentUser(): Promise<MarketplaceOrder[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data: rider, error: riderError } = await db
    .from("riders")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (riderError) throw riderError;
  if (!rider) return [];

  const { data: orders, error: orderError } = await db
    .from("orders")
    .select("*")
    .eq("rider_id", rider.id)
    .in("status", ["RIDER_ASSIGNED", "PICKED_UP", "AT_LAUNDRY", "READY", "OUT_FOR_DELIVERY"])
    .order("updated_at", { ascending: false });

  if (orderError) throw orderError;
  return (orders ?? []) as MarketplaceOrder[];
}

export async function fetchCurrentUserRider(): Promise<Rider | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await db
    .from("riders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Rider) ?? null;
}

export async function pushRiderLocation(params: {
  orderId: string;
  riderId: string;
  lat: number;
  lng: number;
}): Promise<void> {
  const locationInsert = db.from("rider_locations").insert({
    order_id: params.orderId,
    rider_id: params.riderId,
    lat: params.lat,
    lng: params.lng,
  });

  const riderUpdate = db
    .from("riders")
    .update({
      current_lat: params.lat,
      current_lng: params.lng,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.riderId);

  const [{ error: locationError }, { error: riderError }] = await Promise.all([
    locationInsert,
    riderUpdate,
  ]);

  if (locationError) throw locationError;
  if (riderError) throw riderError;
}

export async function fetchLatestRiderLocation(
  orderId: string
): Promise<RiderLocation | null> {
  const { data, error } = await db
    .from("rider_locations")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as RiderLocation) ?? null;
}

export async function submitLaundryOnboarding(input: {
  ownerId: string;
  name: string;
  address: string;
  geoLat: number;
  geoLng: number;
  commissionRate: number;
  turnaroundTimeHours: number;
  autoConfirmOrders: boolean;
  services: Array<{
    serviceId: string;
    serviceType: string;
    category: string;
    image: string;
    suggestedPrice: number;
    basePrice: number;
  }>;
}): Promise<void> {
  const { data: application, error: appError } = await db
    .from("onboarding_applications")
    .insert({
      applicant_user_id: input.ownerId,
      applicant_type: "laundry_house",
      payload: {
        name: input.name,
        address: input.address,
        geo_lat: input.geoLat,
        geo_lng: input.geoLng,
        services: input.services,
      },
    })
    .select("id")
    .single();

  if (appError) throw appError;

  const { data: laundryHouse, error: houseError } = await db
    .from("laundry_houses")
    .insert({
      owner_id: input.ownerId,
      name: input.name,
      address: input.address,
      geo_lat: input.geoLat,
      geo_lng: input.geoLng,
      commission_rate: input.commissionRate,
      turnaround_time_hours: input.turnaroundTimeHours,
      auto_confirm_orders: input.autoConfirmOrders,
      onboarding_status: "pending",
      is_active: false,
      onboarding_application_id: application.id,
    })
    .select("id")
    .single();

  if (houseError) throw houseError;

  if (input.services.length) {
    const uniqueServices = Array.from(
      new Map(input.services.map((service) => [service.serviceId, service])).values()
    );

    const { error: serviceError } = await db.from("service_offerings").insert(
      uniqueServices.map((service) => ({
        laundry_house_id: laundryHouse.id,
        service_type: service.serviceType,
        base_price: service.basePrice,
      }))
    );
    if (serviceError) throw serviceError;
  }
}

export async function submitRiderOnboarding(input: {
  userId: string;
  name: string;
  phone: string;
  currentLat: number;
  currentLng: number;
}): Promise<void> {
  const { data: application, error: appError } = await db
    .from("onboarding_applications")
    .insert({
      applicant_user_id: input.userId,
      applicant_type: "rider",
      payload: {
        name: input.name,
        phone: input.phone,
        current_lat: input.currentLat,
        current_lng: input.currentLng,
      },
    })
    .select("id")
    .single();

  if (appError) throw appError;

  const { error } = await db.from("riders").upsert(
    {
      user_id: input.userId,
      name: input.name,
      phone: input.phone,
      current_lat: input.currentLat,
      current_lng: input.currentLng,
      is_available: false,
      onboarding_status: "pending",
      is_active: false,
      onboarding_application_id: application.id,
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

export async function listPendingOnboardingApplications() {
  const { data, error } = await db
    .from("onboarding_applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function reviewOnboardingApplication(
  applicationId: string,
  status: "approved" | "rejected",
  notes?: string
): Promise<void> {
  const { error } = await db.rpc("review_onboarding_application", {
    p_application_id: applicationId,
    p_status: status,
    p_notes: notes ?? null,
  });

  if (error) throw error;
}

export function subscribeToOrderStatus(
  orderId: string,
  onChange: (order: MarketplaceOrder) => void
) {
  // Realtime channel keeps tracking page aligned with SQL-enforced state transitions.
  return supabase
    .channel(`order-status-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          onChange(payload.new as MarketplaceOrder);
        }
      }
    )
    .subscribe();
}

export function subscribeToRiderLocations(
  orderId: string,
  onChange: (location: RiderLocation) => void
) {
  // GPS events are append-only records so users can receive progressive location updates.
  return supabase
    .channel(`rider-locations-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "rider_locations",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          onChange(payload.new as RiderLocation);
        }
      }
    )
    .subscribe();
}
