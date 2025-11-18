import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PaymentStatus = "pending";

export interface ClothingItem {
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BookingsType {
  created_at: string;
  customer_address: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  delivery_time_slot: string;
  id: string;
  payment_status: PaymentStatus;
  pickup_date: string;
  pickup_time_slot: string;
  receipt_url: string | null;
  selected_clothes: ClothingItem[];
  total_amount: number;
  updated_at: string;
  user_id: string;
}

export function useBookings(profileId?: string) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", profileId);

        if (error) throw error;

        setBookings(data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [profileId]);

  return { bookings, loading, error };
}

export function usePaginatedBookings(
  profileId?: string,
  page: number = 1,
  limit: number = 10
) {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);

      try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, error, count } = await supabase
          .from("bookings")
          .select("*", { count: "exact" }) // enables total count
          .eq("user_id", profileId)
          .range(from, to)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setBookings(data || []);
        setTotal(count || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [profileId, page, limit]);

  return {
    bookings,
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
    loading,
    error,
  };
}
