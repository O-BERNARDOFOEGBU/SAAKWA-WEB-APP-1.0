-- Onboarding + admin approval workflow and 5km rider assignment constraint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'laundry_houses'
      AND column_name = 'onboarding_status'
  ) THEN
    ALTER TABLE public.laundry_houses
      ADD COLUMN onboarding_status text NOT NULL DEFAULT 'pending'
      CHECK (onboarding_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'laundry_houses'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.laundry_houses
      ADD COLUMN is_active boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'laundry_houses'
      AND column_name = 'onboarding_application_id'
  ) THEN
    ALTER TABLE public.laundry_houses
      ADD COLUMN onboarding_application_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'riders'
      AND column_name = 'onboarding_status'
  ) THEN
    ALTER TABLE public.riders
      ADD COLUMN onboarding_status text NOT NULL DEFAULT 'pending'
      CHECK (onboarding_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'riders'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.riders
      ADD COLUMN is_active boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'riders'
      AND column_name = 'onboarding_application_id'
  ) THEN
    ALTER TABLE public.riders
      ADD COLUMN onboarding_application_id uuid;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.onboarding_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_type text NOT NULL CHECK (applicant_type IN ('laundry_house', 'rider')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_users (user_id)
SELECT au.id
FROM auth.users au
WHERE au.email IN ('bernardofoegbu71@gmail.com')
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.laundry_houses
  ADD CONSTRAINT laundry_houses_onboarding_app_fk
  FOREIGN KEY (onboarding_application_id)
  REFERENCES public.onboarding_applications(id)
  ON DELETE SET NULL;

ALTER TABLE public.riders
  ADD CONSTRAINT riders_onboarding_app_fk
  FOREIGN KEY (onboarding_application_id)
  REFERENCES public.onboarding_applications(id)
  ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = p_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.auto_add_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('bernardofoegbu71@gmail.com') THEN
    INSERT INTO public.admin_users (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_onboarding_application(
  p_application_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS public.onboarding_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.onboarding_applications%ROWTYPE;
BEGIN
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review status %', p_status;
  END IF;

  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can review onboarding applications';
  END IF;

  UPDATE public.onboarding_applications
  SET status = p_status,
      notes = COALESCE(p_notes, notes),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = p_application_id
  RETURNING * INTO v_application;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Onboarding application % not found', p_application_id;
  END IF;

  IF v_application.applicant_type = 'laundry_house' THEN
    UPDATE public.laundry_houses
    SET onboarding_status = p_status,
        is_active = (p_status = 'approved'),
        updated_at = now()
    WHERE onboarding_application_id = v_application.id;
  END IF;

  IF v_application.applicant_type = 'rider' THEN
    UPDATE public.riders
    SET onboarding_status = p_status,
        is_active = (p_status = 'approved'),
        is_available = (p_status = 'approved'),
        updated_at = now()
    WHERE onboarding_application_id = v_application.id;
  END IF;

  RETURN v_application;
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
    AND r.is_active = true
    AND r.onboarding_status = 'approved'
    AND r.current_lat IS NOT NULL
    AND r.current_lng IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(v_target_lat)) *
        cos(radians(r.current_lat)) *
        cos(radians(r.current_lng) - radians(v_target_lng)) +
        sin(radians(v_target_lat)) *
        sin(radians(r.current_lat))
      )
    ) <= 5
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

ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create onboarding applications" ON public.onboarding_applications;
CREATE POLICY "Users can create onboarding applications"
ON public.onboarding_applications
FOR INSERT
WITH CHECK (applicant_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own onboarding applications" ON public.onboarding_applications;
CREATE POLICY "Users can read own onboarding applications"
ON public.onboarding_applications
FOR SELECT
USING (applicant_user_id = auth.uid() OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update onboarding applications" ON public.onboarding_applications;
CREATE POLICY "Admins can update onboarding applications"
ON public.onboarding_applications
FOR UPDATE
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
CREATE POLICY "Admins can read admin users"
ON public.admin_users
FOR SELECT
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
CREATE POLICY "Admins can manage admin users"
ON public.admin_users
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Laundry houses are publicly readable" ON public.laundry_houses;
CREATE POLICY "Laundry houses are publicly readable"
ON public.laundry_houses
FOR SELECT
USING (is_active = true AND onboarding_status = 'approved');

DROP POLICY IF EXISTS "Users can read their rider profile" ON public.riders;
CREATE POLICY "Users can read their rider profile"
ON public.riders
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

DROP TRIGGER IF EXISTS trg_auto_add_admin_user ON auth.users;
CREATE TRIGGER trg_auto_add_admin_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_add_admin_user();
