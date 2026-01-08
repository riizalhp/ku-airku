-- Complete RLS Fix for Driver Access
-- Run this script in Supabase SQL Editor

-- 1. USERS TABLE - Allow users to read their own profile and all authenticated users can read all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Sales can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

-- Simple policy: All authenticated users can read all profiles (needed for app functionality)
CREATE POLICY "Authenticated users can view all profiles" ON public.users FOR
SELECT USING (auth.uid () IS NOT NULL);

-- 2. ROUTE PLANS - Allow all authenticated users to view and manage
DROP POLICY IF EXISTS "Drivers view assigned plans" ON public.route_plans;

DROP POLICY IF EXISTS "Admins manage plans" ON public.route_plans;

DROP POLICY IF EXISTS "Sales view all plans" ON public.route_plans;

DROP POLICY IF EXISTS "All users manage plans" ON public.route_plans;

-- Allow all authenticated users to manage route plans
CREATE POLICY "All users manage plans" ON public.route_plans FOR ALL USING (auth.uid () IS NOT NULL);

-- 3. ROUTE STOPS - Allow all authenticated users to manage
DROP POLICY IF EXISTS "Drivers view stops" ON public.route_stops;

DROP POLICY IF EXISTS "Drivers update stops" ON public.route_stops;

DROP POLICY IF EXISTS "Admins manage stops" ON public.route_stops;

DROP POLICY IF EXISTS "All users manage stops" ON public.route_stops;

-- Allow all authenticated users to manage stops
CREATE POLICY "All users manage stops" ON public.route_stops FOR ALL USING (auth.uid () IS NOT NULL);

-- 4. ORDERS - Allow all authenticated users to manage
DROP POLICY IF EXISTS "Drivers read all orders" ON public.orders;

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;

DROP POLICY IF EXISTS "Sales view orders" ON public.orders;

DROP POLICY IF EXISTS "All users manage orders" ON public.orders;

-- Allow all authenticated users to manage orders
CREATE POLICY "All users manage orders" ON public.orders FOR ALL USING (auth.uid () IS NOT NULL);

-- 5. STORES - Allow all authenticated users to manage
DROP POLICY IF EXISTS "Drivers read stores" ON public.stores;

DROP POLICY IF EXISTS "Admins manage stores" ON public.stores;

DROP POLICY IF EXISTS "Sales view stores" ON public.stores;

DROP POLICY IF EXISTS "All users manage stores" ON public.stores;

-- Allow all authenticated users to manage stores
CREATE POLICY "All users manage stores" ON public.stores FOR ALL USING (auth.uid () IS NOT NULL);

-- 6. VEHICLES - Allow all authenticated users to manage
DROP POLICY IF EXISTS "Drivers read vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Drivers update vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Admins manage vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "All users manage vehicles" ON public.vehicles;

-- Allow all authenticated users to manage vehicles
CREATE POLICY "All users manage vehicles" ON public.vehicles FOR ALL USING (auth.uid () IS NOT NULL);