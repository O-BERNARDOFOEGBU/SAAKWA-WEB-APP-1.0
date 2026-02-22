export type OrderStatus =
  | "PENDING"
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "AT_LAUNDRY"
  | "PROCESSING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface LaundryHouse {
  id: string;
  owner_id: string | null;
  name: string;
  address: string;
  geo_lat: number;
  geo_lng: number;
  commission_rate: number;
  turnaround_time_hours: number;
  auto_confirm_orders: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceOffering {
  id: string;
  laundry_house_id: string;
  service_type: string;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface Rider {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  current_lat: number | null;
  current_lng: number | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceOrder {
  id: string;
  user_id: string;
  laundry_house_id: string;
  rider_id: string | null;
  status: OrderStatus;
  pickup_date: string;
  delivery_date: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  service_cost: number;
  total_price: number;
  delivery_fee: number;
  commission_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  laundry_house_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  actor_role: string | null;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RiderLocation {
  id: string;
  order_id: string;
  rider_id: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface PriceBreakdown {
  service_cost: number;
  commission: number;
  delivery_fee: number;
  total: number;
}

export interface LaundryComparisonItem {
  laundryHouse: LaundryHouse;
  offerings: ServiceOffering[];
  averagePrice: number;
  averageRating: number;
  ratingCount: number;
  distanceKm: number;
}
