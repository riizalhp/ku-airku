-- FIX RLS FOR DELIVERY ROUTES & STOPS

-- 1. ROUTE PLANS
ALTER TABLE public.route_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers view assigned plans" ON public.route_plans;
CREATE POLICY "Drivers view assigned plans" ON public.route_plans 
FOR SELECT USING (
  auth.uid() = driver_id
);

DROP POLICY IF EXISTS "Admins manage plans" ON public.route_plans;
CREATE POLICY "Admins manage plans" ON public.route_plans 
FOR ALL USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('Admin', 'Super Admin')
);

-- 2. ROUTE STOPS
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers view stops" ON public.route_stops;
CREATE POLICY "Drivers view stops" ON public.route_stops 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.route_plans rp 
    WHERE rp.id = public.route_stops.route_plan_id  -- FIXED COLUMN NAME
    AND rp.driver_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Drivers update stops" ON public.route_stops;
CREATE POLICY "Drivers update stops" ON public.route_stops 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.route_plans rp 
    WHERE rp.id = public.route_stops.route_plan_id  -- FIXED COLUMN NAME
    AND rp.driver_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins manage stops" ON public.route_stops;
CREATE POLICY "Admins manage stops" ON public.route_stops 
FOR ALL USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('Admin', 'Super Admin')
);

-- 3. ORDERS (Ensure Drivers can read orders they are delivering)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers read all orders" ON public.orders;
CREATE POLICY "Drivers read all orders" ON public.orders FOR SELECT USING (true);
