-- TEMPORARY FIX: Disable RLS completely for development
-- This is simpler and will allow all authenticated users full access

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.route_plans DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.route_stops DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.stores DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.sales_visit_route_plans DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.sales_visit_route_stops DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.survey_responses DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Sales can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Drivers view assigned plans" ON public.route_plans;

DROP POLICY IF EXISTS "Admins manage plans" ON public.route_plans;

DROP POLICY IF EXISTS "Sales view all plans" ON public.route_plans;

DROP POLICY IF EXISTS "All users manage plans" ON public.route_plans;

DROP POLICY IF EXISTS "Drivers view stops" ON public.route_stops;

DROP POLICY IF EXISTS "Drivers update stops" ON public.route_stops;

DROP POLICY IF EXISTS "Admins manage stops" ON public.route_stops;

DROP POLICY IF EXISTS "All users manage stops" ON public.route_stops;

DROP POLICY IF EXISTS "Drivers read all orders" ON public.orders;

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;

DROP POLICY IF EXISTS "Sales view orders" ON public.orders;

DROP POLICY IF EXISTS "All users manage orders" ON public.orders;

DROP POLICY IF EXISTS "Drivers read stores" ON public.stores;

DROP POLICY IF EXISTS "Admins manage stores" ON public.stores;

DROP POLICY IF EXISTS "Sales view stores" ON public.stores;

DROP POLICY IF EXISTS "All users manage stores" ON public.stores;

DROP POLICY IF EXISTS "Drivers read vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Drivers update vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Admins manage vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "All users manage vehicles" ON public.vehicles;