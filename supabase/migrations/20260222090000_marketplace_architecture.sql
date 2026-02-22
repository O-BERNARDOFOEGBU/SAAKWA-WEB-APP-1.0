-- Marketplace architecture: laundry houses, riders, orders, ratings, realtime events

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'PENDING',
      'RIDER_ASSIGNED',
      'PICKED_UP',
      'AT_LAUNDRY',
      'PROCESSING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.laundry_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  address text NOT NULL,
  geo_lat double precision NOT NULL,
  geo_lng double precision NOT NULL,
  commission_rate numeric(5,2) NOT NULL DEFAULT 12.50,
  turnaround_time_hours integer NOT NULL DEFAULT 48,
  auto_confirm_orders boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laundry_house_id uuid NOT NULL REFERENCES public.laundry_houses(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  base_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (laundry_house_id, service_type)
);

CREATE TABLE IF NOT EXISTS public.riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  current_lat double precision,
  current_lng double precision,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laundry_house_id uuid NOT NULL REFERENCES public.laundry_houses(id) ON DELETE RESTRICT,
  rider_id uuid REFERENCES public.riders(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'PENDING',
  pickup_date date NOT NULL,
  delivery_date date NOT NULL,
  pickup_lat double precision,
  pickup_lng double precision,
  delivery_lat double precision,
  delivery_lng double precision,
  service_cost numeric(10,2) NOT NULL DEFAULT 0,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laundry_house_id uuid NOT NULL REFERENCES public.laundry_houses(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, laundry_house_id)
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  actor_role text,
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rider_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_offerings_laundry_house_id ON public.service_offerings(laundry_house_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_laundry_house_id ON public.orders(laundry_house_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rider_locations_order_id_created_at ON public.rider_locations(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_order_transition(current_status public.order_status, next_status public.order_status)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF current_status = next_status THEN
    RETURN true;
  END IF;

  CASE current_status
    WHEN 'PENDING' THEN
      RETURN next_status IN ('RIDER_ASSIGNED', 'CANCELLED');
    WHEN 'RIDER_ASSIGNED' THEN
      RETURN next_status IN ('PICKED_UP', 'CANCELLED');
    WHEN 'PICKED_UP' THEN
      RETURN next_status = 'AT_LAUNDRY';
    WHEN 'AT_LAUNDRY' THEN
      RETURN next_status = 'PROCESSING';
    WHEN 'PROCESSING' THEN
      RETURN next_status = 'READY';
    WHEN 'READY' THEN
      RETURN next_status = 'OUT_FOR_DELIVERY';
    WHEN 'OUT_FOR_DELIVERY' THEN
      RETURN next_status = 'DELIVERED';
    WHEN 'DELIVERED' THEN
      RETURN false;
    WHEN 'CANCELLED' THEN
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.is_valid_order_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_order_status_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, status, actor_role, actor_id)
    VALUES (NEW.id, NEW.status, 'system', auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, actor_role, actor_id)
    VALUES (NEW.id, NEW.status, 'system', auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_nearest_rider(p_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_target_lat double precision;
  v_target_lng double precision;
  v_rider_id uuid;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_order.status <> 'PENDING' THEN
    RETURN v_order.rider_id;
  END IF;

  SELECT COALESCE(v_order.pickup_lat, lh.geo_lat), COALESCE(v_order.pickup_lng, lh.geo_lng)
  INTO v_target_lat, v_target_lng
  FROM public.laundry_houses lh
  WHERE lh.id = v_order.laundry_house_id;

  SELECT r.id
  INTO v_rider_id
  FROM public.riders r
  WHERE r.is_available = true
    AND r.current_lat IS NOT NULL
    AND r.current_lng IS NOT NULL
  ORDER BY (
    6371 * acos(
      cos(radians(v_target_lat)) *
      cos(radians(r.current_lat)) *
      cos(radians(r.current_lng) - radians(v_target_lng)) +
      sin(radians(v_target_lat)) *
      sin(radians(r.current_lat))
    )
  ) ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_rider_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.orders
  SET rider_id = v_rider_id,
      status = 'RIDER_ASSIGNED'
  WHERE id = p_order_id;

  UPDATE public.riders
  SET is_available = false
  WHERE id = v_rider_id;

  RETURN v_rider_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_order_status(
  p_order_id uuid,
  p_next_status public.order_status,
  p_actor_role text DEFAULT 'system'
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF p_next_status = 'RIDER_ASSIGNED' AND v_order.rider_id IS NULL THEN
    PERFORM public.assign_nearest_rider(v_order.id);
  ELSE
    UPDATE public.orders
    SET status = p_next_status
    WHERE id = p_order_id;
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id;

  IF v_order.rider_id IS NOT NULL AND p_next_status IN ('DELIVERED', 'CANCELLED') THEN
    UPDATE public.riders
    SET is_available = true
    WHERE id = v_order.rider_id;
  END IF;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_confirm_order_if_enabled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auto_confirm boolean;
BEGIN
  SELECT auto_confirm_orders INTO v_auto_confirm
  FROM public.laundry_houses
  WHERE id = NEW.laundry_house_id;

  IF v_auto_confirm THEN
    PERFORM public.assign_nearest_rider(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_laundry_houses_updated_at ON public.laundry_houses;
CREATE TRIGGER trg_laundry_houses_updated_at
BEFORE UPDATE ON public.laundry_houses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_service_offerings_updated_at ON public.service_offerings;
CREATE TRIGGER trg_service_offerings_updated_at
BEFORE UPDATE ON public.service_offerings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_riders_updated_at ON public.riders;
CREATE TRIGGER trg_riders_updated_at
BEFORE UPDATE ON public.riders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON public.ratings;
CREATE TRIGGER trg_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_enforce_order_status_transition ON public.orders;
CREATE TRIGGER trg_enforce_order_status_transition
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_status_transition();

DROP TRIGGER IF EXISTS trg_log_order_status_history ON public.orders;
CREATE TRIGGER trg_log_order_status_history
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_history();

DROP TRIGGER IF EXISTS trg_auto_confirm_order_if_enabled ON public.orders;
CREATE TRIGGER trg_auto_confirm_order_if_enabled
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_order_if_enabled();

ALTER TABLE public.laundry_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_locations ENABLE ROW LEVEL SECURITY;

-- Laundry houses are visible to all users for marketplace comparison.
DROP POLICY IF EXISTS "Laundry houses are publicly readable" ON public.laundry_houses;
CREATE POLICY "Laundry houses are publicly readable"
ON public.laundry_houses
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Laundry owners can manage their houses" ON public.laundry_houses;
CREATE POLICY "Laundry owners can manage their houses"
ON public.laundry_houses
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Service offerings are publicly readable" ON public.service_offerings;
CREATE POLICY "Service offerings are publicly readable"
ON public.service_offerings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Laundry owners can manage service offerings" ON public.service_offerings;
CREATE POLICY "Laundry owners can manage service offerings"
ON public.service_offerings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.laundry_houses lh
    WHERE lh.id = laundry_house_id
      AND lh.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.laundry_houses lh
    WHERE lh.id = laundry_house_id
      AND lh.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can read their rider profile" ON public.riders;
CREATE POLICY "Users can read their rider profile"
ON public.riders
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their rider profile" ON public.riders;
CREATE POLICY "Users can manage their rider profile"
ON public.riders
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Order participants can read orders" ON public.orders;
CREATE POLICY "Order participants can read orders"
ON public.orders
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.laundry_houses lh
    WHERE lh.id = laundry_house_id
      AND lh.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.riders r
    WHERE r.id = rider_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Order participants can update orders" ON public.orders;
CREATE POLICY "Order participants can update orders"
ON public.orders
FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.laundry_houses lh
    WHERE lh.id = laundry_house_id
      AND lh.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.riders r
    WHERE r.id = rider_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.laundry_houses lh
    WHERE lh.id = laundry_house_id
      AND lh.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.riders r
    WHERE r.id = rider_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Ratings are publicly readable" ON public.ratings;
CREATE POLICY "Ratings are publicly readable"
ON public.ratings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create and manage their ratings" ON public.ratings;
CREATE POLICY "Users can create and manage their ratings"
ON public.ratings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Order participants can read status history" ON public.order_status_history;
CREATE POLICY "Order participants can read status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.laundry_houses lh ON lh.id = o.laundry_house_id
    LEFT JOIN public.riders r ON r.id = o.rider_id
    WHERE o.id = order_id
      AND (
        o.user_id = auth.uid()
        OR lh.owner_id = auth.uid()
        OR r.user_id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS "Order participants can read rider locations" ON public.rider_locations;
CREATE POLICY "Order participants can read rider locations"
ON public.rider_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.laundry_houses lh ON lh.id = o.laundry_house_id
    LEFT JOIN public.riders r ON r.id = o.rider_id
    WHERE o.id = order_id
      AND (
        o.user_id = auth.uid()
        OR lh.owner_id = auth.uid()
        OR r.user_id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS "Riders can insert their own locations" ON public.rider_locations;
CREATE POLICY "Riders can insert their own locations"
ON public.rider_locations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.riders r
    WHERE r.id = rider_id
      AND r.user_id = auth.uid()
  )
);
